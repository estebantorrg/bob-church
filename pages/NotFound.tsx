import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center text-center px-6 bg-[#050510] text-white overflow-hidden relative page-transition-enter"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at center, rgba(108,122,224,0.18) 0%, rgba(60,70,150,0.05) 40%, transparent 75%), linear-gradient(160deg, #0a0a1e 0%, #050510 100%)',
      }}
    >
      <div className="relative mb-8 blob-float">
        <div className="absolute -inset-4 bg-[#6C7AE0] rounded-full blur-2xl opacity-40" />
        <img
          src="/bob/BOB_dumbfounded.gif"
          alt="B.O.B. dumbfounded"
          className="relative w-40 h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-white/80 shadow-2xl"
        />
      </div>

      <h1 className="display-font text-6xl md:text-8xl text-[#9AA9FF] tracking-widest drop-shadow-lg">404</h1>
      <p className="mt-4 text-lg md:text-2xl text-white/80 italic max-w-md">
        B.O.B. forgot where this page went. He has no brain, so don't blame him.
      </p>
      <p className="mt-2 text-xs md:text-sm uppercase tracking-[0.35em] text-white/40">
        this path leads nowhere
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-block text-[11px] uppercase tracking-[0.3em] text-[#9AA9FF]/80 border border-[#6C7AE0]/40 px-6 py-3 rounded-full hover:bg-[#6C7AE0]/10 hover:text-[#9AA9FF] transition-all"
        >
          ← Choose Your Devotion
        </Link>
        <Link
          to="/church"
          className="inline-block text-[11px] uppercase tracking-[0.3em] text-[#9AA9FF]/80 border border-[#6C7AE0]/40 px-6 py-3 rounded-full hover:bg-[#6C7AE0]/10 hover:text-[#9AA9FF] transition-all"
        >
          Enter the Church →
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
