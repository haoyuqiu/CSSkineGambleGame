export type Rarity = 'consumer' | 'industrial' | 'milspec' | 'restricted' | 'classified' | 'covert' | 'rare_special';

export interface Weapon {
  id: string;
  name: string;
  category: 'rifle' | 'smg' | 'pistol' | 'heavy' | 'knife' | 'glove';
}

export interface Skin {
  id: string;
  weaponId: string;
  name: string;
  rarity: Rarity;
  /** 磨损外观: fn, mw, ft, ww, bs */
  wear?: 'fn' | 'mw' | 'ft' | 'ww' | 'bs';
  statTrak?: boolean;
}

export interface CaseItem {
  skinId: string;
  probability: number; // 0-1
}

export interface GameCase {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // emoji or color
  items: CaseItem[];
}

export interface InventoryItem {
  skinId: string;
  obtainedAt: number; // timestamp
  caseId: string;
  wear: 'fn' | 'mw' | 'ft' | 'ww' | 'bs';
  statTrak: boolean;
}

export type GamePhase = 'MENU' | 'CASE_SELECT' | 'ROLLING' | 'RESULT';

export interface GameState {
  phase: GamePhase;
  balance: number;
  inventory: InventoryItem[];
  currentCase: GameCase | null;
  openingResult: Skin | null;
  history: string[];
  rollSequence: Skin[][]; // 多槽滚动展示序列
  rollOffsets: number[]; // 每槽横向滚动偏移(px)
  rollTargets: number[]; // 每槽最终目标偏移(px)
  openingResults: Skin[]; // 多槽开箱结果
  batchCount: number; // 当前批次大小 1/3/5
}
