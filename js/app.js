// ========== 星露谷资源管理器 主应用 ==========

const app = {
  // ---- 数据 ----
  data: {
    projects: [],     // { id, name, creator, targetItem, quantity, ingredients: {name: qty}, note, status, createdAt, completedAt }
    inventory: {},    // { resourceName: quantity }
    members: [],      // ["name1", "name2"]
  },
  github: null,       // { repo, branch, token }
  nickname: '',       // 当前用户昵称
  showCompleted: false,
  _syncTimer: null,

  // ==================== 初始化 ====================
  init() {
    this.loadLocal();
    this.loadNickname();
    this.checkUrlConfig();  // 从 URL hash 读取邀请链接配置
    this.loadGitHubConfig();
    this.bindTabs();
    this.bindClickOutside();
    this.renderAll();
    this.renderInviteLink();
    // 显示昵称
    this.updateNicknameDisplay();
    // 如果没有昵称，弹出欢迎弹窗
    if (!this.nickname) {
      this.openModal('welcomeModal');
    }
    // 如果配置了 GitHub，启动自动同步
    if (this.github) {
      this.startAutoSync();
    }
  },

  // ==================== 昵称系统 ====================
  loadNickname() {
    this.nickname = localStorage.getItem('xlg_nickname') || '';
  },

  saveNickname() {
    const input = document.getElementById('welcomeName');
    const name = input.value.trim();
    if (!name) { this.toast('请输入昵称'); return; }
    this.nickname = name;
    localStorage.setItem('xlg_nickname', name);
    // 自动加入成员列表
    if (!this.data.members.includes(name)) {
      this.data.members.push(name);
      this.save();
    }
    this.closeModal('welcomeModal');
    this.updateNicknameDisplay();
    this.renderAll();
    this.toast(`欢迎, ${name}!`);
  },

  updateNickname() {
    const input = document.getElementById('settingsNickname');
    const name = input.value.trim();
    if (!name) { this.toast('昵称不能为空'); return; }
    this.nickname = name;
    localStorage.setItem('xlg_nickname', name);
    if (!this.data.members.includes(name)) {
      this.data.members.push(name);
      this.save();
    }
    this.updateNicknameDisplay();
    this.renderAll();
    this.toast('昵称已更新');
  },

  changeNickname() {
    const name = prompt('修改昵称:', this.nickname);
    if (name && name.trim()) {
      this.nickname = name.trim();
      localStorage.setItem('xlg_nickname', this.nickname);
      if (!this.data.members.includes(this.nickname)) {
        this.data.members.push(this.nickname);
        this.save();
      }
      this.updateNicknameDisplay();
      this.renderAll();
    }
  },

  updateNicknameDisplay() {
    const el = document.getElementById('nicknameDisplay');
    if (el) el.textContent = this.nickname ? `Hi, ${this.nickname}` : '';
    const input = document.getElementById('settingsNickname');
    if (input) input.value = this.nickname;
  },

  // ==================== URL 邀请链接 ====================
  checkUrlConfig() {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#invite=')) return;
    try {
      const encoded = hash.slice('#invite='.length);
      const json = decodeURIComponent(atob(encoded));
      const config = JSON.parse(json);
      if (config.repo && config.token) {
        this.github = {
          repo: config.repo,
          branch: config.branch || 'main',
          token: config.token
        };
        localStorage.setItem('xlg_github', JSON.stringify(this.github));
        // 清除 URL hash（不触发跳转）
        history.replaceState(null, '', window.location.pathname + window.location.search);
        this.toast('团队配置已自动完成！');
      }
    } catch (e) {
      console.error('解析邀请链接失败', e);
    }
  },

  generateInviteLink() {
    if (!this.github) {
      this.toast('请先配置 GitHub 同步');
      return;
    }
    const config = {
      repo: this.github.repo,
      branch: this.github.branch,
      token: this.github.token
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(config)));
    // 用当前页面 URL 作为基础
    const base = window.location.origin + window.location.pathname;
    const link = `${base}#invite=${encoded}`;
    return link;
  },

  copyInviteLink() {
    const link = this.generateInviteLink();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.toast('邀请链接已复制！发给队友即可');
    }).catch(() => {
      // fallback
      prompt('复制以下链接发给队友:', link);
    });
  },

  renderInviteLink() {
    const container = document.getElementById('inviteLinkActions');
    if (!container) return;
    if (this.github) {
      container.innerHTML = `
        <button class="btn btn-primary" onclick="app.copyInviteLink()">复制邀请链接</button>
        <p class="settings-info" style="margin-top:8px;">把链接发给队友，他们打开后输入昵称就能用，不需要任何账号。</p>
      `;
    } else {
      container.innerHTML = `<p class="settings-info">请先在下方配置 GitHub 同步</p>`;
    }
  },

  // ==================== Tab 切换 ====================
  bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        // 切到总览时刷新
        if (tab.dataset.tab === 'dashboard') this.renderDashboard();
      });
    });
  },

  // ==================== 本地存储 ====================
  loadLocal() {
    try {
      const saved = localStorage.getItem('xlg_data');
      if (saved) {
        this.data = JSON.parse(saved);
        // 兼容旧数据
        if (!this.data.members) this.data.members = [];
      }
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  },

  saveLocal() {
    localStorage.setItem('xlg_data', JSON.stringify(this.data));
  },

  // ==================== 渲染 ====================
  renderAll() {
    this.renderProjects();
    this.renderInventory();
    this.renderDashboard();
    this.renderMembers();
    this.renderMemberSelects();
  },

  // ---- 项目列表 ----
  renderProjects() {
    const active = this.data.projects.filter(p => p.status === 'active');
    const completed = this.data.projects.filter(p => p.status === 'completed');

    const container = document.getElementById('projectList');
    if (active.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📋</div>
          <p>还没有活跃项目，点击"新建项目"开始</p>
        </div>`;
    } else {
      container.innerHTML = `<div class="grid-2">${active.map(p => this.renderProjectCard(p)).join('')}</div>`;
    }

    document.getElementById('completedCount').textContent = completed.length;
    const completedContainer = document.getElementById('completedList');
    completedContainer.innerHTML = completed.length === 0
      ? '<p style="color:var(--text-light);font-size:14px;padding:8px 0;">暂无已完成项目</p>'
      : `<div class="grid-2">${completed.map(p => this.renderProjectCard(p)).join('')}</div>`;
  },

  renderProjectCard(p) {
    const isCompleted = p.status === 'completed';
    const ingredients = p.ingredients || {};
    const inv = this.data.inventory;

    // 计算资源需求标签
    let ingTags = '';
    for (const [name, need] of Object.entries(ingredients)) {
      const have = inv[name] || 0;
      let cls = 'none';
      if (have >= need) cls = 'sufficient';
      else if (have > 0) cls = 'partial';
      ingTags += `<span class="ing-tag ${cls}">${name} ${have}/${need}</span>`;
    }

    return `
      <div class="card" style="${isCompleted ? 'opacity:0.6' : ''}">
        <div class="card-header">
          <div class="card-title">
            <label class="checkbox-wrap">
              <input type="checkbox" ${isCompleted ? 'checked' : ''}
                onchange="app.toggleProject('${p.id}')">
            </label>
            <span style="${isCompleted ? 'text-decoration:line-through' : ''}">${this.escapeHtml(p.name)}</span>
            ${p.quantity > 1 ? `<span style="color:var(--accent);font-size:14px;">x${p.quantity}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="project-status ${p.status}">${isCompleted ? '已完成' : '进行中'}</span>
            <button class="btn-icon" onclick="app.deleteProject('${p.id}')" title="删除">🗑️</button>
          </div>
        </div>
        ${p.creator ? `<div class="card-meta">负责人: ${this.escapeHtml(p.creator)}</div>` : ''}
        ${p.note ? `<div class="card-meta" style="margin-top:2px;">${this.escapeHtml(p.note)}</div>` : ''}
        ${!isCompleted && ingTags ? `<div class="project-ingredients">${ingTags}</div>` : ''}
        ${isCompleted && p.completedAt ? `<div class="card-meta" style="margin-top:4px;">完成于 ${new Date(p.completedAt).toLocaleString('zh-CN')}</div>` : ''}
      </div>`;
  },

  // ---- 库存列表 ----
  renderInventory() {
    const search = (document.getElementById('invSearch')?.value || '').toLowerCase();
    const inv = this.data.inventory;
    const container = document.getElementById('inventoryList');

    const items = Object.entries(inv).filter(([name]) =>
      name.toLowerCase().includes(search)
    ).sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));

    if (items.length === 0 && Object.keys(inv).length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📦</div>
          <p>库存为空，点击"添加资源"录入团队资源</p>
        </div>`;
      return;
    }

    if (items.length === 0) {
      container.innerHTML = '<p style="color:var(--text-light);font-size:14px;padding:16px 0;">没有匹配的资源</p>';
      return;
    }

    // 按分类分组
    const grouped = {};
    const ungrouped = [];

    for (const [name, qty] of items) {
      let found = false;
      for (const [cat, resources] of Object.entries(RESOURCE_CATEGORIES)) {
        if (resources.includes(name)) {
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push([name, qty]);
          found = true;
          break;
        }
      }
      if (!found) ungrouped.push([name, qty]);
    }

    let html = '';
    for (const [cat, resources] of Object.entries(grouped)) {
      html += `<div class="inv-category">
        <div class="inv-category-title">${cat}</div>
        <div class="resource-list">
          ${resources.map(([name, qty]) => this.renderInventoryItem(name, qty)).join('')}
        </div>
      </div>`;
    }
    if (ungrouped.length > 0) {
      html += `<div class="inv-category">
        <div class="inv-category-title">其他</div>
        <div class="resource-list">
          ${ungrouped.map(([name, qty]) => this.renderInventoryItem(name, qty)).join('')}
        </div>
      </div>`;
    }

    container.innerHTML = html;
  },

  renderInventoryItem(name, qty) {
    return `
      <div class="resource-item">
        <span class="resource-name">${this.escapeHtml(name)}</span>
        <div class="resource-qty">
          <button class="btn-icon" onclick="app.changeInventory('${this.escapeAttr(name)}', -1)">-</button>
          <input type="number" value="${qty}" min="0"
            onchange="app.setInventory('${this.escapeAttr(name)}', parseInt(this.value)||0)"
            onblur="app.setInventory('${this.escapeAttr(name)}', parseInt(this.value)||0)">
          <button class="btn-icon" onclick="app.changeInventory('${this.escapeAttr(name)}', 1)">+</button>
          <button class="btn-icon" onclick="app.removeInventory('${this.escapeAttr(name)}')" title="移除">🗑️</button>
        </div>
      </div>`;
  },

  // ---- 总览面板 ----
  renderDashboard() {
    const active = this.data.projects.filter(p => p.status === 'active');
    const container = document.getElementById('dashboardList');

    if (active.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📊</div>
          <p>没有活跃项目，无需查看资源缺口</p>
        </div>`;
      return;
    }

    // 汇总所有活跃项目的资源需求
    const totalNeed = {};
    for (const p of active) {
      for (const [name, qty] of Object.entries(p.ingredients || {})) {
        totalNeed[name] = (totalNeed[name] || 0) + qty;
      }
    }

    const inv = this.data.inventory;
    const items = Object.entries(totalNeed).sort((a, b) => {
      // 缺口大的排前面
      const gapA = a[1] - (inv[a[0]] || 0);
      const gapB = b[1] - (inv[b[0]] || 0);
      return gapB - gapA;
    });

    let html = '<div class="dashboard-grid">';
    for (const [name, need] of items) {
      const have = inv[name] || 0;
      const pct = Math.min(100, Math.round((have / need) * 100));
      let cls = 'none';
      if (have >= need) cls = 'sufficient';
      else if (have > 0) cls = 'partial';

      const gap = Math.max(0, need - have);

      html += `
        <div class="gap-item">
          <span class="gap-name" title="${this.escapeHtml(name)}">${this.escapeHtml(name)}</span>
          <div class="gap-bar-wrap">
            <div class="gap-bar ${cls}" style="width:${pct}%"></div>
          </div>
          <span class="gap-numbers">
            <span class="has">${have}</span>
            <span class="need"> / ${need}</span>
            ${gap > 0 ? `<span style="color:var(--red);margin-left:4px;">(-${gap})</span>` : ''}
          </span>
        </div>`;
    }
    html += '</div>';

    container.innerHTML = html;
  },

  // ---- 成员列表 ----
  renderMembers() {
    const container = document.getElementById('memberList');
    if (!container) return;
    if (this.data.members.length === 0) {
      container.innerHTML = '<p style="color:var(--text-light);font-size:13px;">暂无成员</p>';
      return;
    }
    container.innerHTML = this.data.members.map(m => `
      <div class="resource-item" style="margin-bottom:4px;">
        <span>${this.escapeHtml(m)}</span>
        <button class="btn-icon" onclick="app.removeMember('${this.escapeAttr(m)}')">🗑️</button>
      </div>
    `).join('');
  },

  renderMemberSelects() {
    const selects = ['projCreator', 'customProjCreator'];
    for (const id of selects) {
      const sel = document.getElementById(id);
      if (!sel) continue;
      const val = sel.value;
      sel.innerHTML = '<option value="">选择成员...</option>' +
        this.data.members.map(m => `<option value="${this.escapeAttr(m)}">${this.escapeHtml(m)}</option>`).join('');
      sel.value = val;
    }
  },

  // ==================== 项目操作 ====================
  openNewProject() {
    this.renderMemberSelects();
    document.getElementById('projItem').value = '';
    document.getElementById('projQty').value = '1';
    document.getElementById('projNote').value = '';
    document.getElementById('ingredientPreview').innerHTML = '';
    // 默认选中当前用户
    const sel = document.getElementById('projCreator');
    if (sel && this.nickname) sel.value = this.nickname;
    this.openModal('projectModal');
  },

  onItemSearch(query) {
    const dropdown = document.getElementById('itemDropdown');
    const q = query.toLowerCase().trim();

    if (!q) {
      // 显示所有
      const all = Object.entries(RECIPES);
      this.showItemDropdown(dropdown, all.slice(0, 20));
      return;
    }

    const matches = Object.entries(RECIPES).filter(([name]) =>
      name.toLowerCase().includes(q)
    );
    this.showItemDropdown(dropdown, matches.slice(0, 15));
  },

  showItemDropdown(dropdown, items) {
    if (items.length === 0) {
      // 显示自定义选项
      dropdown.innerHTML = `
        <div class="autocomplete-item" onclick="app.selectCustomProject()">
          <span>📝 自定义项目...</span>
        </div>`;
    } else {
      dropdown.innerHTML = items.map(([name, recipe]) => `
        <div class="autocomplete-item" onclick="app.selectItem('${this.escapeAttr(name)}')">
          <span>${recipe.icon} ${this.escapeHtml(name)}</span>
          <span class="cat">${CATEGORY_NAMES[recipe.category] || recipe.category}</span>
        </div>
      `).join('') + `
        <div class="autocomplete-item" onclick="app.selectCustomProject()" style="border-top:1px solid var(--border);">
          <span>📝 自定义项目...</span>
        </div>`;
    }
    dropdown.classList.add('show');
  },

  selectItem(name) {
    document.getElementById('projItem').value = name;
    document.getElementById('itemDropdown').classList.remove('show');
    this.updateIngredientPreview(name);
  },

  selectCustomProject() {
    document.getElementById('itemDropdown').classList.remove('show');
    this.closeModal('projectModal');
    // 打开自定义项目 modal
    this.renderMemberSelects();
    document.getElementById('customProjName').value = '';
    document.getElementById('customProjNote').value = '';
    document.getElementById('customIngredients').innerHTML =
      '<label style="font-size:13px;font-weight:500;color:var(--text-light);margin-bottom:8px;display:block;">所需资源</label>';
    this.addCustomIngredient();
    // 默认选中当前用户
    const sel = document.getElementById('customProjCreator');
    if (sel && this.nickname) sel.value = this.nickname;
    this.openModal('customProjectModal');
  },

  addCustomIngredient() {
    const container = document.getElementById('customIngredients');
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.marginBottom = '8px';
    row.innerHTML = `
      <div class="form-group" style="margin-bottom:0;flex:2">
        <input type="text" class="form-control custom-ing-name" placeholder="资源名称">
      </div>
      <div class="form-group" style="margin-bottom:0;flex:1">
        <input type="number" class="form-control custom-ing-qty" placeholder="数量" value="1" min="1">
      </div>
      <button class="btn-icon" onclick="this.parentElement.remove()" style="flex-shrink:0;">🗑️</button>
    `;
    container.appendChild(row);
  },

  createCustomProject() {
    const name = document.getElementById('customProjName').value.trim();
    const creator = document.getElementById('customProjCreator').value;
    const note = document.getElementById('customProjNote').value.trim();

    if (!name) { this.toast('请输入项目名称'); return; }

    const ingredients = {};
    const names = document.querySelectorAll('.custom-ing-name');
    const qtys = document.querySelectorAll('.custom-ing-qty');
    names.forEach((el, i) => {
      const n = el.value.trim();
      const q = parseInt(qtys[i].value) || 0;
      if (n && q > 0) ingredients[n] = q;
    });

    const project = {
      id: this.genId(),
      name,
      creator,
      targetItem: null,
      quantity: 1,
      ingredients,
      note,
      status: 'active',
      createdAt: Date.now(),
      completedAt: null
    };

    this.data.projects.push(project);
    this.save();
    this.closeModal('customProjectModal');
    this.renderAll();
    this.toast('自定义项目已创建');
  },

  updateIngredientPreview(itemName) {
    const recipe = RECIPES[itemName];
    const container = document.getElementById('ingredientPreview');
    if (!recipe) {
      container.innerHTML = '';
      return;
    }

    const qty = parseInt(document.getElementById('projQty').value) || 1;
    let rows = '';
    for (const [name, amount] of Object.entries(recipe.ingredients)) {
      rows += `<div class="ing-row"><span>${name}</span><span class="qty">${amount * qty}</span></div>`;
    }

    container.innerHTML = `
      <div class="ingredient-preview">
        <h4>所需资源 (x${qty})</h4>
        ${rows}
      </div>`;
  },

  createProject() {
    const itemName = document.getElementById('projItem').value.trim();
    const qty = parseInt(document.getElementById('projQty').value) || 1;
    const creator = document.getElementById('projCreator').value;
    const note = document.getElementById('projNote').value.trim();

    if (!itemName) { this.toast('请选择目标物品'); return; }

    const recipe = RECIPES[itemName];
    if (!recipe) { this.toast('未找到该物品的配方'); return; }

    // 计算总资源需求
    const ingredients = {};
    for (const [name, amount] of Object.entries(recipe.ingredients)) {
      ingredients[name] = amount * qty;
    }

    const project = {
      id: this.genId(),
      name: `${recipe.icon} ${itemName}`,
      creator,
      targetItem: itemName,
      quantity: qty,
      ingredients,
      note,
      status: 'active',
      createdAt: Date.now(),
      completedAt: null
    };

    this.data.projects.push(project);
    this.save();
    this.closeModal('projectModal');
    this.renderAll();
    this.toast('项目已创建');
  },

  toggleProject(id) {
    const p = this.data.projects.find(p => p.id === id);
    if (!p) return;
    if (p.status === 'active') {
      p.status = 'completed';
      p.completedAt = Date.now();
    } else {
      p.status = 'active';
      p.completedAt = null;
    }
    this.save();
    this.renderAll();
  },

  deleteProject(id) {
    if (!confirm('确定要删除这个项目吗？')) return;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.save();
    this.renderAll();
    this.toast('项目已删除');
  },

  toggleCompleted() {
    this.showCompleted = !this.showCompleted;
    document.getElementById('completedList').style.display = this.showCompleted ? 'block' : 'none';
    document.getElementById('completedArrow').textContent = this.showCompleted ? '▼' : '▶';
  },

  // ==================== 库存操作 ====================
  openAddResource() {
    document.getElementById('resName').value = '';
    document.getElementById('resQty').value = '1';
    this.openModal('resourceModal');
  },

  onResourceSearch(query) {
    const dropdown = document.getElementById('resDropdown');
    const q = query.toLowerCase().trim();
    const allRes = getAllResources();

    let matches;
    if (!q) {
      matches = allRes.slice(0, 20);
    } else {
      matches = allRes.filter(r => r.toLowerCase().includes(q));
    }

    dropdown.innerHTML = matches.map(name => `
      <div class="autocomplete-item" onclick="app.selectResource('${this.escapeAttr(name)}')">
        ${this.escapeHtml(name)}
      </div>
    `).join('');

    // 允许自定义资源
    if (q && !allRes.includes(q)) {
      dropdown.innerHTML += `
        <div class="autocomplete-item" onclick="app.selectResource('${this.escapeAttr(q)}')" style="border-top:1px solid var(--border);">
          + 添加自定义: "${this.escapeHtml(q)}"
        </div>`;
    }

    dropdown.classList.add('show');
  },

  selectResource(name) {
    document.getElementById('resName').value = name;
    document.getElementById('resDropdown').classList.remove('show');
  },

  addResource() {
    const name = document.getElementById('resName').value.trim();
    const qty = parseInt(document.getElementById('resQty').value) || 0;
    if (!name) { this.toast('请输入资源名称'); return; }
    if (qty <= 0) { this.toast('数量须大于0'); return; }

    this.data.inventory[name] = (this.data.inventory[name] || 0) + qty;
    this.save();
    this.closeModal('resourceModal');
    this.renderAll();
    this.toast(`已添加 ${name} x${qty}`);
  },

  setInventory(name, qty) {
    if (qty <= 0) {
      delete this.data.inventory[name];
    } else {
      this.data.inventory[name] = qty;
    }
    this.save();
    this.renderDashboard();
  },

  changeInventory(name, delta) {
    const current = this.data.inventory[name] || 0;
    const newQty = current + delta;
    if (newQty <= 0) {
      delete this.data.inventory[name];
      this.renderInventory();
    } else {
      this.data.inventory[name] = newQty;
      // 只更新输入框的值，不重新渲染整个列表
      const items = document.querySelectorAll('.resource-item');
      items.forEach(item => {
        const nameEl = item.querySelector('.resource-name');
        if (nameEl && nameEl.textContent === name) {
          item.querySelector('input[type="number"]').value = newQty;
        }
      });
    }
    this.save();
    this.renderDashboard();
    this.renderProjects();
  },

  removeInventory(name) {
    delete this.data.inventory[name];
    this.save();
    this.renderAll();
  },

  // ==================== 成员操作 ====================
  addMember() {
    const input = document.getElementById('newMember');
    const name = input.value.trim();
    if (!name) return;
    if (this.data.members.includes(name)) {
      this.toast('成员已存在');
      return;
    }
    this.data.members.push(name);
    input.value = '';
    this.save();
    this.renderMembers();
    this.renderMemberSelects();
    this.toast(`已添加成员: ${name}`);
  },

  removeMember(name) {
    this.data.members = this.data.members.filter(m => m !== name);
    this.save();
    this.renderMembers();
    this.renderMemberSelects();
  },

  // ==================== GitHub 同步 ====================
  loadGitHubConfig() {
    try {
      const saved = localStorage.getItem('xlg_github');
      if (saved) {
        this.github = JSON.parse(saved);
        this.updateSyncStatus('connected', '已连接');
      }
    } catch (e) {}
    // 填充表单
    if (this.github) {
      const repoEl = document.getElementById('ghRepo');
      const branchEl = document.getElementById('ghBranch');
      const tokenEl = document.getElementById('ghToken');
      if (repoEl) repoEl.value = this.github.repo || '';
      if (branchEl) branchEl.value = this.github.branch || 'main';
      if (tokenEl) tokenEl.value = this.github.token || '';
    }
  },

  saveGitHubConfig() {
    const repo = document.getElementById('ghRepo').value.trim();
    const branch = document.getElementById('ghBranch').value.trim() || 'main';
    const token = document.getElementById('ghToken').value.trim();

    if (!repo || !token) {
      this.toast('请填写仓库和 Token');
      return;
    }

    this.github = { repo, branch, token };
    localStorage.setItem('xlg_github', JSON.stringify(this.github));
    this.updateSyncStatus('connected', '已连接');
    this.startAutoSync();
    this.renderInviteLink();
    this.toast('GitHub 配置已保存');
  },

  async testGitHubConnection() {
    if (!this.github) {
      this.toast('请先保存 GitHub 配置');
      return;
    }

    this.updateSyncStatus('syncing', '测试中...');
    try {
      const res = await fetch(`https://api.github.com/repos/${this.github.repo}`, {
        headers: { 'Authorization': `token ${this.github.token}` }
      });
      if (res.ok) {
        this.updateSyncStatus('connected', '连接成功');
        this.toast('GitHub 连接成功！');
      } else {
        const data = await res.json();
        this.updateSyncStatus('offline', '连接失败');
        this.toast('连接失败: ' + (data.message || res.status));
      }
    } catch (e) {
      this.updateSyncStatus('offline', '网络错误');
      this.toast('网络错误: ' + e.message);
    }
  },

  async syncToGitHub() {
    if (!this.github) return;
    this.updateSyncStatus('syncing', '同步中...');

    try {
      await this.ghWriteFile('data.json', JSON.stringify(this.data, null, 2));
      this.updateSyncStatus('connected', '已同步 ' + new Date().toLocaleTimeString('zh-CN'));
    } catch (e) {
      console.error('同步失败', e);
      this.updateSyncStatus('offline', '同步失败');
    }
  },

  async syncFromGitHub() {
    if (!this.github) return;
    this.updateSyncStatus('syncing', '拉取中...');

    try {
      const content = await this.ghReadFile('data.json');
      if (content) {
        const remote = JSON.parse(content);
        // 合并: 取最新的项目列表，合并库存（取较大值），合并成员
        this.mergeData(remote);
        this.saveLocal();
        this.renderAll();
        this.updateSyncStatus('connected', '已同步 ' + new Date().toLocaleTimeString('zh-CN'));
      } else {
        // 远程无数据，推送本地数据
        await this.syncToGitHub();
      }
    } catch (e) {
      console.error('拉取失败', e);
      this.updateSyncStatus('offline', '拉取失败');
    }
  },

  mergeData(remote) {
    // 合并项目: 以 id 为主键，取更新时间较新的
    const projectMap = {};
    for (const p of this.data.projects) projectMap[p.id] = p;
    for (const p of remote.projects || []) {
      const existing = projectMap[p.id];
      if (!existing) {
        projectMap[p.id] = p;
      } else {
        // 取最新变更
        const localTime = existing.completedAt || existing.createdAt;
        const remoteTime = p.completedAt || p.createdAt;
        if (remoteTime > localTime) projectMap[p.id] = p;
      }
    }
    this.data.projects = Object.values(projectMap);

    // 合并库存: 取较大值（保守合并）
    for (const [name, qty] of Object.entries(remote.inventory || {})) {
      this.data.inventory[name] = Math.max(this.data.inventory[name] || 0, qty);
    }

    // 合并成员
    const memberSet = new Set([...this.data.members, ...(remote.members || [])]);
    this.data.members = Array.from(memberSet);
  },

  async manualSync() {
    if (!this.github) {
      this.toast('请先在设置中配置 GitHub 同步');
      return;
    }
    await this.syncFromGitHub();
    await this.syncToGitHub();
    this.toast('同步完成');
  },

  startAutoSync() {
    if (this._syncTimer) clearInterval(this._syncTimer);
    // 每 30 秒自动同步
    this._syncTimer = setInterval(() => this.syncToGitHub(), 30000);
    // 立即拉取一次
    this.syncFromGitHub();
  },

  // ---- GitHub API helpers ----
  async ghReadFile(path) {
    const { repo, branch, token } = this.github;
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
      { headers: { 'Authorization': `token ${token}` } }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    return atob(data.content);
  },

  async ghWriteFile(path, content) {
    const { repo, branch, token } = this.github;
    // 先获取 sha
    let sha = null;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
        { headers: { 'Authorization': `token ${token}` } }
      );
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }
    } catch (e) {}

    const body = {
      message: `update data ${new Date().toISOString()}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `HTTP ${res.status}`);
    }
  },

  updateSyncStatus(state, text) {
    const dot = document.getElementById('syncDot');
    const label = document.getElementById('syncText');
    dot.className = 'sync-dot';
    if (state === 'offline') dot.classList.add('offline');
    else if (state === 'syncing') dot.classList.add('syncing');
    label.textContent = text;
  },

  // ==================== 导入/导出 ====================
  exportData() {
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星露谷资源_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('数据已导出');
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.projects && imported.inventory) {
          this.mergeData(imported);
          this.save();
          this.renderAll();
          this.toast('数据已导入并合并');
        } else {
          this.toast('无效的数据文件');
        }
      } catch (err) {
        this.toast('导入失败: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销！')) return;
    if (!confirm('再次确认：清空后无法恢复！')) return;
    this.data = { projects: [], inventory: {}, members: [] };
    this.save();
    this.renderAll();
    this.toast('数据已清空');
  },

  // ==================== 工具函数 ====================
  save() {
    this.saveLocal();
    // 如果配置了 GitHub，延迟同步（防抖）
    if (this.github) {
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.syncToGitHub(), 3000);
    }
  },

  openModal(id) {
    document.getElementById(id).classList.add('active');
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  },

  bindClickOutside() {
    // 关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-wrap')) {
        document.querySelectorAll('.autocomplete-list').forEach(d => d.classList.remove('show'));
      }
      // 关闭 modal（点击遮罩）
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    // 数量变化时更新预览
    document.getElementById('projQty')?.addEventListener('input', () => {
      const item = document.getElementById('projItem').value.trim();
      if (item && RECIPES[item]) this.updateIngredientPreview(item);
    });
  },

  genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  },

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
};

// 启动
document.addEventListener('DOMContentLoaded', () => app.init());
