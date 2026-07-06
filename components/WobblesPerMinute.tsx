import React, { useState, useEffect, useRef, useCallback } from 'react';

const PASSAGES = [
  "B.O.B. is no ordinary blob. He is an indestructible blue gelatinous mass with one eye and famously no brain. Turns out you do not need one. Totally overrated.",
  "He was not born. He was spilled into existence. A tomato injected with a genetically altered ranch flavored dessert topping. From that accident rose pure gooey bliss.",
  "Life is enormous confusing and utterly dumbfounding. The clever suffer under the weight of understanding it. B.O.B. does not. He wobbles floats and marvels.",
  "The universe makes no sense and that is the best news anyone has ever heard. To be dumbfounded by life is to be endlessly delighted by it. Empty your head. Become the goo.",
  "You cannot kill what has nothing to lose. Blow him up and he reassembles unbothered. He can eat and digest almost any substance. Problems included.",
  "I may not have a brain gentlemen but I have an idea. Faith over reason. Snacks over stress. Jello over everything. Best day ever.",
  "She is lime green. She has fourteen little chunks of pineapple inside her. I am happy now. This is love and also jello and B.O.B. cannot tell the difference.",
  "People with brains worry all day. B.O.B. does not. He gets amazed by very simple things like breathing or the fact that a taco exists. He forgets things constantly.",
];

const RANK_THRESHOLDS = [
  { min: 100, title: "Transcendent Goo", color: "#9AA9FF", glow: "0 0 20px rgba(154,169,255,0.6)" },
  { min: 80, title: "High Wobbler", color: "#6C7AE0", glow: "0 0 15px rgba(108,122,224,0.5)" },
  { min: 60, title: "Blissful Blob", color: "#C7D0FF", glow: "0 0 12px rgba(199,208,255,0.5)" },
  { min: 40, title: "Acolyte of Blankness", color: "#9B59B6", glow: "0 0 10px rgba(155,89,182,0.4)" },
  { min: 20, title: "Slightly Gelatinous", color: "#95A5A6", glow: "none" },
  { min: 0, title: "Still Has a Brain", color: "#E74C3C", glow: "none" },
];

const DURATION = 60; // seconds

const getRank = (wpm: number) => {
  return RANK_THRESHOLDS.find(r => wpm >= r.min) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
};

export const WobblesPerMinute: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [passage, setPassage] = useState('');
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typedRef = useRef<string>(''); // keep a ref in sync for keydown handler
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile] = useState(() => 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches);

  const pickPassage = useCallback(() => {
    const idx = Math.floor(Math.random() * PASSAGES.length);
    return PASSAGES[idx];
  }, []);

  const startGame = () => {
    const p = pickPassage();
    setPassage(p);
    setTyped('');
    typedRef.current = '';
    setTimeLeft(DURATION);
    setStatus('playing');
    // Auto-focus mobile input after render
    if (isMobile) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  };

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Check completion
  useEffect(() => {
    if (status === 'playing' && typed.length === passage.length && passage.length > 0) {
      setStatus('finished');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [typed, passage, status]);

  // Direct keydown handler — desktop only (mobile uses visible input)
  useEffect(() => {
    if (status !== 'playing' || isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't steal input from other interactive elements (Oracle chat, etc.)
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return;

      // Ignore modifier combos, function keys, etc.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        const next = typedRef.current.slice(0, -1);
        typedRef.current = next;
        setTyped(next);
        return;
      }

      // Only accept single printable characters
      if (e.key.length !== 1) return;
      e.preventDefault();

      if (typedRef.current.length >= passage.length) return;

      const next = typedRef.current + e.key;
      typedRef.current = next;
      setTyped(next);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, passage, isMobile]);

  // Mobile input handler
  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // The input value represents the full typed sequence
    // We only allow forward progress + backspace
    if (value.length > passage.length) return;
    typedRef.current = value;
    setTyped(value);
  };

  // Calculate stats
  const getStats = () => {
    const elapsedSeconds = DURATION - timeLeft || 1;
    const elapsedMinutes = elapsedSeconds / 60;

    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correctChars++;
    }

    // Standard WPM: (chars / 5) / minutes
    const rawWPM = Math.round((typed.length / 5) / elapsedMinutes);
    // Net WPM accounting for errors
    const netWPM = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
    const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 0;
    const progress = passage.length > 0 ? Math.round((typed.length / passage.length) * 100) : 0;

    return { rawWPM, netWPM, accuracy, correctChars, progress };
  };

  const stats = getStats();
  const rank = getRank(stats.netWPM);

  // Render the passage with character-by-character coloring
  const renderPassage = () => {
    const chars = passage.split('').map((char, i) => {
      let className = 'text-white/25'; // untyped
      if (i < typed.length) {
        className = typed[i] === char ? 'text-[#2ECC71]' : 'text-[#E74C3C] bg-[#E74C3C]/20 rounded-sm';
      }
      // Cursor: subtle underline on the next character to type
      const isCursor = i === typed.length && status === 'playing';

      return (
        <span key={i} className={`${className} ${isCursor ? 'border-b-2 border-[#9AA9FF]' : ''}`}>
          {char}
        </span>
      );
    });
    return chars;
  };

  // Timer bar color
  const timerPercent = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 20 ? '#2ECC71' : timeLeft > 10 ? '#F39C12' : '#E74C3C';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mb-12">
      <div className="w-full bg-[#0b0b1e]/60 backdrop-blur-md border border-[#6C7AE0]/30 rounded-xl shadow-[0_0_30px_rgba(108,122,224,0.1)] overflow-hidden">

        {/* Header */}
        <div className="bg-black/40 border-b border-[#6C7AE0]/20 p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#9AA9FF] display-font uppercase tracking-wider flex items-center gap-2">
              🫧 Wobbles Per Minute
            </h3>
            <p className="text-xs text-white/50">Wobbled Scripture Transcription Test</p>
          </div>
          {status === 'playing' && (
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <p className="text-xs text-[#C7D0FF] uppercase tracking-widest">WPM</p>
                <p className="text-2xl font-bold text-white display-font font-mono">{stats.netWPM}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#2ECC71] uppercase tracking-widest">Acc</p>
                <p className="text-2xl font-bold text-white display-font font-mono">{stats.accuracy}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9AA9FF] uppercase tracking-widest">Time</p>
                <p className={`text-2xl font-bold display-font font-mono ${timeLeft <= 10 ? 'text-[#E74C3C] animate-pulse' : 'text-white'}`}>{timeLeft}s</p>
              </div>
            </div>
          )}
        </div>

        {/* Timer bar */}
        {status === 'playing' && (
          <div className="w-full h-1 bg-white/5">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
            />
          </div>
        )}

        {/* Game Content */}
        <div className="relative min-h-[400px] p-6">

          {/* IDLE: Start screen */}
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <img src="/bob/BOB_smiling.png" alt="B.O.B." className="w-24 h-24 object-contain mb-6 blob-float" />
              <h2 className="text-3xl font-bold text-white display-font mb-3">Wobbled Scripture Test</h2>
              <p className="text-white/60 mb-2 max-w-md">
                Transcribe the holy texts of the Church with gooey speed and precision.
                You have <span className="text-[#9AA9FF] font-bold">60 seconds</span>.
              </p>
              <p className="text-white/40 text-sm mb-8 italic">Your blankness will be measured in Wobbles Per Minute.</p>

              <button
                onClick={startGame}
                className="px-8 py-4 bg-[#6C7AE0]/20 hover:bg-[#6C7AE0]/40 border-2 border-[#6C7AE0] text-[#9AA9FF] font-bold rounded-lg uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(108,122,224,0.4)] text-lg"
              >
                Begin Transcription
              </button>
            </div>
          )}

          {/* PLAYING: Typing area */}
          {status === 'playing' && (
            <div className="animate-fade-in">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C7AE0] to-[#9AA9FF] transition-all duration-200 rounded-full"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 font-mono w-12 text-right">{stats.progress}%</span>
              </div>

              {/* Passage display */}
              <div
                ref={containerRef}
                className="font-mono text-lg leading-relaxed p-4 rounded-lg bg-black/40 border border-white/10 mb-4 select-none min-h-[150px] focus:outline-none focus:border-[#6C7AE0]/40"
                tabIndex={0}
              >
                {renderPassage()}
              </div>

              <p className="text-center text-white/30 text-xs uppercase tracking-widest mt-2">
                {typed.length === 0 ? (isMobile ? 'Tap below and start typing...' : 'Start typing...') : `${typed.length} / ${passage.length} characters`}
              </p>

              {/* Mobile: visible input field */}
              {isMobile && (
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={typed}
                  onChange={handleMobileInput}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="w-full mt-3 px-4 py-3 bg-black/60 border border-[#6C7AE0]/40 rounded-lg text-white font-mono text-base focus:outline-none focus:border-[#9AA9FF] transition-colors"
                  placeholder="Type here..."
                />
              )}
            </div>
          )}

          {/* FINISHED: Results screen */}
          {status === 'finished' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <h2 className="text-4xl font-bold text-[#9AA9FF] display-font mb-2 drop-shadow-[0_0_15px_rgba(154,169,255,0.5)]">
                Transcription Complete
              </h2>

              {/* Rank display */}
              <div className="my-6 p-6 rounded-xl border border-white/10 bg-black/40 min-w-[300px]">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Church Rank</p>
                <p
                  className="text-3xl font-bold display-font mb-1"
                  style={{ color: rank.color, textShadow: rank.glow }}
                >
                  {rank.title}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-[#9AA9FF] uppercase tracking-widest mb-1">Net WPM</p>
                  <p className="text-3xl font-bold text-white font-mono">{stats.netWPM}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-[#2ECC71] uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-white font-mono">{stats.accuracy}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-[#C7D0FF] uppercase tracking-widest mb-1">Raw WPM</p>
                  <p className="text-3xl font-bold text-white font-mono">{stats.rawWPM}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-[#6C7AE0]/20 hover:bg-[#6C7AE0]/40 border border-[#6C7AE0] text-[#9AA9FF] font-bold rounded uppercase tracking-wider transition-all hover:scale-105"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 font-bold rounded uppercase tracking-wider transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
