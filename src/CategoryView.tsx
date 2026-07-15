import { motion } from 'motion/react';
import { ChevronLeft, Star, Heart } from 'lucide-react';
import type { Movie } from './types';

export default function CategoryView({
  title,
  movies,
  onClose,
  onMovieClick,
  favorites,
  onToggleFavorite,
}: {
  title: string;
  movies: Movie[];
  onClose: () => void;
  onMovieClick: (m: Movie) => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[150] bg-[#050505] overflow-y-auto"
    >
      <div className="px-8 md:px-16 py-10">
        <div className="flex items-center gap-6 mb-12 pt-8">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{title}</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-xl mb-4">
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onClick={() => onMovieClick(movie)}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie.id); }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${favorites.has(movie.id) ? 'bg-red-500/30 text-red-400 opacity-100' : 'bg-black/50 text-white hover:bg-black/70'}`}
                >
                  <Heart size={16} fill={favorites.has(movie.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1" onClick={() => onMovieClick(movie)}>{movie.title}</h3>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span className="flex items-center gap-1 text-yellow-500"><Star size={12} fill="currentColor" /> 4.8</span>
                <span>{movie.year}</span>
                <span className="px-1.5 py-0.5 border border-white/20 rounded text-[10px] font-bold uppercase">{movie.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
