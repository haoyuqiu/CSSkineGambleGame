import { Rarity, Weapon, Skin, GameCase } from './types';

// ============ 稀有度配置 ============
export const RARITY_CONFIG: Record<Rarity, { name: string; color: string; bg: string; border: string; textColor: string }> = {
  consumer:    { name: '消费级',   color: '#B0B0B0', bg: 'bg-stone-300',   border: 'border-stone-400',   textColor: 'text-stone-700' },
  industrial:  { name: '工业级',   color: '#5B9BD5', bg: 'bg-sky-300',     border: 'border-sky-400',     textColor: 'text-sky-800' },
  milspec:     { name: '军规级',   color: '#4A6CF7', bg: 'bg-blue-400',    border: 'border-blue-500',    textColor: 'text-blue-900' },
  restricted:  { name: '受限',     color: '#9B59B6', bg: 'bg-purple-400',  border: 'border-purple-500',  textColor: 'text-purple-900' },
  classified:  { name: '保密',     color: '#E91E90', bg: 'bg-pink-400',    border: 'border-pink-500',    textColor: 'text-pink-900' },
  covert:      { name: '隐秘',     color: '#E74C3C', bg: 'bg-red-500',     border: 'border-red-600',     textColor: 'text-red-100' },
  rare_special:{ name: '稀有特殊', color: '#F1C40F', bg: 'bg-yellow-400',  border: 'border-yellow-500',  textColor: 'text-yellow-900' },
};

// ============ 武器库 ============
export const WEAPONS: Weapon[] = [
  // 步枪
  { id: 'ak47',     name: 'AK-47',         category: 'rifle' },
  { id: 'm4a4',     name: 'M4A4',          category: 'rifle' },
  { id: 'm4a1s',    name: 'M4A1-S',        category: 'rifle' },
  { id: 'awp',      name: 'AWP',           category: 'rifle' },
  { id: 'sg553',    name: 'SG 553',        category: 'rifle' },
  { id: 'aug',      name: 'AUG',           category: 'rifle' },
  { id: 'famas',    name: 'FAMAS',         category: 'rifle' },
  { id: 'galil',    name: 'Galil AR',      category: 'rifle' },
  { id: 'scar20',   name: 'SCAR-20',       category: 'rifle' },
  { id: 'g3sg1',    name: 'G3SG1',         category: 'rifle' },
  // 冲锋枪
  { id: 'p90',      name: 'P90',           category: 'smg' },
  { id: 'mac10',    name: 'MAC-10',        category: 'smg' },
  { id: 'mp9',      name: 'MP9',           category: 'smg' },
  { id: 'ump45',    name: 'UMP-45',        category: 'smg' },
  { id: 'bizon',    name: 'PP-Bizon',      category: 'smg' },
  { id: 'mp7',      name: 'MP7',           category: 'smg' },
  // 手枪
  { id: 'deagle',   name: 'Desert Eagle',  category: 'pistol' },
  { id: 'usps',     name: 'USP-S',         category: 'pistol' },
  { id: 'glock',    name: 'Glock-18',      category: 'pistol' },
  { id: 'p250',     name: 'P250',          category: 'pistol' },
  { id: 'fiveseven',name: 'Five-SeveN',    category: 'pistol' },
  { id: 'cz75',     name: 'CZ75-Auto',     category: 'pistol' },
  { id: 'tec9',     name: 'Tec-9',         category: 'pistol' },
  // 重型
  { id: 'mag7',     name: 'MAG-7',         category: 'heavy' },
  { id: 'nova',     name: 'Nova',          category: 'heavy' },
  { id: 'xm1014',   name: 'XM1014',        category: 'heavy' },
  { id: 'm249',     name: 'M249',          category: 'heavy' },
  { id: 'negev',    name: 'Negev',         category: 'heavy' },
  // 刀/手套
  { id: 'knife',    name: '匕首',          category: 'knife' },
  { id: 'glove',    name: '手套',          category: 'glove' },
];

// ============ 皮肤库 ============
export const SKINS: Skin[] = [
  // ---- 消费级 (白色) ----
  { id: 's_ak47_safari',        weaponId: 'ak47',    name: 'AK-47 | 狩猎网格',          rarity: 'consumer' },
  { id: 's_m4a4_tornado',       weaponId: 'm4a4',    name: 'M4A4 | 龙卷风',            rarity: 'consumer' },
  { id: 's_awp_safari',         weaponId: 'awp',     name: 'AWP | 狩猎网格',           rarity: 'consumer' },
  { id: 's_p90_sand',           weaponId: 'p90',     name: 'P90 | 沙尘暴',             rarity: 'consumer' },
  { id: 's_mag7_sand',          weaponId: 'mag7',    name: 'MAG-7 | 沙丘',             rarity: 'consumer' },
  { id: 's_mp9_sand',           weaponId: 'mp9',     name: 'MP9 | 枯叶',               rarity: 'consumer' },
  { id: 's_nova_forest',        weaponId: 'nova',    name: 'Nova | 森林之叶',          rarity: 'consumer' },
  { id: 's_ump45_urban',        weaponId: 'ump45',   name: 'UMP-45 | 都市危机',        rarity: 'consumer' },
  { id: 's_deagle_mud',         weaponId: 'deagle',  name: 'Desert Eagle | 泥石',      rarity: 'consumer' },
  { id: 's_famas_colony',       weaponId: 'famas',   name: 'FAMAS | 殖民地',           rarity: 'consumer' },

  // ---- 工业级 (浅蓝) ----
  { id: 's_ak47_blue',          weaponId: 'ak47',    name: 'AK-47 | 蓝色层压板',        rarity: 'industrial' },
  { id: 's_m4a4_desert',        weaponId: 'm4a4',    name: 'M4A4 | 沙漠精英',          rarity: 'industrial' },
  { id: 's_awp_electric',       weaponId: 'awp',     name: 'AWP | 电子蜂巢',           rarity: 'industrial' },
  { id: 's_glock_reactor',      weaponId: 'glock',   name: 'Glock-18 | 反应堆',        rarity: 'industrial' },
  { id: 's_usps_stainless',     weaponId: 'usps',    name: 'USP-S | 不锈钢',           rarity: 'industrial' },
  { id: 's_p250_modern',        weaponId: 'p250',    name: 'P250 | 现代化',            rarity: 'industrial' },
  { id: 's_bizon_water',        weaponId: 'bizon',   name: 'PP-Bizon | 水灵',          rarity: 'industrial' },
  { id: 's_mac10_silver',       weaponId: 'mac10',   name: 'MAC-10 | 银质',            rarity: 'industrial' },

  // ---- 军规级 (深蓝) ----
  { id: 's_ak47_blue_lam',      weaponId: 'ak47',    name: 'AK-47 | 深海层压板',        rarity: 'milspec' },
  { id: 's_m4a4_guardian',      weaponId: 'm4a4',    name: 'M4A4 | 守卫者',            rarity: 'milspec' },
  { id: 's_awp_corticera',      weaponId: 'awp',     name: 'AWP | 珊瑚树',             rarity: 'milspec' },
  { id: 's_deagle_oxide',       weaponId: 'deagle',  name: 'Desert Eagle | 青铜氧化',   rarity: 'milspec' },
  { id: 's_fiveseven_case',      weaponId: 'fiveseven',name:'Five-SeveN | 淬火硬化',     rarity: 'milspec' },
  { id: 's_p90_blind',          weaponId: 'p90',     name: 'P90 | 盲点',               rarity: 'milspec' },
  { id: 's_mp7_ocean',          weaponId: 'mp7',     name: 'MP7 | 海洋泡沫',           rarity: 'milspec' },
  { id: 's_ump45_lab',          weaponId: 'ump45',   name: 'UMP-45 | 实验室',          rarity: 'milspec' },
  { id: 's_sg553_pulse',        weaponId: 'sg553',   name: 'SG 553 | 脉搏',            rarity: 'milspec' },
  { id: 's_aug_condemned',      weaponId: 'aug',     name: 'AUG | 判官',               rarity: 'milspec' },

  // ---- 受限 (紫色) ----
  { id: 's_ak47_redline',       weaponId: 'ak47',    name: 'AK-47 | 红线',             rarity: 'restricted' },
  { id: 's_m4a4_dragon_king',   weaponId: 'm4a4',    name: 'M4A4 | 龙王',              rarity: 'restricted' },
  { id: 's_awp_redline',        weaponId: 'awp',     name: 'AWP | 红线',               rarity: 'restricted' },
  { id: 's_deagle_conspiracy',  weaponId: 'deagle',  name: 'Desert Eagle | 阴谋者',     rarity: 'restricted' },
  { id: 's_glock_water',        weaponId: 'glock',   name: 'Glock-18 | 水元素',         rarity: 'restricted' },
  { id: 's_usps_orion',         weaponId: 'usps',    name: 'USP-S | 猎户座',           rarity: 'restricted' },
  { id: 's_p250_mehndi',        weaponId: 'p250',    name: 'P250 | 彩绘纹身',          rarity: 'restricted' },
  { id: 's_mac10_neon',         weaponId: 'mac10',   name: 'MAC-10 | 霓虹革命',         rarity: 'restricted' },

  // ---- 保密 (粉色) ----
  { id: 's_ak47_neon',          weaponId: 'ak47',    name: 'AK-47 | 霓虹骑士',          rarity: 'classified' },
  { id: 's_m4a4_asiimov',       weaponId: 'm4a4',    name: 'M4A4 | 阿西莫夫',          rarity: 'classified' },
  { id: 's_awp_asiimov',        weaponId: 'awp',     name: 'AWP | 阿西莫夫',           rarity: 'classified' },
  { id: 's_deagle_blaze',       weaponId: 'deagle',  name: 'Desert Eagle | 烈焰',       rarity: 'classified' },
  { id: 's_p90_asiimov',        weaponId: 'p90',     name: 'P90 | 阿西莫夫',           rarity: 'classified' },
  { id: 's_aug_chameleon',      weaponId: 'aug',     name: 'AUG | 变色龙',             rarity: 'classified' },

  // ---- 隐秘 (红色) ----
  { id: 's_ak47_fire',          weaponId: 'ak47',    name: 'AK-47 | 火蛇',             rarity: 'covert' },
  { id: 's_m4a4_howl',          weaponId: 'm4a4',    name: 'M4A4 | 嚎叫',              rarity: 'covert' },
  { id: 's_awp_dragon_lore',    weaponId: 'awp',     name: 'AWP | 巨龙传说',           rarity: 'covert' },
  { id: 's_deagle_golden',      weaponId: 'deagle',  name: 'Desert Eagle | 金色锦鲤',   rarity: 'covert' },

  // ---- 稀有特殊 (金色) ----
  { id: 's_knife_karambit',     weaponId: 'knife',   name: '蝴蝶刀 | 渐变大理石',       rarity: 'rare_special' },
  { id: 's_knife_m9',           weaponId: 'knife',   name: 'M9刺刀 | 多普勒',           rarity: 'rare_special' },
  { id: 's_knife_butterfly',    weaponId: 'knife',   name: '折叠刀 | 屠夫',             rarity: 'rare_special' },
  { id: 's_glove_specialist',   weaponId: 'glove',   name: '专业手套 | 翡翠之网',       rarity: 'rare_special' },
];

// ============ 概率配置（模仿真实CS开箱分布） ============
// 消费级 79.92% | 工业级 15.98% | 军规级 3.2% | 受限 0.64% | 保密 0.128% | 隐秘 0.0256% | 稀有特殊 0.0064%
// 不过为了游戏趣味性，把高稀有度概率稍微调高一点

const RARITY_WEIGHTS: Record<Rarity, number> = {
  consumer:      0.7000,  // 70%
  industrial:    0.1992,  // ~20%
  milspec:       0.0800,  // 8%
  restricted:    0.0160,  // 1.6%
  classified:    0.0032,  // 0.32%
  covert:        0.0013,  // 0.13%
  rare_special:  0.0003,  // 0.03%
};

// 按稀有度分组皮肤
function buildCaseItems(rarityCounts: Partial<Record<Rarity, number>>): { skinId: string; probability: number }[] {
  const items: { skinId: string; probability: number }[] = [];
  
  for (const [rarity, count] of Object.entries(rarityCounts)) {
    const skinsOfRarity = SKINS.filter(s => s.rarity === rarity);
    const weight = RARITY_WEIGHTS[rarity as Rarity] || 0;
    
    // 从该稀有度中随机选 count 个皮肤
    const shuffled = [...skinsOfRarity].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    const probPerSkin = weight / selected.length;
    for (const skin of selected) {
      items.push({ skinId: skin.id, probability: probPerSkin });
    }
  }
  
  // 归一化
  const total = items.reduce((sum, i) => sum + i.probability, 0);
  return items.map(i => ({ ...i, probability: i.probability / total }));
}

// ============ 箱子库 ============
export const CASES: GameCase[] = [
  {
    id: 'case_op_bravo',
    name: '英勇行动武器箱',
    description: '反恐精英经典收藏，包含 AK-47 | 火蛇 等稀有皮肤',
    price: 10,
    image: '📦',
    items: buildCaseItems({
      consumer: 5, industrial: 4, milspec: 4,
      restricted: 3, classified: 2, covert: 1, rare_special: 1,
    }),
  },
  {
    id: 'case_chroma',
    name: '幻彩武器箱',
    description: '色彩斑斓的武器涂装，有机会获得 AWP | 阿西莫夫',
    price: 15,
    image: '🌈',
    items: buildCaseItems({
      consumer: 4, industrial: 3, milspec: 4,
      restricted: 3, classified: 3, covert: 1, rare_special: 1,
    }),
  },
  {
    id: 'case_esports',
    name: '电竞 2024 年武器箱',
    description: '电竞主题皮肤，含 M4A4 | 嚎叫 等典藏',
    price: 20,
    image: '🏆',
    items: buildCaseItems({
      consumer: 3, industrial: 3, milspec: 3,
      restricted: 2, classified: 2, covert: 1, rare_special: 2,
    }),
  },
  {
    id: 'case_dragon',
    name: '巨龙传说收藏箱',
    description: '传说级收藏，AWP | 巨龙传说 的终极归属',
    price: 50,
    image: '🐉',
    items: buildCaseItems({
      consumer: 2, industrial: 2, milspec: 3,
      restricted: 2, classified: 2, covert: 2, rare_special: 2,
    }),
  },
  {
    id: 'case_shadow',
    name: '暗影武器箱',
    description: '暗影部队专属装备，刀和手套的概率更高',
    price: 25,
    image: '🌑',
    items: buildCaseItems({
      consumer: 3, industrial: 3, milspec: 4,
      restricted: 2, classified: 2, covert: 1, rare_special: 3,
    }),
  },
  {
    id: 'case_starter',
    name: '新手入门箱',
    description: '新兵专属，3元一开，轻松上手',
    price: 3,
    image: '🎁',
    items: buildCaseItems({
      consumer: 6, industrial: 4, milspec: 3,
      restricted: 1, classified: 1, covert: 1, rare_special: 0,
    }),
  },
];

// ============ 回收倍率（期望收益率 ~90%） ============
// E[R] = Σ P(rarity) × multiplier[rarity] ≈ 0.903 ≈ 90.3%
export const RECYCLE_MULTIPLIERS: Record<Rarity, number> = {
  consumer:      0.185,
  industrial:    0.56,
  milspec:       2.3,
  restricted:    5.6,
  classified:    22.5,
  covert:        113,
  rare_special:  565,
};

/** 计算指定箱子的期望收益率 */
export function getCaseExpectedReturn(c: GameCase): number {
  let expected = 0;
  for (const item of c.items) {
    const skin = SKINS.find(s => s.id === item.skinId);
    if (skin) {
      expected += item.probability * (RECYCLE_MULTIPLIERS[skin.rarity] || 0);
    }
  }
  return expected; // 返回值 = 期望回收金额 / 箱子价格
}

/** 计算皮肤回收价格 */
export function getRecyclePrice(skin: Skin, casePrice: number): number {
  return Math.round(casePrice * (RECYCLE_MULTIPLIERS[skin.rarity] || 0));
}

// ============ 磨损等级 ============
export const WEAR_LEVELS: { id: string; name: string; chance: number }[] = [
  { id: 'fn', name: '崭新出厂', chance: 0.10 },
  { id: 'mw', name: '略有磨损', chance: 0.20 },
  { id: 'ft', name: '久经沙场', chance: 0.30 },
  { id: 'ww', name: '破损不堪', chance: 0.20 },
  { id: 'bs', name: '战痕累累', chance: 0.20 },
];

// 初始余额
export const INITIAL_BALANCE = 500;
