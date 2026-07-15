export interface Episode {
  id: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
}

export interface Movie {
  id: number;
  title: string;
  thumbnail: string;
  backdrop: string;
  rating: string;
  year: string;
  duration: string;
  description: string;
  category: string;
  mediaType: 'movie' | 'tv';
  episodes?: Episode[];
}

export type Page = 'home' | 'movies' | 'tv' | 'originals' | 'privacy' | 'terms' | 'profile' | 'faq';
