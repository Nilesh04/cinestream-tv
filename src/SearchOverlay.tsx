import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Star, Loader } from 'lucide-react';
import { searchMovies, type MovieDTO } from './api';
import type { Movie } from './types';

export default function SearchOverlay({
  onClose,
  onMovieClick,
}: {
  onClose: () => void;
  onMovieClick: (m: Movie) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchMovies(query);
        setResults(data.map((d: MovieDTO) => ({
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
        })));
      } catch { /* ignore */ }
      setSearching(false);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl mx-auto pt-32 px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mb-10"
        >
          <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV shows..."
            className="w-full bg-white/10 border border-white/10 rounded-3xl py-6 pl-16 pr-16 text-2xl font-medium text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/15 transition-all"
          />
          {searching && (
            <Loader size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 animate-spin" />
          )}
          {query && !searching && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {query && results.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/30 text-xl font-medium py-20"
            >
              No results for "{query}"
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {results.map((movie) => (
              <motion.button
                key={movie.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => { onMovieClick(movie); onClose(); }}
                className="w-full flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/5 group"
              >
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-16 aspect-[2/3] rounded-xl object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg group-hover:text-white transition-colors truncate">{movie.title}</h4>
                  <p className="text-sm text-white/40 line-clamp-1 mt-0.5">{movie.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1 text-yellow-500"><Star size={11} fill="currentColor" /> 4.8</span>
                    <span>{movie.year}</span>
                    <span className="px-1.5 py-0.5 border border-white/20 rounded text-[10px] font-bold uppercase">{movie.rating}</span>
                    <span className="uppercase tracking-wider">{movie.mediaType === 'tv' ? 'TV' : 'Movie'}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
