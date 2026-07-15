import { useState } from 'react';
import { Star, Heart, Loader2 } from 'lucide-react';
import type { Movie } from './types';
import { updateProfile, changePassword } from './api';

interface ProfilePageProps {
  user: { id: number; name: string; email: string };
  favorites: Movie[];
  onMovieClick: (movie: Movie) => void;
  onSignOut: () => void;
  onUserUpdate: (user: { id: number; name: string; email: string }) => void;
}

export default function ProfilePage({ user, favorites, onMovieClick, onSignOut, onUserUpdate }: ProfilePageProps) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    setSaving(true);
    setNameError('');
    try {
      const updated = await updateProfile(user.id, name.trim());
      onUserUpdate(updated);
      setEditingName(false);
    } catch (e: unknown) {
      setNameError(e instanceof Error ? e.message : 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword) { setPasswordError('Current password is required'); return; }
    if (!newPassword) { setPasswordError('New password is required'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await changePassword(user.id, currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-8 md:px-16 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center text-3xl font-black">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  {editingName ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xl md:text-2xl font-black text-white outline-none focus:border-white/40 w-full min-w-[180px]"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveName} disabled={saving} className="px-4 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50">
                          {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                        </button>
                        <button onClick={() => { setEditingName(false); setName(user.name || ''); setNameError(''); }} className="px-4 py-2 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-5xl font-black tracking-tighter truncate">{user.name || 'Welcome'}</h1>
                      <button onClick={() => setEditingName(true)} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mt-1 flex-shrink-0">Edit Name</button>
                    </>
                  )}
                </div>
                {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
                <p className="text-white/40 text-lg mt-1 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button onClick={onSignOut} className="flex-1 md:flex-none px-6 py-3 bg-red-500/20 text-red-400 rounded-2xl font-bold text-sm hover:bg-red-500/30 transition-colors border border-red-500/20 whitespace-nowrap">
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-white font-bold text-2xl md:text-3xl tracking-tight mb-6 flex items-center gap-3">
              <Heart size={24} className="text-red-400" />
              My Favorites
              <span className="text-white/20 text-lg font-normal">({favorites.length})</span>
            </h2>
            {favorites.length === 0 ? (
              <div className="text-white/30 text-center py-20 text-lg font-medium">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p>No favorites yet. Start adding some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => onMovieClick(movie)}
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                  >
                    <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white font-bold text-sm leading-tight mb-1">{movie.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor" /> 4.8</span>
                        <span>{movie.year}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h3 className="text-white font-black text-lg mb-6">Change Password</h3>
              {passwordSuccess && (
                <p className="text-green-400 text-sm mb-4 bg-green-500/10 p-3 rounded-xl">Password changed successfully.</p>
              )}
              {passwordError && (
                <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-xl">{passwordError}</p>
              )}
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {changingPassword ? <Loader2 size={16} className="animate-spin" /> : null}
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
