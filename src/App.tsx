/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Info, Plus, Search, User, ChevronRight, ChevronLeft, Star, Heart } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import CategoryView from './CategoryView';
import BrowsePage from './BrowsePage';
import SearchOverlay from './SearchOverlay';
import AuthModal from './AuthModal';
import LegalPage from './LegalPage';
import ProfilePage from './ProfilePage';
import FaqPage from './FaqPage';
import { fetchMovies, fetchMovie, type MovieDTO, fetchFavorites, addFavorite, removeFavorite } from './api';
import type { Movie, Page } from './types';

function toMovie(d: MovieDTO): Movie {
  return {
    id: d.id,
    title: d.title,
    thumbnail: d.thumbnail,
    backdrop: d.backdrop,
    rating: d.rating,
    year: d.year,
    duration: d.duration,
    description: d.description,
    category: d.category,
    mediaType: d.media_type,
    episodes: d.episodes?.map(e => ({
      id: e.id,
      title: e.title,
      duration: e.duration,
      description: e.description,
      thumbnail: e.thumbnail,
    })),
  };
}

// --- Components ---

const MovieCard = ({ movie, onFocus, onClick }: { movie: Movie, onFocus: (m: Movie) => void, onClick: (m: Movie) => void, key?: React.Key }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => onFocus(movie)}
      onClick={() => onClick(movie)}
      className="relative flex-shrink-0 w-[200px] md:w-[280px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-2xl border border-white/5 group"
    >
      <img 
        src={movie.thumbnail} 
        alt={movie.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <div>
          <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2">{movie.title}</h3>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor" /> 4.8</span>
            <span>{movie.year}</span>
            <span className="px-1.5 py-0.5 border border-white/20 rounded text-[10px] font-bold uppercase">{movie.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MovieRow = ({ title, movies, onMovieFocus, onMovieClick, onViewAll }: { title: string, movies: Movie[], onMovieFocus: (m: Movie) => void, onMovieClick: (m: Movie) => void, onViewAll: (title: string) => void, key?: React.Key }) => {
  return (
    <div className="mb-16 px-8 md:px-16">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-white font-bold text-2xl md:text-3xl tracking-tight flex items-center gap-3">
          {title} 
          <ChevronRight size={24} className="text-white/20" />
        </h2>
        <button onClick={() => onViewAll(title)} className="text-white/40 hover:text-white text-sm font-medium transition-colors">View All</button>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar scroll-smooth -mx-4 px-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onFocus={onMovieFocus} onClick={onMovieClick} />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [viewAllCategory, setViewAllCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('cinestream_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('cinestream_favorites');
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [page, setPage] = useState<Page>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const navigateTo = useCallback((newPage: Page) => {
    setPage(newPage);
    window.history.pushState({ page: newPage }, '');
  }, []);

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      const p = (e.state as { page?: Page } | null)?.page;
      setPage(p ?? 'home');
    };
    window.addEventListener('popstate', handlePop);
    window.history.replaceState({ page: 'home' }, '');
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const toggleFavorite = async (id: number) => {
    if (!user) { setAuthOpen(true); return; }
    const isFav = favorites.has(id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(id); else next.add(id);
      localStorage.setItem('cinestream_favorites', JSON.stringify([...next]));
      return next;
    });
    try {
      if (isFav) {
        await removeFavorite(user.id, id);
      } else {
        await addFavorite(user.id, id);
      }
    } catch (e) {
      console.error('toggleFavorite error:', e);
      if (e instanceof Error && e.message.includes('not found')) {
        setUser(null);
        localStorage.removeItem('cinestream_user');
        localStorage.removeItem('cinestream_favorites');
        setFavorites(new Set());
        return;
      }
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(id); else next.delete(id);
        localStorage.setItem('cinestream_favorites', JSON.stringify([...next]));
        return next;
      });
    }
  };

  const FAVORITE_MOVIES = movies.filter(m => favorites.has(m.id));
  const CATEGORIES = Array.from(new Set(movies.map(m => m.category)));

  useEffect(() => {
    fetchMovies().then(data => {
      const m = data.map(toMovie);
      setMovies(m);
      setActiveMovie(m[0]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cinestream_user');
    if (saved) {
      const u = JSON.parse(saved);
      fetchFavorites(u.id).then(ids => { setFavorites(new Set(ids)); localStorage.setItem('cinestream_favorites', JSON.stringify(ids)); }).catch(() => {
        setUser(null);
        localStorage.removeItem('cinestream_user');
        localStorage.removeItem('cinestream_favorites');
      });
    }
  }, []);

  const ALL_MOVIES = movies.filter(m => m.mediaType === 'movie');
  const ALL_TV = movies.filter(m => m.mediaType === 'tv');
  const ALL_ORIGINALS = movies.filter(m => m.category === 'Originals');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMovieClick = async (movie: Movie) => {
    if (movie.mediaType === 'tv') {
      try {
        const full = await fetchMovie(movie.id);
        setSelectedMovie(toMovie(full));
        return;
      } catch { /* fallback to list data */ }
    }
    setSelectedMovie(movie);
  };

  const isLocked = selectedMovie || playingMovie || searchOpen || viewAllCategory || authOpen;
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLocked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-8 transition-all duration-700 ${isScrolled ? 'bg-black/60 backdrop-blur-3xl py-5 border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-16">
          <div className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
              <div className="w-5 h-5 bg-black rounded-md" />
            </div>
            CINESTREAM
          </div>
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-white/40">
            <button onClick={() => navigateTo('home')} className={page === 'home' ? 'text-white' : 'hover:text-white transition-colors'}>Home</button>
            <button onClick={() => navigateTo('movies')} className={page === 'movies' ? 'text-white' : 'hover:text-white transition-colors'}>Movies</button>
            <button onClick={() => navigateTo('tv')} className={page === 'tv' ? 'text-white' : 'hover:text-white transition-colors'}>TV Shows</button>
            <button onClick={() => navigateTo('originals')} className={page === 'originals' ? 'text-white' : 'hover:text-white transition-colors'}>Originals</button>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setSearchOpen(true)} className="relative hidden md:block">
            <Search size={20} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
          </button>
          <button
            onClick={() => { if (user) { navigateTo('profile'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); } else { setAuthOpen(true); } }}
            className={`w-10 h-10 rounded-2xl cursor-pointer border border-white/10 shadow-lg shadow-indigo-500/20 flex items-center justify-center font-black text-sm ${user ? 'bg-white text-black' : 'bg-gradient-to-br from-indigo-600 to-violet-600'}`}
          >{user ? user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() : <User size={18} />}</button>
        </div>
      </nav>

      {/* Legal Pages */}
      {(page === 'privacy' || page === 'terms') && (
        <LegalPage page={page} />
      )}

      {/* Profile Page */}
      {page === 'profile' && user && (
        <ProfilePage
          user={user}
          favorites={FAVORITE_MOVIES}
          onMovieClick={handleMovieClick}
          onSignOut={() => { setUser(null); localStorage.removeItem('cinestream_user'); navigateTo('home'); }}
          onUserUpdate={(u) => { setUser(u); localStorage.setItem('cinestream_user', JSON.stringify(u)); }}
        />
      )}

      {/* FAQ Page */}
      {page === 'faq' && (
        <FaqPage />
      )}

      {/* Hero Section */}
      {page === 'home' && (
        <div className="relative h-[95vh] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMovie.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={activeMovie.backdrop} 
                alt={activeMovie.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 pb-32 z-10">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-lg text-[11px] font-black tracking-[0.2em] uppercase border border-white/10">Apple TV+ Original</span>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-black text-white">4.9</span>
                </div>
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] text-balance">
                {activeMovie.title}
              </h1>
              <p className="text-xl text-white/50 mb-10 line-clamp-3 font-medium leading-relaxed max-w-xl">
                {activeMovie.description}
              </p>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setPlayingMovie(activeMovie)}
                  className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  <Play size={24} fill="black" /> Watch Now
                </button>
                <button 
                  onClick={() => handleMovieClick(activeMovie!)}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                >
                  <Info size={24} /> Details
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      {page === 'home' && (
        <div id="trending" className="relative z-20 -mt-24 pb-20">
          {user && FAVORITE_MOVIES.length > 0 && (
            <MovieRow
              title="My Favorites"
              movies={FAVORITE_MOVIES}
              onMovieFocus={setActiveMovie}
              onMovieClick={handleMovieClick}
              onViewAll={() => { navigateTo('profile'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }}
            />
          )}
          {CATEGORIES.map((cat: string) => (
            <MovieRow 
              key={cat} 
              title={cat} 
              movies={movies.filter(m => m.category === cat)} 
              onMovieFocus={setActiveMovie}
              onMovieClick={handleMovieClick}
              onViewAll={setViewAllCategory}
            />
          ))}
        </div>
      )}

      {/* Browse Pages */}
      <AnimatePresence mode="wait">
        {page !== 'home' && page !== 'privacy' && page !== 'terms' && page !== 'profile' && page !== 'faq' && (
          <BrowsePage page={page}
            movies={page === 'movies' ? ALL_MOVIES : page === 'tv' ? ALL_TV : ALL_ORIGINALS}
            onMovieClick={handleMovieClick}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-[#111] rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative">
                <img 
                  src={selectedMovie.backdrop} 
                  alt={selectedMovie.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#111]" />
              </div>
              <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                <div className="absolute top-8 right-8 flex gap-3">
                  <button
                    onClick={() => toggleFavorite(selectedMovie.id)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${favorites.has(selectedMovie.id) ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                  >
                    <Heart size={20} fill={favorites.has(selectedMovie.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => setSelectedMovie(null)}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
                  >
                    <Plus className="rotate-45" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-indigo-400 font-black tracking-widest uppercase text-xs">{selectedMovie.mediaType === 'tv' ? 'TV Series' : 'Original Series'}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/60 text-xs font-bold">{selectedMovie.year}</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">{selectedMovie.title}</h2>
                <div className="flex items-center gap-6 mb-10">
                  <div className="flex items-center gap-2">
                    <Star size={16} fill="#fbbf24" className="text-yellow-500" />
                    <span className="font-black text-lg">4.9</span>
                  </div>
                  <span className="px-2 py-1 border border-white/20 rounded-lg text-xs font-black uppercase tracking-widest">{selectedMovie.rating}</span>
                  <span className="text-white/40 font-bold">{selectedMovie.duration}</span>
                </div>
                <p className="text-xl text-white/60 leading-relaxed mb-8 font-medium">
                  {selectedMovie.description}
                </p>
                {selectedMovie.mediaType === 'movie' ? (
                  <button
                    onClick={() => { setPlayingMovie(selectedMovie); setSelectedMovie(null); }}
                    className="bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-white/90 transition-all shadow-xl shadow-white/5"
                  >
                    Start Watching
                  </button>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
                    {selectedMovie.episodes?.map((ep, i) => (
                      <button
                        key={ep.id}
                        onClick={() => { setPlayingMovie(selectedMovie); setSelectedMovie(null); }}
                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group border border-white/5"
                      >
                        <img src={ep.thumbnail} alt={ep.title} className="w-20 aspect-video rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">Ep {i + 1}</span>
                            <span className="text-xs text-white/30">{ep.duration}</span>
                          </div>
                          <h4 className="font-bold text-sm truncate group-hover:text-white transition-colors">{ep.title}</h4>
                          <p className="text-xs text-white/40 line-clamp-1">{ep.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <AnimatePresence>
        {playingMovie && (
          <VideoPlayer onClose={() => setPlayingMovie(null)} />
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            onClose={() => setSearchOpen(false)}
            onMovieClick={handleMovieClick}
          />
        )}
      </AnimatePresence>

      {/* Category View */}
      <AnimatePresence>
        {viewAllCategory && (
          <CategoryView
            title={viewAllCategory}
            movies={movies.filter(m => m.category === viewAllCategory)}
            onClose={() => setViewAllCategory(null)}
            onMovieClick={handleMovieClick}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {authOpen && (
          <AuthModal
            onClose={() => setAuthOpen(false)}
            onSignIn={async (u) => {
              try { const ids = await fetchFavorites(u.id); setFavorites(new Set(ids)); localStorage.setItem('cinestream_favorites', JSON.stringify(ids)); } catch {}
              setUser(u);
              localStorage.setItem('cinestream_user', JSON.stringify(u));
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-32 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-20 mb-20">
            <div className="space-y-8">
              <div className="text-xl font-black tracking-tighter">CINESTREAM</div>
              <p className="text-white/30 text-sm leading-relaxed">
                The world's most immersive streaming experience, crafted for the big screen.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Explore</h4>
              <ul className="text-white/40 text-sm space-y-4 font-medium">
                <li><button onClick={() => { navigateTo('originals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Originals</button></li>
                <li><button onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">Trending</button></li>
                <li><button onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Coming Soon</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Account</h4>
              <ul className="text-white/40 text-sm space-y-4 font-medium">
                <li><button onClick={() => { if (user) { navigateTo('profile'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); } else { setAuthOpen(true); } }} className="hover:text-white transition-colors">Profile</button></li>
                <li><button onClick={() => { navigateTo('faq'); window.scrollTo({ top: 0 }); }} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Connect</h4>
              <div className="flex items-center gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-white/40 hover:text-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-white/40 hover:text-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
              <div className="flex flex-col gap-4">
                <a href="https://play.google.com/store/apps/details?id=com.cinestream" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity block">
                  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="w-[140px] h-auto" />
                </a>
                <a href="https://apps.apple.com/app/cinestream/id123456789" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity block">
                  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store" className="w-[140px] h-auto" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
            <div className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">
              © 2026 CineStream Entertainment Inc. All Rights Reserved.
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/20">
              <button onClick={() => { navigateTo('privacy'); window.scrollTo({ top: 0 }); }} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => { navigateTo('terms'); window.scrollTo({ top: 0 }); }} className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
