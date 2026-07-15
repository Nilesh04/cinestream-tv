// const API = 'http://localhost:4000/api';
const API = import.meta.env.VITE_API_URL || '/api';
export interface MovieDTO {
  id: number;
  title: string;
  thumbnail: string;
  backdrop: string;
  rating: string;
  year: string;
  duration: string;
  description: string;
  category: string;
  media_type: 'movie' | 'tv';
  episodes?: EpisodeDTO[];
}

export interface EpisodeDTO {
  id: number;
  movie_id: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  episode_number: number;
}

export async function fetchMovies(params?: { category?: string; mediaType?: string }): Promise<MovieDTO[]> {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.mediaType) q.set('mediaType', params.mediaType);
  const res = await fetch(`${API}/movies?${q}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

export async function fetchMovie(id: number): Promise<MovieDTO> {
  const res = await fetch(`${API}/movies/${id}`);
  if (!res.ok) throw new Error('Failed to fetch movie');
  return res.json();
}

export async function searchMovies(query: string): Promise<MovieDTO[]> {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function signIn(email: string, password: string): Promise<{ id: number; name: string; email: string }> {
  const res = await fetch(`${API}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sign in failed');
  }
  return res.json();
}

export async function signUp(name: string, email: string, password: string): Promise<{ id: number; email: string }> {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sign up failed');
  }
  return res.json();
}

export async function updateProfile(id: number, name: string): Promise<{ id: number; name: string; email: string }> {
  const res = await fetch(`${API}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update profile');
  }
  return res.json();
}

export async function changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API}/auth/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to change password');
  }
}

export interface FaqItem {
  q: string;
  a: string;
}

export async function fetchFaq(): Promise<FaqItem[]> {
  const res = await fetch(`${API}/faq`);
  if (!res.ok) throw new Error('Failed to fetch FAQ');
  return res.json();
}

export async function fetchFavorites(userId: number): Promise<number[]> {
  const res = await fetch(`${API}/favorites?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function addFavorite(userId: number, movieId: number): Promise<void> {
  const res = await fetch(`${API}/favorites/${movieId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Failed to add favorite');
  }
}

export async function removeFavorite(userId: number, movieId: number): Promise<void> {
  const res = await fetch(`${API}/favorites/${movieId}?userId=${userId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Failed to remove favorite');
  }
}
