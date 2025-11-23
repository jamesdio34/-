
import React, { useState, useEffect } from 'react';
import { UserState, SubjectType, Question, Pokemon } from './types';
import { SUBJECTS, DEFAULT_AVATAR } from './constants';
import BattleScreen from './screens/BattleScreen';
import GachaScreen from './screens/GachaScreen';
import LevelMapScreen from './screens/LevelMapScreen';
import { Button, Card } from './components/UIComponents';
import { BookOpen, RefreshCw, XCircle } from 'lucide-react';

// Transition Overlay Component
const TransitionOverlay: React.FC<{ isActive: boolean; type?: 'shutter' }> = ({ isActive, type = 'shutter' }) => {
    if (!isActive) return null;
    
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col">
            {/* Top Shutter */}
            <div className="bg-slate-900 flex-1 origin-top animate-shutter-in"></div>
            {/* Bottom Shutter */}
            <div className="bg-slate-900 flex-1 origin-bottom animate-shutter-in"></div>
            
            {/* Loading Text */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <p className="text-white font-black text-2xl tracking-widest animate-pulse">LOADING...</p>
            </div>
        </div>
    );
};

// Out Animation Overlay (Reverse)
const TransitionOverlayOut: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col">
            <div className="bg-slate-900 flex-1 origin-top animate-shutter-out"></div>
            <div className="bg-slate-900 flex-1 origin-bottom animate-shutter-out"></div>
        </div>
    );
};

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('hero_user_data');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure new field exists for old users
        if (!parsed.seenQuestions) parsed.seenQuestions = [];
        return parsed;
    }
    return null;
  });

  // Added 'level_map' to the screen state type
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'map' | 'level_map' | 'battle' | 'gacha' | 'inventory' | 'review'>('welcome');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  
  const [battleResult, setBattleResult] = useState<{correct: number, total: number, reward: number} | null>(null);
  
  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTransitionOut, setShowTransitionOut] = useState(false);

useEffect(() => {
    if (user) {
        
        localStorage.setItem('hero_user_data', JSON.stringify(user));
    }
    
    if (currentScreen === 'welcome') setCurrentScreen('map'); 
  }, [user, currentScreen]);

  // --- Handlers ---

  const handleLogin = (name: string) => {
    setUser({
        name,
        avatarUrl: DEFAULT_AVATAR,
        gold: 0,
        completedLevels: { 
            [SubjectType.CHINESE]: 0, 
            [SubjectType.MATH]: 0, 
            [SubjectType.LIFE]: 0,
            [SubjectType.MIXED]: 0
        },
        inventory: [],
        mistakes: [],
        seenQuestions: []
    });
    setCurrentScreen('map');
  };

  const handleSubjectSelect = (subject: SubjectType) => {
      setSelectedSubject(subject);
      setCurrentScreen('level_map');
  };

  const startBattle = (level: number) => {
    if (!selectedSubject) return;
    setSelectedLevel(level);
    setCurrentScreen('battle');
  };

  const handleBattleComplete = (correct: number, total: number, newMistakes: Question[], allQuestions: Question[]) => {
    const goldEarned = correct * (5 + selectedLevel); // Base 5 + level scaling
    const isWin = correct / total >= 0.6; // 60% pass

    setBattleResult({ correct, total, reward: goldEarned });

    setUser(prev => {
        if (!prev) return null;
        const newCompleted = { ...prev.completedLevels };
        
        // Update max level if passed and current level was the max
        // For Chaos Tower, completedLevels stores the max floor reached
        if (isWin) {
             const currentMax = newCompleted[selectedSubject!] || 0;
             if (selectedLevel > currentMax) {
                 newCompleted[selectedSubject!] = selectedLevel;
             }
        }

        const mistakesMapped = newMistakes.map(q => ({
            id: q.id,
            question: q.text,
            correctAnswer: q.options[q.correctIndex],
            subject: selectedSubject!,
            timestamp: Date.now()
        }));

        // Track seen questions
        const newSeenQuestions = allQuestions.map(q => q.text);
        const updatedSeenHistory = [...prev.seenQuestions, ...newSeenQuestions];
        const uniqueHistory = Array.from(new Set(updatedSeenHistory)); 

        return {
            ...prev,
            gold: prev.gold + goldEarned,
            completedLevels: newCompleted,
            mistakes: [...prev.mistakes, ...mistakesMapped],
            seenQuestions: uniqueHistory
        };
    });
  };

  const handleCloseBattleResult = () => {
    setBattleResult(null);
    
    // Start Transition Sequence
    setIsTransitioning(true);
    
    // 1. Wait for shutter to close (500ms)
    setTimeout(() => {
        setCurrentScreen('level_map');
        
        // 2. Wait slightly more, then un-shutter
        setTimeout(() => {
            setIsTransitioning(false);
            setShowTransitionOut(true);
            
            // 3. Cleanup Out animation
            setTimeout(() => {
                setShowTransitionOut(false);
            }, 500);
        }, 200);
    }, 500);
  };

  const handleEquipPokemon = (poke: Pokemon) => {
    setUser(prev => prev ? ({ ...prev, avatarUrl: poke.spriteUrl }) : null);
  };

  // --- Render Screens ---

  if (!user || currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-blue-400 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <Card className="max-w-md w-full text-center space-y-6 py-12">
            <h1 className="text-4xl font-black text-slate-800 tracking-wider">🌟 小勇者模擬考 🌟</h1>
            <div className="text-6xl animate-bounce">🛡️</div>
            <p className="text-slate-500">準備好挑戰怪獸了嗎？</p>
            <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get('username') as string;
                if(name.trim()) handleLogin(name);
            }}>
                <input 
                    name="username" 
                    placeholder="輸入你的名字" 
                    className="w-full text-center text-2xl p-4 border-b-4 border-slate-200 rounded-xl bg-slate-50 mb-4 focus:outline-none focus:border-blue-400"
                    autoFocus
                />
                <Button type="submit" size="lg" className="w-full">開始冒險</Button>
            </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Transition Effects */}
      <TransitionOverlay isActive={isTransitioning} />
      {showTransitionOut && <TransitionOverlayOut />}

      {currentScreen === 'level_map' && selectedSubject && (
          <LevelMapScreen 
            subject={selectedSubject}
            currentLevel={user.completedLevels[selectedSubject] || 0}
            userAvatar={user.avatarUrl}
            onLevelSelect={startBattle}
            onBack={() => setCurrentScreen('map')}
          />
      )}

      {currentScreen === 'battle' && selectedSubject && (
        <>
            <BattleScreen 
                subject={selectedSubject} 
                level={selectedLevel} 
                seenQuestions={user.seenQuestions}
                onComplete={handleBattleComplete} 
                onBack={() => setCurrentScreen('level_map')}
            />
            {battleResult && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-8 border-yellow-400 animate-pop relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-4 bg-yellow-400"></div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4">
                            {battleResult.correct / battleResult.total === 1 ? '🏆 完美過關！' : battleResult.correct / battleResult.total >= 0.6 ? '🎉 挑戰成功！' : '💪 再接再厲！'}
                        </h2>
                        <div className="text-6xl mb-4">
                            {battleResult.correct / battleResult.total >= 0.6 ? '🤩' : '🥺'}
                        </div>
                        <p className="text-xl text-slate-600 mb-2">
                            答對 {battleResult.correct} / {battleResult.total} 題
                        </p>
                        <div className="bg-yellow-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-yellow-700 font-bold">獲得金幣</p>
                            <p className="text-4xl font-black text-yellow-500">+{battleResult.reward}</p>
                        </div>
                        <Button size="lg" onClick={handleCloseBattleResult} className="w-full">
                            繼續冒險
                        </Button>
                    </div>
                </div>
            )}
        </>
      )}

      {currentScreen === 'gacha' && (
          <GachaScreen 
            userGold={user.gold}
            onSpendGold={(amt) => setUser(prev => prev ? ({...prev, gold: prev.gold - amt}) : null)}
            onGetPokemon={(poke) => setUser(prev => prev ? ({...prev, inventory: [...prev.inventory, poke]}) : null)}
            onClose={() => setCurrentScreen('map')}
          />
      )}

      {/* Map Screen (Main Dashboard) */}
      {currentScreen !== 'level_map' && currentScreen !== 'battle' && currentScreen !== 'gacha' && (
      <div className="pb-20">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center px-4 md:px-8">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={user.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-200 object-cover" />
                    <button 
                        onClick={() => setCurrentScreen('inventory')}
                        className="absolute -bottom-1 -right-1 bg-slate-700 text-white text-[10px] p-1 rounded-full"
                    >🔄</button>
                </div>
                <div>
                    <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500">LV.{Math.max(0, ...(Object.values(user.completedLevels) as number[])) + 1} 勇者</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                <span className="text-xl">💰</span>
                <span className="font-bold text-yellow-700">{user.gold}</span>
            </div>
        </div>

        {/* Main Map Content */}
        <div className="p-4 max-w-lg mx-auto space-y-6 mt-4">
            
            {currentScreen === 'map' && (
                <div className="grid grid-cols-1 gap-6">
                    {SUBJECTS.map((sub) => {
                        const currentLevel = user.completedLevels[sub.id] || 0;
                        const isChaos = sub.id === SubjectType.MIXED;
                        const maxLevel = isChaos ? 999 : 50; // Chaos has no real limit visual
                        const progressPercent = Math.min(100, (currentLevel / 50) * 100); // 50 is just a visual scale
                        
                        return (
                        <button 
                            key={sub.id}
                            onClick={() => handleSubjectSelect(sub.id)}
                            className={`relative group overflow-hidden rounded-3xl h-48 w-full text-left transition-all hover:scale-[1.02] hover:shadow-xl border-b-8 ${sub.borderColor} ${sub.color}`}
                        >
                            {/* Background Decor */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                {sub.id === SubjectType.CHINESE && (
                                    <div className="absolute bottom-0 w-full h-24 bg-repeat-x" style={{backgroundImage: 'radial-gradient(circle, white 10px, transparent 11px)', backgroundSize: '30px 30px'}}></div>
                                )}
                                {sub.id === SubjectType.MATH && (
                                    <div className="absolute bottom-0 w-full h-full flex items-end justify-around">
                                        <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[100px] border-l-transparent border-r-transparent border-b-white opacity-30"></div>
                                        <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[60px] border-l-transparent border-r-transparent border-b-white opacity-20"></div>
                                        <div className="w-0 h-0 border-l-[70px] border-r-[70px] border-b-[140px] border-l-transparent border-r-transparent border-b-white opacity-30"></div>
                                    </div>
                                )}
                                {sub.id === SubjectType.LIFE && (
                                    <div className="absolute bottom-0 w-full h-32 opacity-30">
                                        <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                                            <path fill="white" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                        </svg>
                                    </div>
                                )}
                                {isChaos && (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/10 to-transparent animate-pulse"></div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-4xl font-black text-white drop-shadow-md flex items-center gap-3 font-display">
                                            <span className="text-5xl filter drop-shadow-lg">{sub.icon}</span> 
                                            {sub.name}
                                        </h2>
                                        <p className="text-white/90 font-bold mt-1 text-lg tracking-wide">{sub.description}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 shadow-lg text-center min-w-[80px]">
                                        <div className="text-xs text-white font-bold uppercase tracking-wider">{isChaos ? 'Floor' : 'Level'}</div>
                                        <div className="text-4xl font-black text-white drop-shadow-md leading-none">{currentLevel}</div>
                                    </div>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-white font-bold text-sm px-1">
                                        <span>{isChaos ? '無盡挑戰' : '冒險進度'}</span>
                                        <span>{isChaos ? `目前層數: ${currentLevel}` : `${currentLevel}/${maxLevel} 關卡`}</span>
                                    </div>
                                    <div className="h-6 bg-black/20 rounded-full p-1 backdrop-blur-sm border border-white/10 shadow-inner">
                                        <div 
                                            className={`h-full rounded-full shadow-[0_2px_10px_rgba(255,223,0,0.6)] relative overflow-hidden transition-all duration-1000 ease-out ${isChaos ? 'bg-purple-400 w-full' : 'bg-gradient-to-r from-yellow-300 to-yellow-500'}`}
                                            style={{ width: isChaos ? '100%' : `${Math.max(2, progressPercent)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    )})}
                </div>
            )}

            {currentScreen === 'inventory' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentScreen('map')} className="bg-white p-2 rounded-full shadow">⬅️</button>
                        <h2 className="text-2xl font-bold text-slate-700">我的寶可夢夥伴</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {user.inventory.map((poke, i) => (
                            <button key={i} onClick={() => handleEquipPokemon(poke)} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
                                <img src={poke.spriteUrl} className="w-16 h-16 object-contain" />
                                <span className="text-xs font-bold text-slate-500 mt-2 capitalize">{poke.name}</span>
                                {user.avatarUrl === poke.spriteUrl && <span className="text-[10px] text-green-500 bg-green-100 px-2 rounded-full mt-1">使用中</span>}
                            </button>
                        ))}
                        {user.inventory.length === 0 && (
                            <div className="col-span-3 text-center py-10 text-slate-400">
                                還沒有寶可夢喔！快去轉蛋吧！
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentScreen === 'review' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentScreen('map')} className="bg-white p-2 rounded-full shadow">⬅️</button>
                        <h2 className="text-2xl font-bold text-slate-700">錯題筆記本</h2>
                    </div>
                    {user.mistakes.length === 0 ? (
                        <Card className="text-center py-12 text-slate-400">
                            太棒了！目前沒有錯誤紀錄！✨
                        </Card>
                    ) : (
                        user.mistakes.slice().reverse().map((m, i) => (
                            <Card key={i} className="border-l-8 border-l-red-400">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded">{m.subject}</span>
                                    <button 
                                        onClick={() => setUser(prev => prev ? {...prev, mistakes: prev.mistakes.filter(x => x.timestamp !== m.timestamp)} : null)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>
                                <p className="font-bold text-slate-800 text-lg mb-2">{m.question}</p>
                                <p className="text-green-600 font-bold bg-green-50 p-2 rounded">正解：{m.correctAnswer}</p>
                            </Card>
                        ))
                    )}
                </div>
            )}

        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-40">
            {currentScreen === 'map' && (
                <>
                    <Button 
                        variant="secondary" 
                        className="rounded-full shadow-2xl flex items-center gap-2 px-6"
                        onClick={() => setCurrentScreen('gacha')}
                    >
                        <RefreshCw size={24} className="animate-spin-slow" /> 轉蛋機
                    </Button>
                    <Button 
                        variant="primary" 
                        className="rounded-full shadow-2xl bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        onClick={() => setCurrentScreen('review')}
                    >
                        <BookOpen size={24} /> 錯題本
                    </Button>
                </>
            )}
        </div>

      </div>
      )}
    </div>
  );
};

export default App;
