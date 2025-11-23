
import React, { useEffect, useRef, useMemo } from 'react';
import { SubjectType } from '../types';
import { SUBJECTS } from '../constants';
import { Lock, Star, Skull } from 'lucide-react';

interface LevelMapScreenProps {
  subject: SubjectType;
  currentLevel: number;
  userAvatar: string;
  onLevelSelect: (level: number) => void;
  onBack: () => void;
}

const LEVEL_GAP = 80;
const X_AMPLITUDE = 120;
const TOTAL_LEVELS = 50;

// Theme Configuration based on Subject
const getTheme = (subject: SubjectType) => {
  switch (subject) {
    case SubjectType.CHINESE:
      return {
        bgClass: "bg-gradient-to-b from-emerald-100 to-green-300",
        pattern: "url('https://www.transparenttextures.com/patterns/forest.png')",
        pathColor: "#8B4513", // Dirt brown
        pathWidth: 16,
        pathDash: "none",
        nodeColor: "bg-green-500",
        nodeBorder: "border-green-200",
        decor: (
          <>
            <div className="absolute top-10 left-10 text-6xl opacity-20 pointer-events-none">🌲</div>
            <div className="absolute top-40 right-20 text-5xl opacity-20 pointer-events-none">🌳</div>
            <div className="absolute bottom-20 left-10 text-6xl opacity-20 pointer-events-none">🌿</div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-multiply pointer-events-none"></div>
          </>
        )
      };
    case SubjectType.MATH:
      return {
        bgClass: "bg-gradient-to-b from-slate-800 via-red-900 to-orange-900",
        pattern: "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
        pathColor: "#f97316", // Lava Orange
        pathWidth: 12,
        pathDash: "none",
        nodeColor: "bg-red-600",
        nodeBorder: "border-red-900",
        decor: (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500 rounded-full animate-ping opacity-50"></div>
               <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-red-500 rounded-full animate-ping delay-700 opacity-50"></div>
            </div>
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-orange-500/20 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
          </>
        )
      };
    case SubjectType.LIFE:
      return {
        bgClass: "bg-gradient-to-b from-cyan-200 to-blue-500",
        pattern: "url('https://www.transparenttextures.com/patterns/cubes.png')",
        pathColor: "#e0f2fe", // Light water blue
        pathWidth: 16,
        pathDash: "10 5", // Dashed for bubbles/foam
        nodeColor: "bg-blue-500",
        nodeBorder: "border-cyan-200",
        decor: (
          <>
            <div className="absolute top-20 left-10 text-4xl opacity-30 animate-bounce-slow pointer-events-none">🐟</div>
            <div className="absolute bottom-40 right-10 text-5xl opacity-30 animate-pulse pointer-events-none">🫧</div>
            <div className="absolute top-1/2 left-1/3 text-6xl opacity-10 animate-spin-slow pointer-events-none">🐢</div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none"></div>
          </>
        )
      };
    case SubjectType.MIXED:
    default:
      return {
        bgClass: "bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900",
        pattern: "url('https://www.transparenttextures.com/patterns/wall-4-light.png')",
        pathColor: "#d8b4fe", // Neon Purple
        pathWidth: 14,
        pathDash: "none",
        nodeColor: "bg-purple-600",
        nodeBorder: "border-purple-400",
        decor: (
           <>
             <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_150%)] pointer-events-none"></div>
             <div className="absolute top-10 right-10 text-yellow-400 opacity-30 animate-pulse text-4xl pointer-events-none">✨</div>
             <div className="absolute bottom-1/3 left-10 text-purple-300 opacity-20 animate-bounce text-6xl pointer-events-none">🔮</div>
           </>
        )
      };
  }
};

const LevelMapScreen: React.FC<LevelMapScreenProps> = ({ 
  subject, 
  currentLevel, 
  userAvatar,
  onLevelSelect, 
  onBack 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const subjectConfig = SUBJECTS.find(s => s.id === subject);
  const isChaos = subject === SubjectType.MIXED;
  const theme = getTheme(subject);

  const levelsToList = useMemo(() => {
    const levels = [];
    const max = isChaos ? Math.max(TOTAL_LEVELS, currentLevel + 10) : TOTAL_LEVELS;
    // Render level 1 at bottom, max at top
    for (let i = 1; i <= max; i++) {
        levels.push(i);
    }
    return levels;
  }, [isChaos, currentLevel]);

  useEffect(() => {
    if (scrollContainerRef.current) {
        const totalHeight = levelsToList.length * LEVEL_GAP + 300;
        const currentLevelY = (currentLevel - 1) * LEVEL_GAP; 
        // Center the current level
        const scrollPos = totalHeight - currentLevelY - (window.innerHeight / 2) - 100;
        
        scrollContainerRef.current.scrollTo({
            top: scrollPos,
            behavior: 'smooth'
        });
    }
  }, [currentLevel, levelsToList.length]);

  const getPosition = (level: number) => {
      const reversedIndex = levelsToList.length - level; 
      const y = reversedIndex * LEVEL_GAP + 150; // Padding top
      const xOffset = Math.sin(level * 0.8) * X_AMPLITUDE;
      return { x: xOffset, y };
  };

  const pathData = useMemo(() => {
      let d = "";
      levelsToList.forEach((lvl, index) => {
          const pos = getPosition(lvl);
          if (index === 0) {
              d += `M ${pos.x} ${pos.y}`;
          } else {
              const prevLvl = levelsToList[index - 1];
              const prevPos = getPosition(prevLvl);
              d += ` C ${prevPos.x} ${prevPos.y + 40}, ${pos.x} ${pos.y - 40}, ${pos.x} ${pos.y}`;
          }
      });
      return d;
  }, [levelsToList]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className={`relative z-30 p-4 shadow-xl flex items-center justify-between text-white bg-black/20 backdrop-blur-md border-b border-white/10`}>
        <button onClick={onBack} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition active:scale-95">
             ⬅️ 
        </button>
        <div className="text-center">
             <h2 className="text-2xl font-black font-display tracking-wider drop-shadow-md">{subjectConfig?.name}</h2>
             <p className="text-xs opacity-90 font-bold bg-black/30 px-3 py-1 rounded-full mt-1 inline-block">
               目前進度: LV.{currentLevel}
             </p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Map Scroll Area */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto relative custom-scrollbar ${theme.bgClass}`}
        style={{
            backgroundImage: `
                ${theme.bgClass.includes('gradient') ? '' : theme.bgClass}, 
                ${theme.pattern}
            `,
            backgroundBlendMode: 'overlay',
            backgroundAttachment: 'local' // Patterns scroll with content
        }}
      >
        {theme.decor}

        <div 
            className="relative mx-auto max-w-md w-full min-h-full pb-32"
            style={{ height: `${levelsToList.length * LEVEL_GAP + 300}px` }}
        >
            {/* SVG Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ left: '50%' }}>
                {/* Path Shadow/Border */}
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke="rgba(0,0,0,0.3)" 
                    strokeWidth={theme.pathWidth + 4} 
                    strokeLinecap="round"
                />
                {/* Main Path */}
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke={theme.pathColor}
                    strokeWidth={theme.pathWidth} 
                    strokeDasharray={theme.pathDash}
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                />
            </svg>

            {/* Nodes */}
            {levelsToList.map((lvl) => {
                const pos = getPosition(lvl);
                const isLocked = lvl > currentLevel + 1; 
                const isCompleted = lvl <= currentLevel;
                const isCurrent = lvl === currentLevel + 1;
                const isBoss = lvl % 5 === 0;

                return (
                    <div 
                        key={lvl}
                        className="absolute flex flex-col items-center justify-center z-10"
                        style={{ 
                            left: '50%', 
                            top: `${pos.y}px`,
                            transform: `translate(-50%, -50%) translateX(${pos.x}px)`
                        }}
                    >
                        {/* Avatar on current playable level */}
                        {isCurrent && (
                             <div className="absolute -top-20 animate-bounce z-30 drop-shadow-2xl filter">
                                <div className="relative">
                                    <img src={userAvatar} className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 shadow-lg object-cover" />
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-red-400">
                                        在這裡!
                                    </div>
                                </div>
                             </div>
                        )}

                        <button
                            onClick={() => !isLocked && onLevelSelect(lvl)}
                            disabled={isLocked}
                            className={`
                                relative flex items-center justify-center transition-all duration-300
                                ${isBoss ? 'w-24 h-24' : 'w-16 h-16'}
                                ${isLocked 
                                    ? 'bg-slate-300/80 border-4 border-slate-400 grayscale cursor-not-allowed backdrop-blur-sm' 
                                    : isCompleted 
                                        ? `${theme.nodeColor} ${theme.nodeBorder} border-4 shadow-md scale-90 hover:scale-100`
                                        : `${theme.nodeColor} ${theme.nodeBorder} border-4 shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-110 hover:scale-125 animate-pulse`
                                }
                                rounded-full
                            `}
                        >
                            {isLocked ? (
                                <Lock className="text-slate-500 w-6 h-6" />
                            ) : isBoss ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {isCompleted ? (
                                         <Skull className="w-12 h-12 text-white/60" />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                                            <Skull className="w-12 h-12 text-white drop-shadow-lg animate-wiggle" />
                                        </>
                                    )}
                                </div>
                            ) : isCompleted ? (
                                <Star className="text-yellow-300 fill-yellow-300 w-8 h-8 drop-shadow-sm" />
                            ) : (
                                <span className="text-2xl font-black text-white drop-shadow-md font-display">{lvl}</span>
                            )}
                        </button>

                        {/* Level Number Label for boss or locked */}
                        {(isLocked || isBoss) && (
                            <div className="absolute -bottom-7 bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold text-white border border-white/20 shadow-sm">
                                Level {lvl}
                            </div>
                        )}
                    </div>
                );
            })}
            
            {/* Start Podium */}
            <div 
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                style={{ top: `${levelsToList.length * LEVEL_GAP + 160}px` }}
            >
                <div className={`w-32 h-12 ${theme.nodeColor} opacity-50 rounded-full ellipse blur-sm`}></div>
                <div className={`w-28 h-8 ${theme.nodeColor} rounded-full ellipse border-4 border-white/50 -mt-10 flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-black text-sm uppercase tracking-widest">Start</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMapScreen;
