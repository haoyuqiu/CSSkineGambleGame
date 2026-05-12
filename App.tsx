import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Wallet, ChevronRight, ArrowLeft, Package, Zap, TrendingUp, Trash2, Volume2, VolumeX } from 'lucide-react';
import { GameState, GamePhase, Skin, GameCase, InventoryItem } from './types';
import { CASES, SKINS, WEAPONS, RARITY_CONFIG, WEAR_LEVELS, INITIAL_BALANCE, getRecyclePrice, getCaseExpectedReturn } from './constants';

// ============ CS:GO 风格音效引擎 (Web Audio API) ============
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** 滴答声 - 滚动时每跳一个皮肤 */
function playTick() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
  } catch (_) {}
}

/** 命中音 - 结果揭晓时根据稀有度不同 */
function playReveal(rarity: string) {
  try {
    const ctx = getAudioCtx();
    const freqMap: Record<string, number> = {
      consumer: 220, industrial: 330, milspec: 440, restricted: 587,
      classified: 740, covert: 880, rare_special: 1100,
    };
    const baseFreq = freqMap[rarity] || 440;

    // 主音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);

    // 谐波
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
    gain2.gain.setValueAtTime(0.07, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

/** 金色物品特殊音效 */
function playGoldReveal() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    });
  } catch (_) {}
}

/** 开箱启动音 */
function playCaseOpen() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

// ============ 辅助函数 ============
function getWeaponName(weaponId: string): string {
  return WEAPONS.find(w => w.id === weaponId)?.name || weaponId;
}

function getWeaponCategory(weaponId: string): string {
  const cat = WEAPONS.find(w => w.id === weaponId)?.category;
  const map: Record<string, string> = { rifle: '步枪', smg: '冲锋枪', pistol: '手枪', heavy: '重型', knife: '刀具', glove: '手套' };
  return map[cat || ''] || '';
}

function randomWear(): 'fn' | 'mw' | 'ft' | 'ww' | 'bs' {
  const r = Math.random();
  if (r < 0.10) return 'fn';
  if (r < 0.30) return 'mw';
  if (r < 0.60) return 'ft';
  if (r < 0.80) return 'ww';
  return 'bs';
}

const WEAR_NAMES: Record<string, string> = { fn: '崭新出厂', mw: '略有磨损', ft: '久经沙场', ww: '破损不堪', bs: '战痕累累' };

/** 获取库存物品的回收价格 */
function getItemRecyclePrice(item: InventoryItem): number {
  const skin = SKINS.find(s => s.id === item.skinId);
  const gameCase = CASES.find(c => c.id === item.caseId);
  if (!skin || !gameCase) return 0;
  return getRecyclePrice(skin, gameCase.price);
}

// ============ 主应用 ============
export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'MENU',
    balance: INITIAL_BALANCE,
    inventory: [],
    currentCase: null,
    openingResult: null,
    history: [],
    rollSequence: [],
    rollOffsets: [0],
    rollTargets: [0],
    openingResults: [],
    batchCount: 1,
    caseCounters: {},
    freeCases: {},
  });

  const [activeTab, setActiveTab] = useState<'open' | 'inventory'>('open');
  const [muted, setMuted] = useState(false);
  const [batchMultiplier, setBatchMultiplier] = useState<1 | 3 | 5>(1);
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOpenedItemsRef = useRef<InventoryItem[]>([]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    };
  }, []);

  // ============ 开箱逻辑（多槽并行横向滚动） ============
  const startOpening = useCallback((gameCase: GameCase) => {
    const availableFree = gameState.freeCases[gameCase.id] || 0;
    const freeUsed = Math.min(availableFree, batchMultiplier);
    const payCount = batchMultiplier - freeUsed;
    const paidCost = gameCase.price * payCount;
    if (gameState.balance < paidCost) return;

    const ITEM_W = 140;
    const CENTER_IDX = 2;
    const slots: { sequence: Skin[]; targetOffset: number; winningSkin: Skin }[] = [];

    for (let slot = 0; slot < batchMultiplier; slot++) {
      // 根据概率抽取结果
      const roll = Math.random();
      let cumulative = 0;
      let winningSkinId = gameCase.items[0].skinId;
      for (const item of gameCase.items) {
        cumulative += item.probability;
        if (roll <= cumulative) { winningSkinId = item.skinId; break; }
      }
      const winningSkin = SKINS.find(s => s.id === winningSkinId)!;

      // 生成滚动序列
      const otherSkins = SKINS.filter(s => s.id !== winningSkinId);
      const shuffled = [...otherSkins].sort(() => Math.random() - 0.5);
      const sequence: Skin[] = [];
      for (let i = 0; i < 40; i++) sequence.push(shuffled[i % shuffled.length]);
      sequence.push(shuffled[shuffled.length - 2]);
      sequence.push(shuffled[shuffled.length - 1]);
      sequence.push(winningSkin);
      for (let i = 0; i < 6; i++) sequence.push(shuffled[(shuffled.length - 3 + i) % shuffled.length]);

      const winningIdx = sequence.length - 7;
      const targetOffset = (winningIdx - CENTER_IDX) * ITEM_W;
      slots.push({ sequence, targetOffset, winningSkin });
    }

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - paidCost,
      freeCases: freeUsed > 0 ? { ...prev.freeCases, [gameCase.id]: prev.freeCases[gameCase.id] - freeUsed } : prev.freeCases,
      currentCase: gameCase,
      phase: 'ROLLING',
      openingResult: null,
      openingResults: [],
      rollSequence: slots.map(s => s.sequence),
      rollOffsets: slots.map(() => 0),
      rollTargets: slots.map(s => s.targetOffset),
      batchCount: batchMultiplier,
    }));

    if (!muted) playCaseOpen();

    // ===== requestAnimationFrame 驱动所有槽并行滚动 =====
    let startTime: number | null = null;
    const DURATION = 4500;
    const lastTickPerSlot: number[] = slots.map(() => -1);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3.5);

      const newOffsets = slots.map((s, i) => {
        const offset = eased * s.targetOffset;
        if (!muted) {
          const idx = Math.round(offset / ITEM_W);
          if (idx !== lastTickPerSlot[i] && idx < s.sequence.length) {
            lastTickPerSlot[i] = idx;
            playTick();
          }
        }
        return offset;
      });

      setGameState(prev => ({ ...prev, rollOffsets: newOffsets }));

      if (progress < 1) {
        rollTimerRef.current = setTimeout(() => requestAnimationFrame(animate), 0) as unknown as ReturnType<typeof setTimeout>;
      } else {
        // 全部滚动结束
        const results = slots.map(s => s.winningSkin);
        const newItems: InventoryItem[] = results.map(r => ({
          skinId: r.id,
          obtainedAt: Date.now(),
          caseId: gameCase.id,
          wear: randomWear(),
          statTrak: Math.random() < 0.05,
        }));
        lastOpenedItemsRef.current = newItems;

        if (!muted) {
          const bestRarity = results.reduce((best, r) => {
            const order = ['consumer','industrial','milspec','restricted','classified','covert','rare_special'];
            return order.indexOf(r.rarity) > order.indexOf(best) ? r.rarity : best;
          }, 'consumer' as string);
          if (bestRarity === 'rare_special' || bestRarity === 'covert') {
            playGoldReveal();
          } else {
            playReveal(bestRarity);
          }
        }

        const historyLines = newItems.map(item => {
          const s = SKINS.find(sk => sk.id === item.skinId);
          return `${s?.name || '??'} (${WEAR_NAMES[item.wear]})`;
        });

        setGameState(prev => {
          const prevCount = prev.caseCounters[gameCase.id] || 0;
          const newCount = prevCount + payCount;
          const bonusFree = Math.floor(newCount / 10) - Math.floor(prevCount / 10);
          const finalCounter = newCount % 10;
          const extraHistory = bonusFree > 0 ? [`🎁 ${gameCase.name} 累计开箱${Math.floor(newCount / 10) * 10}次，获得${bonusFree}次免费开箱！`] : [];
          return {
            ...prev,
            rollOffsets: slots.map(s => s.targetOffset),
            openingResults: results,
            phase: 'RESULT',
            inventory: [...newItems, ...prev.inventory],
            caseCounters: { ...prev.caseCounters, [gameCase.id]: finalCounter },
            freeCases: { ...prev.freeCases, [gameCase.id]: (prev.freeCases[gameCase.id] || 0) + bonusFree },
            history: [...extraHistory, ...historyLines, ...prev.history.slice(0, 49)],
          };
        });
      }
    };

    requestAnimationFrame(animate);
  }, [gameState.balance, muted, batchMultiplier, gameState.freeCases, gameState.caseCounters]);

  const closeResult = () => {
    lastOpenedItemsRef.current = [];
    setGameState(prev => ({
      ...prev,
      phase: 'CASE_SELECT',
      currentCase: null,
      openingResult: null,
      openingResults: [],
      rollSequence: [],
      rollOffsets: [0],
      rollTargets: [0],
    }));
  };

  /** 结果页直接回收 */
  const recycleResult = () => {
    const items = lastOpenedItemsRef.current;
    if (items.length === 0) return;
    let totalPrice = 0;
    const names: string[] = [];
    items.forEach(item => {
      const skin = SKINS.find(s => s.id === item.skinId);
      if (skin) names.push(skin.name);
      totalPrice += getItemRecyclePrice(item);
    });
    lastOpenedItemsRef.current = [];
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + totalPrice,
      inventory: prev.inventory.slice(items.length),
      phase: 'CASE_SELECT',
      currentCase: null,
      openingResult: null,
      openingResults: [],
      rollSequence: [],
      rollOffsets: [0],
      rollTargets: [0],
      history: [`回收：${names.join(', ')} → +¥${totalPrice}`, ...prev.history.slice(0, 49)],
    }));
  };

  const resetGame = () => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    setGameState({
      phase: 'MENU',
      balance: INITIAL_BALANCE,
      inventory: [],
      currentCase: null,
      openingResult: null,
      history: [],
      rollSequence: [],
      rollOffsets: [0],
      rollTargets: [0],
      openingResults: [],
      batchCount: 1,
      caseCounters: {},
      freeCases: {},
    });
  };

  const goToCases = () => {
    setGameState(prev => ({ ...prev, phase: 'CASE_SELECT' }));
  };

  const addBalance = (amount: number) => {
    setGameState(prev => ({ ...prev, balance: prev.balance + amount }));
  };

  const recycleSkin = (index: number) => {
    setGameState(prev => {
      const item = prev.inventory[index];
      if (!item) return prev;
      const price = getItemRecyclePrice(item);
      const newInventory = [...prev.inventory];
      newInventory.splice(index, 1);
      const skin = SKINS.find(s => s.id === item.skinId);
      return {
        ...prev,
        balance: prev.balance + price,
        inventory: newInventory,
        history: [`回收：${skin?.name || '??'} → +¥${price}`, ...prev.history.slice(0, 49)],
      };
    });
  };

  // ============ 渲染 ============

  // 主菜单
  const renderMenu = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl mb-6">🔫</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
          CS 开箱模拟器
        </h1>
        <p className="text-stone-300 mb-8 text-lg">纯文字 + 颜色模拟开箱体验 · 所有概率自定义 · 无实际货币</p>

        <div className="bg-stone-800/60 backdrop-blur border border-stone-600 rounded-2xl p-8 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-stone-700/50 rounded-xl p-4">
              <div className="text-stone-400 mb-1">初始余额</div>
              <div className="text-2xl font-bold text-emerald-400">¥{INITIAL_BALANCE}</div>
            </div>
            <div className="bg-stone-700/50 rounded-xl p-4">
              <div className="text-stone-400 mb-1">武器箱数量</div>
              <div className="text-2xl font-bold text-amber-400">{CASES.length}</div>
            </div>
            <div className="bg-stone-700/50 rounded-xl p-4">
              <div className="text-stone-400 mb-1">武器种类</div>
              <div className="text-2xl font-bold text-blue-400">{WEAPONS.length}</div>
            </div>
            <div className="bg-stone-700/50 rounded-xl p-4">
              <div className="text-stone-400 mb-1">皮肤总数</div>
              <div className="text-2xl font-bold text-purple-400">{SKINS.length}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
              <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.textColor}`}>
                {cfg.name}
              </span>
            ))}
          </div>

          <button
            onClick={goToCases}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xl rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <Zap /> 进入开箱
          </button>
        </div>
      </div>
    </div>
  );

  // 箱子选择页面
  const renderCaseSelect = () => (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button onClick={() => setGameState(prev => ({ ...prev, phase: 'MENU' }))} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> 返回
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted(m => !m)}
            className="bg-stone-800/80 px-3 py-2 rounded-xl flex items-center gap-1 border border-stone-600 text-stone-400 hover:text-white transition-colors"
            title={muted ? '开启音效' : '静音'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="bg-stone-800/80 px-4 py-2 rounded-xl flex items-center gap-2 border border-stone-600">
            <Wallet size={20} className="text-emerald-400" />
            <span className="text-white font-bold text-lg">¥{gameState.balance}</span>
          </div>
          <button onClick={() => addBalance(500)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1">
            <TrendingUp size={16} /> +500 模拟充值
          </button>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('open')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'open' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-400 hover:text-white'}`}>
          <Package size={16} className="inline mr-1" /> 开箱
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-400 hover:text-white'}`}>
          <ShoppingCart size={16} className="inline mr-1" /> 库存 ({gameState.inventory.length})
        </button>
      </div>

      {activeTab === 'open' ? (
        <>
          {/* 倍数选择器 */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">选择一个武器箱</h2>
            <div className="flex gap-1 bg-stone-800 rounded-xl p-1 border border-stone-600">
              {([1, 3, 5] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setBatchMultiplier(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    batchMultiplier === n
                      ? 'bg-amber-500 text-stone-900'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CASES.map(c => {
              const totalCost = c.price * batchMultiplier;
              const canAfford = gameState.balance >= totalCost;
              // 计算箱子里最高稀有度
              const rarities = c.items.map(i => SKINS.find(s => s.id === i.skinId)?.rarity).filter(Boolean) as string[];
              const hasGold = rarities.includes('rare_special');
              const hasRed = rarities.includes('covert');
              const hasPink = rarities.includes('classified');
              const expectedReturn = getCaseExpectedReturn(c);

              return (
                <div key={c.id} className={`bg-stone-800/80 border rounded-2xl p-6 transition-all ${canAfford ? 'border-stone-600 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10' : 'border-stone-700 opacity-50'}`}>
                  <div className="text-5xl text-center mb-4">{c.image}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-stone-400 text-sm mb-4 leading-relaxed">{c.description}</p>

                  {/* 稀有度标签 */}
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {hasGold && <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs rounded border border-yellow-400/30">★ 金色</span>}
                    {hasRed && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">隐秘</span>}
                    {hasPink && <span className="px-2 py-0.5 bg-pink-400/20 text-pink-400 text-xs rounded border border-pink-400/30">保密</span>}
                    <span className="px-2 py-0.5 bg-stone-700 text-stone-300 text-xs rounded">{rarities.length} 种皮肤</span>
                  </div>

                  {/* 期望收益率 */}
                  <div className="mb-3 text-xs text-stone-400 flex items-center gap-1">
                    <span>📊 期望回收率：</span>
                    <span className={`font-bold ${expectedReturn >= 0.85 ? 'text-emerald-400' : expectedReturn >= 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                      {(expectedReturn * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* 箱子独立累计进度 */}
                  <div className="mb-3 bg-stone-900/50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-400">📦 累计</span>
                      <div className="flex items-center gap-1">
                        {(gameState.freeCases[c.id] || 0) > 0 && (
                          <span className="text-amber-400 font-bold animate-pulse">🎁 ×{gameState.freeCases[c.id]}</span>
                        )}
                        <span className="text-stone-500">{gameState.caseCounters[c.id] || 0}/10</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${((gameState.caseCounters[c.id] || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className={`text-xl font-bold ${canAfford ? 'text-amber-400' : 'text-stone-500'}`}>¥{c.price}</span>
                      {batchMultiplier > 1 && (
                        <span className="text-sm text-stone-400 ml-1">×{batchMultiplier} = ¥{totalCost}</span>
                      )}
                    </div>
                    <button
                      onClick={() => startOpening(c)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${canAfford ? 'bg-amber-500 hover:bg-amber-400 text-stone-900 hover:scale-105 active:scale-95' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}`}
                    >
                      {canAfford ? ((gameState.freeCases[c.id] || 0) > 0 ? '🎁 免费开箱' : '🔑 开箱') : '余额不足'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // 库存页面
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">我的库存 ({gameState.inventory.length})</h2>
          {gameState.inventory.length === 0 ? (
            <div className="text-center py-20 text-stone-500">
              <Package size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">库存为空，快去开几个箱子吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {gameState.inventory.map((item, idx) => {
                const skin = SKINS.find(s => s.id === item.skinId);
                if (!skin) return null;
                const cfg = RARITY_CONFIG[skin.rarity];
                const weaponName = getWeaponName(skin.weaponId);
                const category = getWeaponCategory(skin.weaponId);
                const recyclePrice = getItemRecyclePrice(item);

                return (
                  <div key={idx} className={`rounded-xl border-2 p-4 ${cfg.border} ${cfg.bg}/10 transition-all hover:scale-105`}>
                    <div className="text-3xl text-center mb-2">
                      {skin.rarity === 'rare_special' ? (skin.weaponId === 'glove' ? '🧤' : '🔪') : '🔫'}
                    </div>
                    <div className={`text-xs font-bold mb-1 ${cfg.textColor}`}>{cfg.name}</div>
                    <div className="text-white font-bold text-sm leading-tight mb-1">{skin.name}</div>
                    <div className="text-stone-400 text-xs">{weaponName} · {category}</div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-stone-700/50 text-stone-300 text-xs rounded">{WEAR_NAMES[item.wear]}</span>
                      {item.statTrak && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded font-bold">StatTrak™</span>}
                    </div>
                    <button
                      onClick={() => recycleSkin(idx)}
                      className="mt-3 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      ♻ 回收 +¥{recyclePrice}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 多槽横向滚动开箱动画
  const renderRolling = () => {
    const { rollSequence, rollOffsets, rollTargets, currentCase, batchCount } = gameState;
    if (rollSequence.length === 0) return null;
    const ITEM_W = 140;
    const CENTER_IDX = 2;
    const overallProgress = rollOffsets.reduce((s, o, i) => s + o / Math.max(rollTargets[i] || 1, 1), 0) / rollOffsets.length;
    const isSlow = overallProgress > 0.75;

    return (
      <div className="fixed inset-0 bg-stone-950/95 flex flex-col items-center justify-center z-50 backdrop-blur-sm p-4">
        {/* 箱子名字 */}
        <div className={`text-4xl mb-1 transition-all ${isSlow ? 'animate-pulse' : ''}`}>
          {currentCase?.image || '📦'}
        </div>
        <p className="text-stone-500 text-xs mb-4 uppercase tracking-widest">
          {currentCase?.name} ×{batchCount}
        </p>

        {/* 多槽滚动容器 */}
        <div className="flex flex-col gap-2 w-full max-w-[700px]">
          {rollSequence.map((seq, slotIdx) => {
            const offset = rollOffsets[slotIdx] || 0;
            const target = rollTargets[slotIdx] || 1;
            const slotProgress = offset / Math.max(target, 1);
            const centerIndex = Math.round(offset / ITEM_W) + CENTER_IDX;

            return (
              <div key={slotIdx} className="relative h-24 rounded-xl overflow-hidden bg-stone-900/50 border border-stone-800">
                {/* 左右渐变遮罩 */}
                <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(12,10,9,0.9), transparent)' }} />
                <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(12,10,9,0.9), transparent)' }} />

                {/* 槽位序号 */}
                <div className="absolute left-2 top-1 z-20 text-[10px] text-stone-600 font-bold">
                  #{slotIdx + 1}
                </div>

                {/* 中心高亮指示器 */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                  <div className="w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid rgba(239,68,68,0.8)' }} />
                  <div className="flex-1 w-[2px] bg-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)] rounded-full" />
                  <div className="w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid rgba(239,68,68,0.8)' }} />
                </div>

                {/* 皮肤卡片横向滚动条 */}
                <div
                  className="flex gap-0 absolute top-1/2 -translate-y-1/2 transition-none"
                  style={{
                    transform: `translateX(${-offset}px)`,
                    left: '50%',
                    marginLeft: `-${CENTER_IDX * ITEM_W + ITEM_W / 2}px`,
                  }}
                >
                  {seq.map((skin, i) => {
                    const cfg = RARITY_CONFIG[skin.rarity];
                    const isCenter = i === centerIndex;
                    return (
                      <div key={i} className="flex-shrink-0 px-0.5">
                        <div
                          className={`w-[136px] py-1.5 px-2 rounded-lg border text-center transition-all ${
                            isCenter ? `${cfg.border} ${cfg.bg} scale-110 shadow-lg ring-1 ring-white/30` : 'border-stone-700 bg-stone-800/50 scale-100'
                          }`}
                        >
                          <div className={`text-[10px] opacity-60 ${isCenter ? '' : 'text-stone-500'}`}>
                            {getWeaponName(skin.weaponId)}
                          </div>
                          <div className={`text-[11px] font-bold truncate ${cfg.textColor}`}>
                            {skin.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className={`mt-4 text-base font-bold transition-colors ${isSlow ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`}>
          {isSlow ? '即将揭晓...' : '开箱中...'}
        </p>
      </div>
    );
  };

  // 结果展示
  const renderResult = () => {
    const results = gameState.openingResults;
    if (results.length === 0) return null;
    const items = lastOpenedItemsRef.current;
    const totalRecycle = items.reduce((s, it) => s + getItemRecyclePrice(it), 0);
    const currentCase = gameState.currentCase;
    if (!currentCase) return null;

    // 再来一次的计算
    const freeAvailable = gameState.freeCases[currentCase.id] || 0;
    const againFreeUsed = Math.min(freeAvailable, batchMultiplier);
    const againPayCount = batchMultiplier - againFreeUsed;
    const againCost = currentCase.price * againPayCount;
    const canAffordAgain = gameState.balance >= againCost || againPayCount === 0;
    const caseCounter = gameState.caseCounters[currentCase.id] || 0;

    // 取最高稀有度作为特效
    const bestSkin = results.reduce((best, r) => {
      const order = ['consumer','industrial','milspec','restricted','classified','covert','rare_special'];
      return order.indexOf(r.rarity) > order.indexOf(best.rarity) ? r : best;
    }, results[0]);

    return (
      <div className="fixed inset-0 bg-stone-950/90 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="max-w-lg w-full text-center">
          {/* 稀有度特效背景 */}
          {bestSkin.rarity === 'rare_special' && (
            <div className="text-5xl mb-2 animate-pulse">✨🌟✨</div>
          )}
          {bestSkin.rarity === 'covert' && (
            <div className="text-4xl mb-2 animate-pulse">🔥🔥🔥</div>
          )}

          {/* 标题 */}
          <p className="text-stone-400 text-sm mb-4">
            {gameState.currentCase?.name} ×{results.length}
          </p>

          {/* 多结果卡片网格 */}
          <div className={`grid gap-3 mb-6 ${results.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {results.map((skin, i) => {
              const cfg = RARITY_CONFIG[skin.rarity];
              const weaponName = getWeaponName(skin.weaponId);
              const category = getWeaponCategory(skin.weaponId);
              const prob = gameState.currentCase?.items
                .filter(it => SKINS.find(s => s.id === it.skinId)?.rarity === skin.rarity)
                .reduce((sum, it) => sum + it.probability, 0) || 0;
              const item = items[i];
              const wearName = item ? WEAR_NAMES[item.wear] : '';

              return (
                <div key={i} className={`rounded-2xl border-2 p-3 ${cfg.bg} ${cfg.border} shadow-lg`}>
                  <div className="text-3xl mb-1">
                    {skin.rarity === 'rare_special' ? (skin.weaponId === 'glove' ? '🧤' : '🔪') : '🔫'}
                  </div>
                  <div className={`text-xs font-bold ${cfg.textColor}`}>{cfg.name}</div>
                  <div className="text-white font-bold text-xs leading-tight truncate">{skin.name}</div>
                  <div className="text-stone-500 text-[10px]">{weaponName}</div>
                  {wearName && <div className="text-stone-400 text-[10px] mt-1">{wearName}</div>}
                  {item?.statTrak && <div className="text-orange-400 text-[10px] font-bold mt-0.5">StatTrak™</div>}
                  <div className="text-stone-500 text-[10px] mt-1">概率 {(prob*100).toFixed(1)}%</div>
                </div>
              );
            })}
          </div>

          {/* 总计回收价格 */}
          <div className="text-emerald-400 font-bold mb-2">总回收价：¥{totalRecycle}</div>

          {/* 当前余额 & 再来一次价格 */}
          <div className="flex items-center justify-center gap-4 mb-3 text-sm">
            <span className="text-stone-400">余额 <span className="text-white font-bold">¥{gameState.balance}</span></span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400">
              再来{results.length}次：
              {againFreeUsed > 0 && <span className="text-amber-400 font-bold">🎁{againFreeUsed} </span>}
              {againPayCount > 0 ? (
                <span className={canAffordAgain ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>¥{againCost}</span>
              ) : (
                <span className="text-emerald-400 font-bold">免费</span>
              )}
            </span>
          </div>

          {/* 该箱子累计进度 */}
          <div className="mb-4 bg-stone-900/60 rounded-lg p-2 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-500">📦 {currentCase.name}</span>
              <div className="flex items-center gap-1">
                {freeAvailable > 0 && <span className="text-amber-400 font-bold text-xs">🎁×{freeAvailable}</span>}
                <span className="text-stone-400">{caseCounter}/10</span>
              </div>
            </div>
            <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(caseCounter / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <button
              onClick={recycleResult}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
            >
              <Trash2 size={18} /> 回收 +¥{totalRecycle}
            </button>
            <button
              onClick={closeResult}
              className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
            >
              保留返回 <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => startOpening(currentCase)}
            disabled={!canAffordAgain}
            className={`w-full mt-2 py-3 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 ${
              canAffordAgain
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-900'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }`}
          >
            {canAffordAgain
              ? (againPayCount === 0 ? '🎁 再来一次 (免费)' : `🔁 再来一次 -¥${againCost}`)
              : '💰 余额不足'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 font-sans">
      {/* 全局背景网格纹理 */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10">
        {gameState.phase === 'MENU' && renderMenu()}
        {gameState.phase === 'CASE_SELECT' && renderCaseSelect()}
        {gameState.phase === 'ROLLING' && renderRolling()}
        {gameState.phase === 'RESULT' && renderResult()}
      </div>
    </div>
  );
}
