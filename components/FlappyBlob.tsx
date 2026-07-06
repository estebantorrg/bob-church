import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface Pipe {
  id: number;
  x: number; // percentage
  topHeight: number; // percentage
  bottomY: number; // percentage starts here
  passed: boolean;
}

export const FlappyBlob: React.FC = () => {
  // UI Render states
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(50);
  const [playerRot, setPlayerRot] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);

  // Physics Engine Refs (Mutable for RequestAnimationFrame)
  const engine = useRef({
    isPlaying: false,
    gameOver: false,
    y: 50,
    v: 0,
    score: 0,
    pipes: [] as Pipe[],
    pipeIdCounter: 0,
    lastTime: undefined as number | undefined,
    lastSpawnTime: 0
  });

  const requestRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants
  const GRAVITY = 0.08;
  const JUMP_STRENGTH = -1.6;
  const PIPE_SPEED = 0.3; // Speed per frame
  const PIPE_SPAWN_RATE = 1500; // ms between pipes
  const GAP_SIZE = 35; // percentage gap

  // Hitbox parameters
  const PLAYER_X = 20; // Fixed horizontal position of player (%)
  const PLAYER_WIDTH = 8;
  const PLAYER_HEIGHT = 8;
  const PIPE_WIDTH = 12;

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard?game=flappy');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch(e) {
       console.error("Failed to load leaderboard");
    }
  };

  useEffect(() => {
    if (!isPlaying || gameOver) {
      fetchLeaderboard();
    }
  }, [isPlaying, gameOver]);

  // Jump logic updates the synchronous engine state
  const handleJump = useCallback(() => {
    if (!engine.current.isPlaying || engine.current.gameOver) return;
    engine.current.v = JUMP_STRENGTH;
  }, []);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const startGame = async () => {
    setIsPlaying(true);
    setGameOver(false);
    setScoreSubmitted(false);

    // Reset Engine State
    engine.current = {
      isPlaying: true,
      gameOver: false,
      y: 50,
      v: 0,
      score: 0,
      pipes: [],
      pipeIdCounter: 0,
      lastTime: undefined,
      lastSpawnTime: performance.now()
    };

    // Sync UI
    setPlayerY(50);
    setScore(0);
    setPipes([]);

    try {
      const res = await fetch('/api/game-session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGameSessionId(data.sessionId);
      }
    } catch (e) {
      console.warn('Failed to get game session');
    }

    // Start loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = useCallback((time: number) => {
    const state = engine.current;
    if (!state.isPlaying || state.gameOver) return;

    if (state.lastTime !== undefined) {
      const deltaTime = time - state.lastTime;
      const timeScale = Math.min(deltaTime / 16, 2);

      // 1. Update Physics
      state.v += GRAVITY * timeScale;
      state.y += state.v * timeScale;

      // Floor / Ceiling Collision
      if (state.y >= 95 || state.y <= -5) {
        state.gameOver = true;
        state.isPlaying = false;
        setIsPlaying(false);
        setGameOver(true);
        return; // physics stop
      }

      // 2. Update Pipes
      state.pipes = state.pipes.map(p => ({
        ...p,
        x: p.x - (PIPE_SPEED * timeScale)
      })).filter(p => p.x > -20); // remove offscreen

      // 3. Spawner
      const dynamicSpawnRate = Math.max(800, PIPE_SPAWN_RATE * Math.pow(0.98, state.score));
      if (time - state.lastSpawnTime > dynamicSpawnRate) {
        const minHeight = 15;
        const maxTop = 100 - GAP_SIZE - minHeight;
        const topH = Math.max(minHeight, Math.random() * maxTop);
        const botY = topH + GAP_SIZE;

        state.pipeIdCounter += 1;
        state.pipes.push({
          id: state.pipeIdCounter,
          x: 100,
          topHeight: topH,
          bottomY: botY,
          passed: false
        });
        state.lastSpawnTime = time;
      }

      // 4. Collision and Scoring Layer
      for (let p of state.pipes) {
        // Scoring
        if (!p.passed && p.x + PIPE_WIDTH < PLAYER_X) {
          p.passed = true;
          state.score += 1;
        }

        // AABB Collision
        const overlapX = (PLAYER_X < p.x + PIPE_WIDTH) && (PLAYER_X + PLAYER_WIDTH > p.x);
        if (overlapX) {
          // Add a small forgivness margin (1%) to hitboxes
          const hitTop = state.y < p.topHeight - 1;
          const hitBottom = state.y + PLAYER_HEIGHT > p.bottomY + 1;
          if (hitTop || hitBottom) {
            state.gameOver = true;
            state.isPlaying = false;
            setIsPlaying(false);
            setGameOver(true);
            return;
          }
        }
      }

      // 5. Sync state to UI smoothly
      setPlayerY(state.y);
      setPlayerRot(Math.max(-20, Math.min(45, state.v * 15)));
      setPipes([...state.pipes]);
      setScore(state.score);
    }

    state.lastTime = time;
    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Wipe last time ref on unmounting
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmittingScore || !gameSessionId) return;

    setIsSubmittingScore(true);
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score, sessionId: gameSessionId, game: 'flappy' })
      });
      if (res.ok) {
        setScoreSubmitted(true);
        fetchLeaderboard();
      } else {
        const err = await res.json();
        alert(`Failed to submit: ${err.error}`);
      }
    } catch (e) {
       console.error(e);
       alert("Network error.");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleJump} // handles mouse down and touch start seamlessly
      className={`w-full max-w-lg mx-auto border border-[#6C7AE0]/30 rounded-xl bg-black overflow-hidden relative text-white h-[600px] flex flex-col ${isPlaying ? 'cursor-pointer touch-none select-none' : ''}`}
      style={{ touchAction: 'none' }}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-[#0a0a20] z-0`} />

      {!isPlaying && !gameOver && (
        <div className="absolute inset-x-0 inset-y-0 z-30 flex flex-col items-center justify-center bg-black/60 p-6 text-center backdrop-blur-sm shadow-xl">
          <h2 className="display-font text-5xl mb-4 text-[#9AA9FF] tracking-widest text-shadow drop-shadow-[0_0_15px_rgba(154,169,255,0.6)]">Flight of the Blob</h2>
          <p className="text-sm md:text-base mb-8 opacity-80 max-w-sm mx-auto">
            Float through the pillars of thought. <br/><br/>
            Tap or press <span className="text-[#9AA9FF] font-bold">SPACEBAR</span> to wobble upward. Do not touch the pillars.
          </p>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-transparent border-2 border-[#6C7AE0] text-[#9AA9FF] font-bold text-xl tracking-[0.2em] uppercase rounded hover:bg-[#6C7AE0] hover:text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(108,122,224,0.2)]"
          >
            Take Float
          </button>

          <button onClick={(e) => { e.stopPropagation(); setShowLeaderboard(!showLeaderboard); }} className="mt-8 text-white/50 hover:text-white uppercase tracking-widest text-xs border-b border-white/20 pb-1 z-40 relative">
            {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'}
          </button>
        </div>
      )}

      {showLeaderboard && !isPlaying && !gameOver && (
        <div className="absolute inset-0 z-40 pt-16 p-6 bg-black/95 w-full animate-fade-in text-left overflow-y-auto">
          <button
            onClick={(e) => { e.stopPropagation(); setShowLeaderboard(false); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all text-xl font-bold z-50"
          >
            ✕
          </button>
          <h3 className="text-[#9AA9FF] display-font text-3xl mb-6 text-center mt-4">Top Floaters</h3>
          {leaderboard.length === 0 ? <p className="text-white/50 text-center">No scores yet.</p> : (
            <div className="space-y-3 max-w-xs mx-auto">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded border border-[#6C7AE0]/20">
                  <div className="flex gap-4">
                    <span className="text-[#9AA9FF] opacity-70 w-4 font-bold">{idx + 1}.</span>
                    <span className="font-bold">{entry.name}</span>
                  </div>
                  <span className="font-mono text-[#9AA9FF] font-bold">{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Game Engine Rendering */}
      {(isPlaying || gameOver) && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">

          {/* Big Score HUD */}
          <div className="absolute top-10 w-full text-center z-20">
            <span className="text-6xl text-white font-black drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] opacity-90 stroke-black" style={{ WebkitTextStroke: '2px black' }}>
              {score}
            </span>
          </div>

          {/* B.O.B. (Player) */}
          <div
            className="absolute z-20 transition-transform"
            style={{
              left: `${PLAYER_X}%`,
              top: `${playerY}%`,
              width: `${PLAYER_WIDTH}%`,
              height: `${PLAYER_HEIGHT}%`,
              transform: `rotate(${playerRot}deg)`,
              transition: 'transform 0.1s linear' // smooth rotation only
            }}
          >
            <div className="w-full h-full bg-[url('/bob/bob_main.webp')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_10px_rgba(108,122,224,0.8)]" />
          </div>

          {/* Pipes Rendering */}
          {pipes.map(pipe => (
            <React.Fragment key={pipe.id}>
              {/* Top Pipe */}
              <div
                className="absolute bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 border-2 border-b-4 border-[#6C7AE0] rounded-b-sm z-15 shadow-xl"
                style={{
                  left: `${pipe.x}%`,
                  top: 0,
                  width: `${PIPE_WIDTH}%`,
                  height: `${pipe.topHeight}%`
                }}
              >
                {/* Visual texture */}
                <div className="w-full h-full opacity-20 bg-gradient-to-b from-[#6C7AE0]/40 to-transparent" />
              </div>

              {/* Bottom Pipe */}
              <div
                className="absolute bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 border-2 border-t-4 border-[#6C7AE0] rounded-t-sm z-15 shadow-xl"
                style={{
                  left: `${pipe.x}%`,
                  top: `${pipe.bottomY}%`,
                  width: `${PIPE_WIDTH}%`,
                  bottom: 0
                }}
              >
                 {/* Visual texture */}
                 <div className="w-full h-full opacity-20 bg-gradient-to-t from-[#6C7AE0]/40 to-transparent" />
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center animate-fade-in">
          <h2 className="display-font text-5xl text-[#9AA9FF] mb-2 drop-shadow-[0_0_15px_rgba(154,169,255,0.5)]">Splatted</h2>
          <p className="text-base mb-6 text-white/80">The pillars of thought have caught you. B.O.B. will reassemble shortly.</p>

          <div className="bg-white/10 px-12 py-6 rounded-2xl border border-white/10 shadow-2xl mb-8">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Pillars Passed</p>
            <div className="text-6xl font-black text-[#9AA9FF]">
              {score}
            </div>
          </div>

          {!scoreSubmitted ? (
            <form onSubmit={submitScore} className="flex flex-col gap-4 w-full max-w-xs mx-auto mb-8">
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter Name"
                maxLength={20}
                required
                className="bg-black/80 border border-[#6C7AE0]/50 text-white px-4 py-3 rounded text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#9AA9FF]"
              />
              <button
                type="submit"
                disabled={isSubmittingScore || !playerName.trim() || !gameSessionId} // disable if no token
                className="w-full bg-[#6C7AE0] text-white font-black uppercase tracking-widest py-4 rounded hover:bg-[#9AA9FF] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingScore ? 'Floating...' : (gameSessionId ? 'Submit Float Log' : 'Replay to Submit')}
              </button>
              {!gameSessionId && <p className="text-red-400 text-xs font-bold uppercase">Session Invalid. Please refresh.</p>}
            </form>
          ) : (
            <p className="text-[#9AA9FF] mb-8 font-black tracking-widest uppercase bg-white/10 py-3 px-6 rounded-lg border border-[#6C7AE0]/50">Float Recorded</p>
          )}

          <div className="flex gap-4">
             <button
                onClick={() => { setGameOver(false); setShowLeaderboard(true); fetchLeaderboard(); }}
                className="px-6 py-3 border border-white/20 text-white hover:bg-white/10 transition-colors uppercase tracking-widest text-xs font-bold rounded"
              >
                Leaderboard
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-[#6C7AE0]/20 border border-[#6C7AE0] text-[#9AA9FF] hover:bg-[#6C7AE0] hover:text-white transition-all uppercase tracking-widest text-xs rounded font-bold"
              >
                Float Again
              </button>
          </div>
        </div>
      )}
    </div>
  );
};
