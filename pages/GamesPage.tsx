import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TheBobStare } from '../components/TheBobStare';
import { GooDefense } from '../components/GooDefense';
import { WobblesPerMinute } from '../components/WobblesPerMinute';
import { SnackOrThought } from '../components/SnackOrThought';
import { FlappyBlob } from '../components/FlappyBlob';

type GameId = 'menu' | 'stare' | 'defense' | 'wobbles' | 'snack' | 'flappy';

const GAME_MAP: Record<string, GameId> = {
  'the-stare': 'stare',
  'goo-defense': 'defense',
  'wobbles': 'wobbles',
  'snack-or-thought': 'snack',
  'flappy-blob': 'flappy',
};

const GamesPage: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug?: string }>();
  const initialGame: GameId = (gameSlug && GAME_MAP[gameSlug]) || 'menu';
  const [activeGame, setActiveGame] = useState<GameId>(initialGame);

  // Scroll to top when switching games
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeGame]);

  const renderGame = () => {
    switch (activeGame) {
      case 'stare':
        return (
          <div className="w-full animate-fade-in-up relative z-10" key="stare">
            <TheBobStare />
          </div>
        );
      case 'defense':
        return (
          <div className="w-full animate-fade-in-up relative z-10" key="defense">
            <GooDefense />
          </div>
        );
      case 'wobbles':
        return (
          <div className="w-full animate-fade-in-up relative z-10" key="wobbles">
            <WobblesPerMinute />
          </div>
        );
      case 'snack':
        return (
          <div className="w-full animate-fade-in-up relative z-10" key="snack">
            <SnackOrThought />
          </div>
        );
      case 'flappy':
        return (
          <div className="w-full animate-fade-in-up relative z-10" key="flappy">
            <FlappyBlob />
          </div>
        );
      default:
        return (
          <div className="animate-fade-in-up relative z-10" key="menu">
            <p className="text-white/60 text-center mb-12 max-w-xl mx-auto text-lg italic mt-4">
              "Prove how brainless you can truly be. The trials are waiting. B.O.B. forgot he set them up."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto h-full">

              {/* Goo Defense Card */}
              <div
                onClick={() => setActiveGame('defense')}
                className="relative overflow-hidden cursor-pointer group bg-black/40 border border-[#E74C3C]/30 hover:border-[#E74C3C] rounded-xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(231,76,60,0.3)] flex flex-col items-center justify-center min-h-[350px] md:min-h-[450px] md:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#E74C3C]/20 via-[#E74C3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[url('/bob/bob_main.webp')] bg-contain bg-center bg-no-repeat mix-blend-lighten opacity-10 group-hover:opacity-40 transition-all duration-700 group-hover:scale-[1.15]" />

                <div className="relative z-10 flex flex-col items-center text-center mt-auto w-full bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 h-full justify-end">
                  <h3 className="text-3xl text-[#E74C3C] display-font mb-2 drop-shadow-md tracking-wider group-hover:scale-105 transition-transform">Carrot Defense</h3>
                  <div className="overflow-hidden">
                    <p className="text-white/70 text-sm max-w-sm mb-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 line-clamp-3">
                      The carrots are falling. B.O.B. refuses to eat them. Zap the vegetables before they reach the blob.
                    </p>
                  </div>
                  <span className="text-[#E74C3C] font-bold tracking-[0.3em] uppercase text-xs border border-[#E74C3C] px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Play</span>
                </div>
              </div>

              {/* Stare Card */}
              <div
                onClick={() => setActiveGame('stare')}
                className="relative overflow-hidden cursor-pointer group bg-black/40 border border-[#6C7AE0]/30 hover:border-[#6C7AE0] rounded-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(108,122,224,0.3)] flex flex-col items-center justify-center min-h-[350px] md:min-h-[450px] md:col-span-2"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#6C7AE0]/20 via-[#6C7AE0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[url('/bob/BOB_dumbfounded.gif')] bg-cover bg-top mix-blend-screen opacity-10 group-hover:opacity-40 transition-all duration-700 blur-[2px] group-hover:blur-none group-hover:scale-105" />

                <div className="relative z-10 flex flex-col items-center text-center mt-auto w-full bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 h-full justify-end">
                  <h3 className="text-3xl md:text-5xl text-[#9AA9FF] display-font mb-3 drop-shadow-lg tracking-wider group-hover:scale-105 transition-transform">The Dumbfounded Stare</h3>
                  <div className="overflow-hidden">
                    <p className="text-white/70 text-sm md:text-base max-w-md mb-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      Match B.O.B.'s legendary emptiness. Can you do absolutely nothing for 30 whole seconds?
                    </p>
                  </div>
                  <span className="text-[#9AA9FF] font-bold tracking-[0.3em] uppercase text-xs border border-[#6C7AE0] px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Initiate</span>
                </div>
              </div>

              {/* Wobbles Card */}
              <div
                onClick={() => setActiveGame('wobbles')}
                className="relative overflow-hidden cursor-pointer group bg-black/40 border border-[#C7D0FF]/30 hover:border-[#C7D0FF] rounded-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(199,208,255,0.2)] flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] md:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C7D0FF]/5 via-transparent to-[#C7D0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center text-center w-full p-8 justify-center h-full">
                  <h3 className="text-3xl text-[#C7D0FF] display-font mb-4 drop-shadow-md tracking-wider group-hover:scale-105 transition-transform">Wobbles Per Minute</h3>
                  <div className="overflow-hidden">
                    <p className="text-white/70 text-sm max-w-sm mb-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 line-clamp-3">
                      Transcribe the Wobbled Scriptures. How fast can your blankness flow from goo to key?
                    </p>
                  </div>
                  <span className="text-[#C7D0FF] font-bold tracking-[0.3em] uppercase text-xs border border-[#C7D0FF] px-8 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Transcribe</span>
                </div>
              </div>

              {/* Snack or Thought */}
              <div
                onClick={() => setActiveGame('snack')}
                className="relative overflow-hidden cursor-pointer group bg-black/40 border border-[#9B59B6]/40 hover:border-[#9B59B6] rounded-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(155,89,182,0.4)] flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] md:col-span-2"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#9B59B6]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[url('/bob/BOB_smiling.png')] bg-contain bg-center bg-no-repeat mix-blend-lighten opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105" />

                <div className="relative z-10 flex flex-col items-center text-center w-full p-8 justify-center h-full bg-gradient-to-t from-black via-black/60 to-transparent">
                  <h3 className="text-3xl md:text-5xl text-[#9B59B6] display-font mb-4 drop-shadow-md tracking-wider group-hover:scale-105 transition-transform">Snack or Thought</h3>
                  <div className="overflow-hidden">
                    <p className="text-white/70 text-sm md:text-base max-w-lg mb-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 line-clamp-2">
                       Prove your head is empty enough to separate delicious Snacks from scary Thoughts instantly.
                    </p>
                  </div>
                  <span className="text-white border-[#9B59B6] font-bold tracking-[0.3em] uppercase text-xs border px-8 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Sort Reality</span>
                </div>
              </div>

              {/* Flight of the Blob (Flappy) */}
              <div
                onClick={() => setActiveGame('flappy')}
                className="relative overflow-hidden cursor-pointer group bg-black/40 border border-[#6C7AE0]/40 hover:border-[#9AA9FF] rounded-xl transition-all duration-500 flex flex-col items-center justify-center min-h-[350px] md:col-span-3 hover:shadow-[0_0_50px_rgba(108,122,224,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#6C7AE0]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a20] to-[#141633] opacity-80 group-hover:opacity-90 transition-all duration-700" />

                <div className="relative z-10 flex flex-col items-center text-center w-full p-8 mt-auto h-full justify-center">
                  <h3 className="text-4xl md:text-6xl text-white display-font mb-4 drop-shadow-[0_0_15px_rgba(154,169,255,0.8)] tracking-wider group-hover:scale-105 transition-transform">Flight of the Blob</h3>
                  <div className="overflow-hidden">
                    <p className="text-[#9AA9FF]/80 text-sm md:text-lg max-w-2xl mb-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      Float through the pillars of thought. Wobble upward against gravity and do not splat.
                    </p>
                  </div>
                  <span className="text-black bg-[#9AA9FF] border-black font-bold tracking-[0.3em] uppercase text-xs px-10 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 shadow-xl">Take Float</span>
                </div>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] relative page-transition-enter overflow-x-hidden">

      {/* Ambient Background for Menu */}
      {activeGame === 'menu' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-10%] w-[50%] h-[50%] bg-[#6C7AE0]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute right-[-10%] bottom-[-10%] w-[50%] h-[50%] bg-[#9B59B6]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#08081a]/80 backdrop-blur-md border-b border-[#6C7AE0]/15">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/60 hover:text-[#9AA9FF] transition-colors text-sm uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Church
          </Link>
          <h1 className="display-font text-lg text-[#9AA9FF] tracking-wider">The Goo Trials</h1>
          {activeGame !== 'menu' ? (
            <button
              onClick={() => setActiveGame('menu')}
              className="text-white/60 hover:text-[#9AA9FF] transition-colors text-sm uppercase tracking-widest"
            >
              All Trials
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-[72px] px-4 pb-16 max-w-6xl mx-auto min-h-screen flex flex-col">
        {activeGame === 'menu' && (
          <div className="relative z-10 w-full text-center mt-12 mb-8">
            <h2 className="display-font text-5xl md:text-7xl text-[#9AA9FF] drop-shadow-[0_0_20px_rgba(154,169,255,0.3)]">The Goo Trials</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#6C7AE0] to-transparent mx-auto mt-6 opacity-50" />
          </div>
        )}
        <div className="flex-grow flex flex-col items-center justify-center">
          {renderGame()}
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
