import React, { useState, useEffect } from 'react';
import { Heart, Star, Briefcase, TrendingUp, UserX } from 'lucide-react';
import ProfileCard from '../../../../components/dashboard/client/ProfileCard';

const apiUrl = import.meta.env.VITE_API_URL;

const SavedProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);

  // ── Fetch saved profiles on mount ──────────────────────────
  useEffect(() => {
    const fetchSavedProfiles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/saved-profiles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        setProfiles(data.savedProfiles || []);
      } catch (err) {
        console.error(err);
        setError('Could not load saved profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProfiles();
  }, []);

  // ── Unsave profile ─────────────────────────────────────────
  

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-teal-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Loading saved profiles…</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-teal-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100">
      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Saved Profiles</h1>
        </div>
        <p className="text-slate-400 text-sm ml-4 pl-3">
          {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} saved
        </p>
      </div>

      {/* ── Empty State ── */}
      {profiles.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
            <UserX size={32} className="text-teal-300" />
          </div>
          <h3 className="text-slate-600 font-semibold text-lg">No saved profiles yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Browse freelancers and tap the heart icon to save profiles for later.
          </p>
        </div>
      ) : (
        /* ── Grid ── */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile, index) => {
              const isRemoving = removingId === profile._id;

              return (
                < ProfileCard
                  key={profile._id}
                  profile={{
                    _id: profile._id,
                    name: `${profile.firstName} ${profile.lastName}`.trim() || "Unknown Name",
                    image: profile.photo || "https://via.placeholder.com/100",
                    expertise: profile.title || "Unknown Title",
                    description: profile.bio || "No bio available",
                    rating: profile.rating || 0,
                    jobSuccess: profile.jobSuccess || 0,
                    totalJobs: profile.totalJobs || 0,
                    available: profile.available || false,
                    consultation: profile.consultation || false,
                    isSaved: profile.isSaved || false,
                  }}
                  type="savedProfile"
                  onUnsave={(e) => handleUnsave(e, profile._id)}
                  onViewProfile={() => handleViewProfile(profile._id)}
                  className={`transition-all duration-300 ${
                    isRemoving ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default SavedProfiles;