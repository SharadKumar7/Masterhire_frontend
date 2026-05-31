import React, { useState, useEffect } from 'react';
import { Heart, Star, Briefcase, TrendingUp, UserX } from 'lucide-react';

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
  const handleUnsave = async (e, profileId) => {
    e.stopPropagation();
    setRemovingId(profileId);

    try {
      const res = await fetch(`${apiUrl}/api/saved-profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unsave');

      // Animate out then remove
      setTimeout(() => {
        setProfiles(prev => prev.filter(p => p._id !== profileId));
        setRemovingId(null);
      }, 350);
    } catch (err) {
      console.error(err);
      setRemovingId(null);
    }
  };

  const handleViewProfile = (id) => {
    window.location.href = `/profile/${id}`;
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {profiles.map((profile, index) => {
              const isRemoving = removingId === profile._id;

              return (
                <div
                  key={profile._id}
                  onClick={() => handleViewProfile(profile._id)}
                  style={{
                    animationDelay: `${index * 60}ms`,
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'scale(0.92) translateY(-8px)' : 'scale(1) translateY(0)',
                    transition: isRemoving
                      ? 'opacity 0.35s ease, transform 0.35s ease'
                      : 'box-shadow 0.2s ease, transform 0.2s ease',
                    animation: !isRemoving ? `fadeSlideIn 0.4s ease both ${index * 60}ms` : undefined,
                  }}
                  className="relative bg-white rounded-2xl p-5 cursor-pointer group
                    border border-slate-100 hover:border-teal-200
                    shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* ── Heart / Unsave button ── */}
                  <button
                    onClick={(e) => handleUnsave(e, profile._id)}
                    disabled={isRemoving}
                    title="Remove from saved"
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full
                      flex items-center justify-center
                      bg-teal-50 hover:bg-red-50
                      border border-teal-100 hover:border-red-200
                      transition-all duration-200 group/heart"
                  >
                    <Heart
                      size={16}
                      className="fill-teal-500 stroke-teal-500
                        group-hover/heart:fill-white group-hover/heart:stroke-red-400
                        transition-all duration-200"
                    />
                  </button>

                  {/* ── Avatar + Name + Stars ── */}
                  <div className="flex items-start gap-3 mb-4 pr-8">
                    <div className="relative flex-shrink-0">
                      <img
                        src={profile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                        alt={profile.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-teal-100"
                      />
                      {/* Online dot */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                        {profile.name}
                      </h2>
                      {/* Stars */}
                      <div className="flex gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i < (profile.rating || 5)
                              ? 'fill-amber-400 stroke-amber-400'
                              : 'fill-slate-200 stroke-slate-200'}
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1">
                          {profile.rating || 5}.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Role ── */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-4">
                    {profile.role || 'Freelancer'}
                  </p>

                  {/* ── Stats strip ── */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 mb-4 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-teal-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{profile.jobSuccess || '95%'}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Success</p>
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-teal-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{profile.totalJobs || 0}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Jobs</p>
                      </div>
                    </div>
                  </div>

                  {/* ── View Profile CTA ── */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(profile._id);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold tracking-wide
                      border-2 border-teal-500 text-teal-600
                      hover:bg-teal-500 hover:text-white
                      active:scale-95
                      transition-all duration-200"
                  >
                    View Profile
                  </button>
                </div>
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