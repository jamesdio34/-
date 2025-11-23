
import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components/UIComponents';
import { Pokemon } from '../types';
import { drawOnePokemon } from '../services/pokeService';
import { GACHA_COST } from '../constants';

interface GachaScreenProps {
  userGold: number;
  onSpendGold: (amount: number) => void;
  onGetPokemon: (pokemon: Pokemon) => void;
  onClose: () => void;
}

type BallType = 'poke' | 'great' | 'ultra' | 'master';
type GachaState = 'idle' | 'dropping' | 'shaking' | 'flash' | 'result';

// CSS-drawn Poké Ball Component
const PokeBall: React.FC<{ type: BallType; className?: string }> = ({ type, className = '' }) => {
  const baseColors = {
    poke: 'bg-red-600',
    great: 'bg-blue-600',
    ultra: 'bg-slate-900',
    master: 'bg-purple-600',
  };

  return (
    <div className={`relative w-48 h-48 rounded-full border-[6px] border-slate-900 overflow-hidden shadow-2xl bg-white ${className}`}>
      {/* Top Half */}
      <div className={`absolute inset-0 h-1/2 ${baseColors[type]} border-b-[6px] border-slate-900`}>
        {/* Great Ball Decorations */}
        {type === 'great' && (
           <>
             <div className="absolute top-0 left-4 w-12 h-24 bg-red-500 rotate-45 opacity-80 rounded-full transform -translate-x-2 -translate-y-4"></div>
             <div className="absolute top-0 right-4 w-12 h-24 bg-red-500 -rotate-45 opacity-80 rounded-full transform translate-x-2 -translate-y-4"></div>
           </>
        )}
        {/* Ultra Ball Decorations */}
        {type === 'ultra' && (
           <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-32 border-[12px] border-yellow-400 rounded-full clip-top-half"></div>
        )}
        {/* Master Ball Decorations */}
        {type === 'master' && (
           <>
             <div className="absolute top-4 left-6 w-8 h-8 bg-pink-400 rounded-full opacity-80"></div>
             <div className="absolute top-4 right-6 w-8 h-8 bg-pink-400 rounded-full opacity-80"></div>
             <div className="absolute top-1 left-1/2 -translate-x-1/2 font-black text-white opacity-30 text-4xl font-display">M</div>
           </>
        )}
        {/* Shine Reflection */}
        <div className="absolute top-3 left-8 w-12 h-6 bg-white rounded-full opacity-30 rotate-[-20deg]"></div>
      </div>

      {/* Center Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white border-[6px] border-slate-900 rounded-full z-10 flex items-center justify-center shadow-inner">
         <div className="w-8 h-8 border-2 border-slate-300 rounded-full"></div>
      </div>
    </div>
  );
};

const GachaScreen: React.FC<GachaScreenProps> = ({ userGold, onSpendGold, onGetPokemon, onClose }) => {
  const [gameState, setGameState] = useState<GachaState>('idle');
  const [reward, setReward] = useState<Pokemon | null>(null);
  const [currentBall, setCurrentBall] = useState<BallType>('poke');

  const pickRandomBall = (): BallType => {
      const rand = Math.random();
      if (rand > 0.98) return 'master'; // 2%
      if (rand > 0.85) return 'ultra';  // 13%
      if (rand > 0.60) return 'great';  // 25%
      return 'poke';                    // 60%
  };

  const handleSpin = async () => {
    if (userGold < GACHA_COST) return;
    
    onSpendGold(GACHA_COST);
    setReward(null);
    setCurrentBall(pickRandomBall());
    
    // 1. Start Animation: Ball drops in
    setGameState('dropping');

    // Fetch Data in background
    const pokemonPromise = drawOnePokemon();

    // 2. Wait for drop to finish, then shake
    setTimeout(() => {
        setGameState('shaking');
    }, 800);

    // 3. Shake for a while (creating tension)
    setTimeout(async () => {
        const pokemon = await pokemonPromise;
        setReward(pokemon);
        onGetPokemon(pokemon);
        
        // 4. Open/Flash
        setGameState('flash');

        // 5. Show Result
        setTimeout(() => {
            setGameState('result');
        }, 500);

    }, 3000); // Total animation time matches the "3 shakes" feel
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Flash Effect Overlay */}
      {gameState === 'flash' && <div className="absolute inset-0 z-[60] bg-white animate-flash pointer-events-none"></div>}

      <button onClick={onClose} className="absolute top-6 left-6 bg-white rounded-full p-2 shadow-lg text-xl z-50 hover:scale-110 transition">
        ⬅️ 回地圖
      </button>
      
      <div className="w-full max-w-md text-center relative z-10">
        
        {/* Title only when idle */}
        {gameState === 'idle' && (
            <h1 className="text-4xl font-display font-black text-white drop-shadow-md mb-8 animate-bounce-slow">
                神奇扭蛋機
            </h1>
        )}

        <Card className={`mb-8 bg-gradient-to-b from-slate-700 to-slate-600 border-4 border-slate-900 shadow-2xl relative overflow-visible min-h-[400px] flex flex-col items-center justify-center transition-all duration-500 ${gameState !== 'idle' ? 'scale-105' : ''}`}>
           
           {/* Background Pattern inside Machine */}
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_2px,transparent_2.5px)] bg-[length:20px_20px]"></div>

           {/* --- IDLE STATE --- */}
           {gameState === 'idle' && (
               <>
                 <div className="text-6xl mb-4 animate-pulse">❓</div>
                 <p className="text-slate-300 font-bold">今天會抓到誰呢？</p>
               </>
           )}

           {/* --- ANIMATION STATES --- */}
           {(gameState === 'dropping' || gameState === 'shaking' || gameState === 'flash') && (
               <div className="relative">
                   <PokeBall 
                        type={currentBall} 
                        className={`
                            ${gameState === 'dropping' ? 'animate-drop-bounce' : ''}
                            ${gameState === 'shaking' ? 'animate-shake-hard' : ''}
                        `} 
                   />
                   {gameState === 'shaking' && (
                       <div className="absolute -left-12 top-1/2 text-white font-black text-2xl animate-ping">咚!</div>
                   )}
                   {gameState === 'shaking' && (
                       <div className="absolute -right-12 top-1/2 text-white font-black text-2xl animate-ping delay-100">咚!</div>
                   )}
               </div>
           )}

           {/* --- RESULT STATE --- */}
           {gameState === 'result' && reward && (
               <div className="animate-pop flex flex-col items-center relative z-20">
                   {/* Burst Effect Behind */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-50 animate-pulse -z-10"></div>
                   
                   <img 
                        src={reward.spriteUrl} 
                        alt={reward.name} 
                        className="w-48 h-48 object-contain drop-shadow-2xl filter" 
                   />
                   <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full mt-4 shadow-xl border-2 border-yellow-400 transform scale-110">
                        <p className="text-3xl font-black text-slate-800 capitalize">{reward.name}</p>
                   </div>
                   <div className="mt-2 text-yellow-300 font-bold text-lg animate-bounce">✨ 收服成功！ ✨</div>
               </div>
           )}

        </Card>

        {/* Controls */}
        {gameState === 'idle' && (
             <div className="space-y-4">
                 <div className="bg-slate-900/50 rounded-xl p-2 inline-block border border-white/20 mb-2">
                    <p className="text-slate-300 text-xs uppercase font-bold tracking-wider">持有金幣</p>
                    <div className="flex items-center justify-center text-3xl font-bold text-yellow-400 gap-2">
                        💰 {userGold}
                    </div>
                 </div>

                 <Button 
                    size="lg" 
                    variant={userGold >= GACHA_COST ? 'secondary' : 'danger'} 
                    onClick={handleSpin}
                    disabled={userGold < GACHA_COST}
                    className="w-full text-2xl py-6 shadow-[0_6px_0_rgb(0,0,0,0.4)] active:shadow-none active:translate-y-2 border-none bg-yellow-400 hover:bg-yellow-300 text-yellow-900"
                 >
                    {userGold >= GACHA_COST ? `投入 ${GACHA_COST} 金幣扭蛋` : '金幣不足'}
                 </Button>
             </div>
        )}

        {gameState === 'result' && (
            <Button size="lg" variant="success" onClick={() => setGameState('idle')} className="w-full shadow-[0_6px_0_rgba(0,0,0,0.3)] animate-wiggle">
                太棒了！
            </Button>
        )}
      </div>
    </div>
  );
};

export default GachaScreen;
