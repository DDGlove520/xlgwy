// 星露谷物语 配方与资源数据库
// 数据来源: Stardew Valley Wiki

const RECIPES = {
  // ============ 制作配方 ============
  "木箱": {
    category: "crafting",
    icon: "📦",
    ingredients: { "木材": 50 }
  },
  "熔炉": {
    category: "crafting",
    icon: "🔥",
    ingredients: { "铜矿石": 20, "石头": 25 }
  },
  "木炭窑": {
    category: "crafting",
    icon: "🪨",
    ingredients: { "木材": 20, "金锭": 2 }
  },
  "洒水器": {
    category: "crafting",
    icon: "💧",
    ingredients: { "铜锭": 1, "铁锭": 1 }
  },
  "优质洒水器": {
    category: "crafting",
    icon: "💧",
    ingredients: { "铁锭": 1, "金锭": 1, "精炼石英": 1 }
  },
  "铱质洒水器": {
    category: "crafting",
    icon: "💧",
    ingredients: { "金锭": 1, "铱锭": 1, "电池组": 1 }
  },
  "酒桶": {
    category: "crafting",
    icon: "🍺",
    ingredients: { "木材": 30, "铜锭": 1, "铁锭": 1, "橡树树脂": 1 }
  },
  "罐头瓶": {
    category: "crafting",
    icon: "🫙",
    ingredients: { "木材": 50, "石头": 40, "煤炭": 8 }
  },
  "蜂房": {
    category: "crafting",
    icon: "🐝",
    ingredients: { "木材": 40, "煤炭": 8, "铁锭": 1, "枫糖浆": 1 }
  },
  "压酪机": {
    category: "crafting",
    icon: "🧀",
    ingredients: { "木材": 45, "石头": 45, "硬木": 10, "铜锭": 1 }
  },
  "蛋黄酱机": {
    category: "crafting",
    icon: "🥚",
    ingredients: { "木材": 15, "石头": 15, "地晶": 1, "铜锭": 1 }
  },
  "织布机": {
    category: "crafting",
    icon: "🧶",
    ingredients: { "木材": 60, "纤维": 30, "松焦油": 1 }
  },
  "产油机": {
    category: "crafting",
    icon: "🫗",
    ingredients: { "史莱姆泥": 50, "硬木": 20, "金锭": 1 }
  },
  "种子生产器": {
    category: "crafting",
    icon: "🌱",
    ingredients: { "木材": 25, "煤炭": 10, "金锭": 1 }
  },
  "水晶复制机": {
    category: "crafting",
    icon: "💎",
    ingredients: { "石头": 99, "金锭": 5, "铱锭": 2, "电池组": 1 }
  },
  "避雷针": {
    category: "crafting",
    icon: "⚡",
    ingredients: { "铁锭": 1, "精炼石英": 1, "蝙蝠翅膀": 5 }
  },
  "回收机": {
    category: "crafting",
    icon: "♻️",
    ingredients: { "木材": 25, "石头": 25, "铁锭": 1 }
  },
  "蠕虫箱": {
    category: "crafting",
    icon: "🪱",
    ingredients: { "硬木": 25, "金锭": 1, "铁锭": 1, "纤维": 50 }
  },
  "树液采集器": {
    category: "crafting",
    icon: "🌳",
    ingredients: { "木材": 40, "铜锭": 2 }
  },
  "木桶": {
    category: "crafting",
    icon: "🛢️",
    ingredients: { "木材": 20, "硬木": 1 }
  },
  "花盆": {
    category: "crafting",
    icon: "🪴",
    ingredients: { "粘土": 1, "石头": 10, "精炼石英": 1 }
  },
  "稻草人": {
    category: "crafting",
    icon: "🎃",
    ingredients: { "木材": 50, "煤炭": 1, "纤维": 20 }
  },
  "豪华稻草人": {
    category: "crafting",
    icon: "🎃",
    ingredients: { "木材": 50, "纤维": 40, "铱矿石": 1 }
  },
  "篝火": {
    category: "crafting",
    icon: "🔥",
    ingredients: { "石头": 10, "木材": 10, "纤维": 10 }
  },
  "火把": {
    category: "crafting",
    icon: "🔦",
    ingredients: { "木材": 1, "树液": 2 }
  },
  "楼梯": {
    category: "crafting",
    icon: "🪜",
    ingredients: { "石头": 99 }
  },
  "炸弹": {
    category: "crafting",
    icon: "💣",
    ingredients: { "铁矿石": 4, "煤炭": 1 }
  },
  "超级炸弹": {
    category: "crafting",
    icon: "💣",
    ingredients: { "金矿石": 4, "太阳精华": 1, "虚空精华": 1 }
  },
  "樱桃炸弹": {
    category: "crafting",
    icon: "💣",
    ingredients: { "铜矿石": 4, "煤炭": 1 }
  },
  "史莱姆蛋压制器": {
    category: "crafting",
    icon: "🥚",
    ingredients: { "煤炭": 25, "火焰石英": 1, "电池组": 1 }
  },
  "传送图腾:农场": {
    category: "crafting",
    icon: "✨",
    ingredients: { "硬木": 1, "蜂蜜": 1, "纤维": 20 }
  },
  "雨水图腾": {
    category: "crafting",
    icon: "🌧️",
    ingredients: { "硬木": 1, "松露油": 1, "松焦油": 5 }
  },
  "优质肥料": {
    category: "crafting",
    icon: "💩",
    ingredients: { "树液": 2, "鱼": 1 }
  },
  "生长激素": {
    category: "crafting",
    icon: "🧪",
    ingredients: { "松焦油": 1, "蛤蜊": 1 }
  },
  "高级生长激素": {
    category: "crafting",
    icon: "🧪",
    ingredients: { "橡树树脂": 1, "珊瑚": 1 }
  },
  "重型树液采集器": {
    category: "crafting",
    icon: "🌳",
    ingredients: { "硬木": 30, "放射性锭": 1 }
  },
  "高级保留土壤": {
    category: "crafting",
    icon: "🌍",
    ingredients: { "石头": 3, "粘土": 1 }
  },
  "衣柜": {
    category: "crafting",
    icon: "🗄️",
    ingredients: { "硬木": 10 }
  },
  "迷你储物箱": {
    category: "crafting",
    icon: "📦",
    ingredients: { "木材": 25 }
  },
  "大型储物箱": {
    category: "crafting",
    icon: "📦",
    ingredients: { "木材": 120, "铜锭": 2 }
  },

  // ============ 建筑 ============
  "鸡舍": {
    category: "building",
    icon: "🐔",
    ingredients: { "木材": 300, "石头": 100, "金币": 4000 }
  },
  "大鸡舍": {
    category: "building",
    icon: "🐔",
    ingredients: { "木材": 400, "石头": 150, "金币": 10000 }
  },
  "豪华鸡舍": {
    category: "building",
    icon: "🐔",
    ingredients: { "木材": 500, "石头": 200, "金币": 20000 }
  },
  "畜棚": {
    category: "building",
    icon: "🐄",
    ingredients: { "木材": 350, "石头": 150, "金币": 6000 }
  },
  "大畜棚": {
    category: "building",
    icon: "🐄",
    ingredients: { "木材": 450, "石头": 200, "金币": 12000 }
  },
  "豪华畜棚": {
    category: "building",
    icon: "🐄",
    ingredients: { "木材": 550, "石头": 300, "金币": 25000 }
  },
  "粮仓": {
    category: "building",
    icon: "🌾",
    ingredients: { "石头": 100, "粘土": 10, "铜锭": 5, "金币": 100 }
  },
  "马厩": {
    category: "building",
    icon: "🐴",
    ingredients: { "硬木": 100, "铁锭": 5, "金币": 10000 }
  },
  "水井": {
    category: "building",
    icon: "🪣",
    ingredients: { "石头": 75, "金币": 1000 }
  },
  "小屋": {
    category: "building",
    icon: "🏠",
    ingredients: { "木材": 300, "金币": 15000 }
  },
  "磨坊": {
    category: "building",
    icon: "🏭",
    ingredients: { "石头": 50, "木材": 150, "布料": 4, "金币": 2500 }
  },
  "鱼塘": {
    category: "building",
    icon: "🐟",
    ingredients: { "石头": 200, "海草": 5, "绿藻": 5, "金币": 5000 }
  },
  "史莱姆小屋": {
    category: "building",
    icon: "🟢",
    ingredients: { "石头": 500, "精炼石英": 10, "铱锭": 1, "金币": 10000 }
  },

  // ============ 工具升级 ============
  "铜质工具升级": {
    category: "upgrade",
    icon: "🔨",
    ingredients: { "铜锭": 5, "金币": 2000 }
  },
  "铁质工具升级": {
    category: "upgrade",
    icon: "🔨",
    ingredients: { "铁锭": 5, "金币": 5000 }
  },
  "金质工具升级": {
    category: "upgrade",
    icon: "🔨",
    ingredients: { "金锭": 5, "金币": 10000 }
  },
  "铱质工具升级": {
    category: "upgrade",
    icon: "🔨",
    ingredients: { "铱锭": 5, "金币": 25000 }
  },

  // ============ 冶炼 ============
  "铜锭": {
    category: "smelting",
    icon: "🟫",
    ingredients: { "铜矿石": 5, "煤炭": 1 }
  },
  "铁锭": {
    category: "smelting",
    icon: "⬜",
    ingredients: { "铁矿石": 5, "煤炭": 1 }
  },
  "金锭": {
    category: "smelting",
    icon: "🟡",
    ingredients: { "金矿石": 5, "煤炭": 1 }
  },
  "铱锭": {
    category: "smelting",
    icon: "🟣",
    ingredients: { "铱矿石": 5, "煤炭": 1 }
  },
  "精炼石英": {
    category: "smelting",
    icon: "🔮",
    ingredients: { "石英": 1, "煤炭": 1 }
  },
  "放射性锭": {
    category: "smelting",
    icon: "☢️",
    ingredients: { "放射性矿石": 5, "煤炭": 1 }
  }
};

// 资源分类（用于库存管理界面分组显示）
const RESOURCE_CATEGORIES = {
  "基础材料": ["木材", "石头", "纤维", "粘土", "硬木", "树液", "煤炭"],
  "矿石": ["铜矿石", "铁矿石", "金矿石", "铱矿石", "放射性矿石"],
  "锭": ["铜锭", "铁锭", "金锭", "铱锭", "放射性锭"],
  "宝石与矿物": ["石英", "精炼石英", "地晶", "火焰石英", "冰泪", "钻石"],
  "树液产品": ["橡树树脂", "枫糖浆", "松焦油"],
  "怪物掉落": ["蝙蝠翅膀", "史莱姆泥", "太阳精华", "虚空精华", "虫肉"],
  "其他材料": ["电池组", "布料", "蜂蜜", "松露油"],
  "海洋物品": ["蛤蜊", "珊瑚", "海草", "绿藻"],
  "货币": ["金币"],
  "食物与农产品": ["鱼", "南瓜", "蜂蜜"]
};

// 所有可能的资源列表（从配方中提取）
function getAllResources() {
  const resources = new Set();
  for (const recipe of Object.values(RECIPES)) {
    for (const ingredient of Object.keys(recipe.ingredients)) {
      resources.add(ingredient);
    }
  }
  return Array.from(resources).sort();
}

// 配方分类名称
const CATEGORY_NAMES = {
  "crafting": "制作",
  "building": "建筑",
  "upgrade": "工具升级",
  "smelting": "冶炼"
};
