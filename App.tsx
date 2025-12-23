
import React, { useState, useEffect } from 'react';
import { Home, Settings, Trophy, Sparkles, Baby, Star, Circle, Square, Triangle } from 'lucide-react';
import { BUDDIES } from './constants.tsx';
import CountingGame from './components/Games/CountingGame.tsx';
import ShapesGame from './components/Games/ShapesGame.tsx';
import SizesGame from './components/Games/SizesGame.tsx';
import PatternsGame from './components/Games/PatternsGame.tsx';
import BodyPartsGame from './components/Games/BodyPartsGame.tsx';
import BuilderGame from './components/Games/BuilderGame.tsx';
import ColorsGame from './components/Games/ColorsGame.tsx';
import ParentalControl from './components/ParentalControl.tsx';
import { speakText, playSoundEffect, initAudio } from './services/geminiService.ts';
import { BuddyLevels } from './types.ts';

const MonkeyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className}>
    {/* Orejas */}
    <circle cx="40" cy="100" r="28" fill="#8B4513" />
    <circle cx="40" cy="100" r="18" fill="#DEB887" />
    <circle cx="160" cy="100" r="28" fill="#8B4513" />
    <circle cx="160" cy="100" r="18" fill="#DEB887" />
    {/* Cabeza Principal */}
    <circle cx="100" cy="105" r="75" fill="#8B4513" />
    {/* Área de la cara (Canela) */}
    <path 
      d="M50 110 Q 50 55 100 55 Q 150 55 150 110 L 150 135 Q 100 165 50 135 Z" 
      fill="#DEB887" 
    />
    {/* Ojos */}
    <circle cx="75" cy="98" r="12" fill="white" />
    <circle cx="75" cy="98" r="6" fill="black" />
    <circle cx="125" cy="98" r="12" fill="white" />
    <circle cx="125" cy="98" r="6" fill="black" />
    {/* Brillo en los ojos */}
    <circle cx="77" cy="95" r="3" fill="white" />
    <circle cx="127" cy="95" r="3" fill="white" />
    {/* Nariz */}
    <circle cx="100" cy="122" r="7" fill="#5D2E0A" />
    {/* Sonrisa */}
    <path 
      d="M75 140 Q 100 158 125 140" 
      stroke="#5D2E0A" 
      strokeWidth="5" 
      fill="none" 
      strokeLinecap="round" 
    />
    {/* Mechón de pelo */}
    <path d="M90 35 Q 100 15 110 35" stroke="#8B4513" strokeWidth="8" fill="none" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'selection' | 'game' | 'rewards'>('welcome');
  const [activeBuddy, setActiveBuddy] = useState<keyof typeof BUDDIES | null>(null);
  const [showParental, setShowParental] = useState(false);
  const [stickers, setStickers] = useState(0);
  const [buddyLevels, setBuddyLevels] = useState<any>({
    toby: 1, lila: 1, payasin: 1, gogo: 1, pipo: 1, maya: 1, bruno: 1
  });

  const handleStart = () => {
    initAudio(); 
    playSoundEffect('pop');
    speakText("¡Hola! Soy Lucas. ¿Con quién quieres jugar hoy?");
    setView('selection');
  };

  const startBuddyAventure = (buddyId: keyof typeof BUDDIES) => {
    initAudio(); 
    playSoundEffect('correct');
    setActiveBuddy(buddyId);
    speakText(`¡Vamos! ${BUDDIES[buddyId].name} te enseñará.`);
    setView('game');
  };

  const handleLevelUp = () => {
    if (activeBuddy) {
      setBuddyLevels(prev => ({
        ...prev,
        [activeBuddy]: (prev[activeBuddy] || 1) + 1
      }));
      setStickers(prev => prev + 1);
      if (buddyLevels[activeBuddy] >= 10) {
        setView('rewards');
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-sky-100 select-none flex flex-col no-scrollbar">
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0 overflow-hidden">
        <Circle className="absolute top-[10%] left-[5%] text-blue-400 w-24 h-24 animate-float" />
        <Square className="absolute bottom-[15%] right-[10%] text-green-400 w-32 h-32 animate-float stagger-2" />
        <Star className="absolute top-[40%] right-[15%] text-yellow-400 w-16 h-16 animate-pulse-gentle" />
      </div>

      <header className="relative z-30 p-4 md:p-6 flex justify-between items-center w-full max-w-7xl mx-auto shrink-0">
        <button onClick={() => { initAudio(); playSoundEffect('pop'); setView('selection'); }} className="bg-white/90 p-3 rounded-2xl shadow-lg border-b-4 border-gray-200 active:translate-y-1">
          <Home className="text-blue-500 w-6 h-6 md:w-8 md:h-8" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border-b-4 border-yellow-200">
            <Trophy className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" />
            <span className="font-kids text-lg md:text-xl text-yellow-700">{stickers}</span>
          </div>
          <button onClick={() => { initAudio(); setShowParental(true); }} className="bg-white/90 p-3 rounded-2xl shadow-lg border-b-4 border-gray-200">
            <Settings className="text-gray-500 w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>
      </header>

      <main className="flex-grow w-full flex flex-col items-center justify-start p-2 md:p-4 relative z-20 overflow-y-auto no-scrollbar">
        {view === 'welcome' && (
          <div onClick={handleStart} className="text-center cursor-pointer w-full py-12 flex flex-col items-center justify-center min-h-full">
            <div className="mb-8 relative inline-block animate-float">
              <div className="bg-white p-8 md:p-12 rounded-[4rem] inline-block shadow-2xl relative border-8 border-blue-100">
                <MonkeyIcon className="w-40 h-40 md:w-56 md:h-56" />
                <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl text-blue-600 font-kids mb-6 drop-shadow-lg uppercase tracking-tighter">LUCAS</h1>
            <div className="inline-block bg-white/80 px-8 py-3 rounded-full shadow-md animate-pulse-gentle">
              <p className="text-xl md:text-2xl text-blue-500 font-kids uppercase">Toca para jugar</p>
            </div>
          </div>
        )}

        {view === 'selection' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4 py-8">
            {(Object.keys(BUDDIES) as Array<keyof typeof BUDDIES>).map((id) => (
              <button key={id} onClick={() => startBuddyAventure(id)} className={`${BUDDIES[id].color} p-8 rounded-[3rem] shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex flex-col items-center border-b-8 border-black/5 animate-pop-in`}>
                <div className="mb-4 bg-white p-6 rounded-full shadow-inner">{BUDDIES[id].icon}</div>
                <h3 className="text-2xl font-kids text-gray-800 mb-2">{BUDDIES[id].name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-tight">{BUDDIES[id].description}</p>
                <div className="bg-white/50 px-4 py-1 rounded-full text-xs font-bold text-gray-500">Nivel {buddyLevels[id] || 1}</div>
              </button>
            ))}
          </div>
        )}

        {view === 'game' && activeBuddy && (
          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] w-full max-w-5xl flex flex-col shadow-2xl overflow-hidden border-4 md:border-8 border-white animate-pop-in h-full max-h-[85dvh]">
            <div className="flex-grow relative overflow-y-auto no-scrollbar">
              {activeBuddy === 'toby' && <CountingGame level={buddyLevels.toby} onComplete={handleLevelUp} />}
              {activeBuddy === 'lila' && <ShapesGame level={buddyLevels.lila} onComplete={handleLevelUp} />}
              {activeBuddy === 'payasin' && <ColorsGame level={buddyLevels.payasin} onComplete={handleLevelUp} />}
              {activeBuddy === 'maya' && <BodyPartsGame level={buddyLevels.maya} onComplete={handleLevelUp} />}
              {activeBuddy === 'gogo' && <SizesGame level={buddyLevels.gogo} onComplete={handleLevelUp} />}
              {activeBuddy === 'pipo' && <PatternsGame level={buddyLevels.pipo} onComplete={handleLevelUp} />}
              {activeBuddy === 'bruno' && <BuilderGame level={buddyLevels.bruno} onComplete={handleLevelUp} />}
            </div>
          </div>
        )}
      </main>

      {showParental && <ParentalControl onClose={() => setShowParental(false)} />}
    </div>
  );
};

export default App;
