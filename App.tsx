import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BobPage from './pages/BobPage';
import GamesPage from './pages/GamesPage';

// Scroll-to-top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ─── Per-route SEO ───
// The app is a static SPA, so index.html ships one hardcoded <title>/canonical.
// Without this, Google would collapse every route into the "/" canonical and
// index none of the sub-pages distinctly. Googlebot renders JS, so updating the
// head per route (self-referential canonical + title + description) lets each
// route be indexed as its own page.
const SITE_ORIGIN = 'https://churchofbob.pages.dev';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'The Church of B.O.B. — Brainless. Blissful. Indestructible.',
    description: 'Benzoate Ostylezene Bicarbonate: an indestructible blue blob with no brain and no worries. The gospel of blankness and the dumbfoundedness of life. Ask the Blob anything.',
  },
  '/games': {
    title: 'Goo Trials — B.O.B. Minigames',
    description: 'Test how brainless you can truly be. Play the sacred minigames of the Church of B.O.B. and climb the global leaderboards.',
  },
};

const setMetaByName = (name: string, content: string) => {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
};

const setMetaByProperty = (property: string, content: string) => {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
};

const RouteMeta = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Self-referential canonical: exact path (trailing slash stripped, root kept as "/").
    const cleanPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    const canonicalUrl = SITE_ORIGIN + (cleanPath === '/' ? '/' : cleanPath);

    // Title/description: exact match, else /games family, else site default.
    const meta = ROUTE_META[cleanPath]
      || (cleanPath.startsWith('/games') ? ROUTE_META['/games'] : undefined)
      || ROUTE_META['/'];

    document.title = meta.title;
    setMetaByName('description', meta.description);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', canonicalUrl);

    setMetaByProperty('og:url', canonicalUrl);
    setMetaByProperty('og:title', meta.title);
    setMetaByProperty('og:description', meta.description);
    setMetaByName('twitter:title', meta.title);
    setMetaByName('twitter:description', meta.description);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <>
      <ScrollToTop />
      <RouteMeta />
      <Routes>
        <Route path="/" element={<BobPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:gameSlug" element={<GamesPage />} />
      </Routes>
    </>
  );
};

export default App;
