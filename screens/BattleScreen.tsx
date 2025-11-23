
import React, { useEffect, useState, useRef } from 'react';
import { SubjectType, Question, BossData } from '../types';
import { generateBoss, generateQuestions, playAudioFromBase64 } from '../services/geminiService';
import { Button, Card, LoadingSpinner } from '../components/UIComponents';
import { Mic, Volume2, Star } from 'lucide-react';

interface BattleScreenProps {
  subject: SubjectType;
  level: number;
  seenQuestions: string[];
  onComplete: (correctCount: number, total: number, mistakes: Question[], allQuestions: Question[]) => void;
  onBack: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ subject, level, seenQuestions, onComplete, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [boss, setBoss] = useState<BossData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [battleState, setBattleState] = useState<'intro' | 'fighting' | 'finished'>('intro');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false); // True after answering, before next Q
  
  // Animation state for boss: 'idle' (bounce), 'speaking' (pulse/scale), 'shaking' (shake)
  const [bossAction, setBossAction] = useState<'idle' | 'speaking' | 'shaking'>('idle');

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initBattle = async () => {
      try {
        const [qData, bData] = await Promise.all([
          generateQuestions(subject, level, seenQuestions),
          generateBoss(subject, level)
        ]);
        setQuestions(qData);
        setBoss(bData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initBattle();
  }, [subject, level, seenQuestions]);

  const handlePlayTaunt = async () => {
    // Stop any currently playing speech to avoid overlap
    window.speechSynthesis.cancel();
    setBossAction('speaking');

    const onComplete = () => {
      setBossAction('shaking');
      // Revert to idle after shake animation completes (0.5s)
      setTimeout(() => setBossAction('idle'), 500);
    };

    if (boss?.tauntAudioBase64) {
      await playAudioFromBase64(boss.tauntAudioBase64);
      onComplete();
    } else if (boss?.tauntText) {
        // Browser Speech Synthesis (Web Speech API)
        const utterance = new SpeechSynthesisUtterance(boss.tauntText);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.9; // Slightly slower for dramatic effect
        utterance.pitch = 0.8; // Slightly lower pitch for monster effect

        // Attempt to find a Chinese voice
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang.includes('zh'));
        if (zhVoice) {
            utterance.voice = zhVoice;
        }

        utterance.onend = onComplete;
        window.speechSynthesis.speak(utterance);
    } else {
        // No audio, just finish immediately
        onComplete();
    }
  };

  // Auto play taunt when boss appears
  useEffect(() => {
    if (!loading && boss && battleState === 'intro') {
      // Small delay to allow render
      const t = setTimeout(() => handlePlayTaunt(), 800);
      return () => clearTimeout(t);
    }
  }, [loading, boss, battleState]);

  const handleStartFight = () => {
    setBattleState('fighting');
  };

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);
    
    const isCorrect = index === questions[currentQIndex].correctIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setMistakes(prev => [...prev, questions[currentQIndex]]);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    
    // Update correct count logic in handleAnswer is enough
    // We need to capture the updated correctCount for final result
    let finalCorrect = correctCount;
    // if (selectedOption === questions[currentQIndex].correctIndex) {
    //     finalCorrect = correctCount + 1; 
    // }
    // Actually correctCount state is already updated in handleAnswer, so just use it. 
    // BUT React state update is async. For safety, in onComplete calculation we used state directly.

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setBattleState('finished');
      // Delay to show the finishing animation before triggering the modal
      setTimeout(() => {
        onComplete(
            correctCount, 
            questions.length, 
            mistakes,
            questions
        );
      }, 2500); // Wait for animation
    }
  };

  const renderDifficulty = (difficulty: number = 1) => {
    // Default to 1 if undefined
    const stars = Math.max(1, Math.min(3, difficulty));
    return (
      <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
        <span className="text-xs text-yellow-800 font-bold">難度</span>
        <div className="flex">
          {[1, 2, 3].map(i => (
            <Star 
              key={i} 
              size={16} 
              className={`${i <= stars ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`} 
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900/50 absolute inset-0 z-50 backdrop-blur-sm">
        <Card className="w-80 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">正在召喚 {subject} 怪獸...</p>
        </Card>
      </div>
    );
  }

  if (battleState === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-slate-900 p-4 animate-fade-in">
        <div className="absolute top-4 left-4">
             <Button variant="secondary" size="sm" onClick={onBack}>逃跑</Button>
        </div>
        
        <div className="w-full max-w-md text-center space-y-8">
            <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-widest text-red-500 font-display">
                BOSS 出現了！
            </h1>
            
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <img 
                    src={boss?.imageUrl} 
                    alt={boss?.name} 
                    className={`
                        relative w-64 h-64 mx-auto rounded-3xl border-4 border-white shadow-2xl object-cover
                        animate-pop
                        ${bossAction === 'speaking' ? 'animate-pulse scale-105 shadow-yellow-400' : ''}
                        ${bossAction === 'shaking' ? 'animate-shake ring-4 ring-red-500' : ''}
                        ${bossAction === 'idle' ? 'animate-bounce-slow' : ''}
                        transition-all duration-300
                    `}
                />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">{boss?.name}</h2>
                <div className="flex items-center justify-center gap-2 text-white text-xl bg-black/40 p-4 rounded-xl">
                    <Volume2 className={`w-6 h-6 text-yellow-400 ${bossAction === 'speaking' ? 'animate-ping' : ''}`} />
                    <span>「{boss?.tauntText}」</span>
                </div>
                <button onClick={handlePlayTaunt} className="mt-2 text-sm text-slate-300 underline hover:text-white" disabled={bossAction !== 'idle'}>
                    {bossAction === 'speaking' ? '嗆聲中...' : '再聽一次嗆聲 🔊'}
                </button>
            </div>

            <Button variant="danger" size="lg" onClick={handleStartFight} className="w-full animate-wiggle">
                接受挑戰！⚔️
            </Button>
        </div>
      </div>
    );
  }

  // Fight Mode
  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  if (battleState === 'finished') {
    // Calculate tentative result for display
    const isWin = (correctCount / questions.length) >= 0.6;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
            {/* Background Slash Effect */}
            <div className="absolute inset-0 bg-slate-900"></div>
            <div className="absolute inset-0 bg-red-600 transform -skew-x-12 translate-x-full animate-slash opacity-50"></div>
            
            {/* Text Impact */}
            <div className="relative z-10 text-center animate-slam-enter">
                <h1 className={`text-8xl font-black italic tracking-tighter ${isWin ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {isWin ? 'VICTORY!' : 'FINISHED'}
                </h1>
                <div className="h-2 w-full bg-white mt-4"></div>
            </div>

            {/* Particles / Flash */}
            <div className="absolute inset-0 bg-white animate-flash pointer-events-none mix-blend-overlay"></div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col p-4 max-w-2xl mx-auto">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 bg-gray-300 h-4 rounded-full overflow-hidden border-2 border-gray-400">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="ml-4 font-bold text-slate-700 text-xl">
            {currentQIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Boss Mini View */}
      <div className="flex items-center justify-center mb-6 space-x-4">
        <img src={boss?.imageUrl} className="w-20 h-20 rounded-full border-4 border-red-500 bg-white" />
        <div className="bg-white p-3 rounded-xl rounded-tl-none border-2 border-slate-200 shadow-sm relative">
            <p className="text-slate-700 font-bold">{boss?.tauntText}</p>
        </div>
      </div>

      {/* Question Card */}
      <Card className="flex-1 flex flex-col justify-center mb-4 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          {renderDifficulty(currentQ?.difficulty)}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed mt-6">
            {currentQ?.text}
        </h3>

        <div className="space-y-3">
            {currentQ?.options.map((opt, idx) => {
                let btnVariant: 'secondary' | 'success' | 'danger' = 'secondary';
                if (showFeedback) {
                    if (idx === currentQ.correctIndex) btnVariant = 'success';
                    else if (idx === selectedOption) btnVariant = 'danger';
                }

                return (
                    <Button 
                        key={idx}
                        variant={btnVariant}
                        className={`w-full text-left justify-start h-auto py-4 text-xl ${showFeedback && idx !== currentQ.correctIndex && idx !== selectedOption ? 'opacity-50' : ''}`}
                        onClick={() => handleAnswer(idx)}
                        disabled={showFeedback}
                    >
                        <span className="inline-block w-8 font-bold opacity-50">{idx + 1}.</span> {opt}
                    </Button>
                );
            })}
        </div>

        {showFeedback && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-pop">
                <p className="font-bold text-blue-800 mb-2">
                    {selectedOption === currentQ.correctIndex ? '🎉 答對了！好棒！' : '❌ 哎呀，再想一下！'}
                </p>
                <p className="text-blue-600">{currentQ.explanation}</p>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleNextQuestion} size="md">下一題 ➜</Button>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
};

export default BattleScreen;