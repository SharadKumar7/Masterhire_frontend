import React, { useState, useEffect } from 'react';
import { MoreVertical, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL;

const HiredTalentsList = () => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const fetchRecentlyHired = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/recently-hired`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        setTalents(data.talents || []);
      } catch (err) {
        console.error(err);
        setError('Could not load hired talents.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyHired();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleOutside = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [openMenuId]);

  const handleCardClick = (id) => {
    navigate(`/client/dashboard/freelancer-profile/${id}`);
  };

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="p-6 bg-white max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Previously hired talents</h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10 p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Previously hired talents</h1>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // ── Empty ──
  if (talents.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10 p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Previously hired talents</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-teal-300" />
          </div>
          <p className="text-gray-500 font-medium">No hired talents yet</p>
          <p className="text-gray-400 text-sm mt-1">Freelancers you hire will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10 p-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-gray-900">Previously hired talents</h1>
        <span className="ml-2 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
          {talents.length}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {talents.map((talent) => (
          <div
            key={talent._id}
            onClick={() => handleCardClick(talent._id)}
            className="group relative flex flex-col border border-gray-200 rounded-2xl p-5
              hover:border-teal-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            {/* Job Title + Menu */}
            <div className="flex justify-between items-start mb-4 pr-2">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 flex-1">
                <span className="text-gray-400 font-medium">Job title: </span>
                <span className="font-semibold text-gray-800">{talent.jobTitle}</span>
              </p>

              {/* 3-dot menu */}
              <div className="relative ml-3 flex-shrink-0">
                <button
                  onClick={(e) => handleMenuClick(e, talent._id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical size={18} className="text-gray-400 group-hover:text-gray-600" />
                </button>

                {openMenuId === talent._id && (
                  <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCardClick(talent._id); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); console.log('Hire again', talent._id); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      Hire Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-4">
              {talent.photo ? (
                <img
                  src={talent.photo}
                  alt={talent.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-100
                  flex items-center justify-center flex-shrink-0
                  text-teal-600 font-bold text-lg"
                >
                  {talent.name?.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <h2 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                  {talent.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {talent.expertise}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-gray-300" />
                  {talent.location || 'Location Private'}
                </p>
              </div>

              {/* Hired badge */}
              <div className="ml-auto flex-shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wide
                  bg-teal-50 text-teal-600 border border-teal-100
                  px-2.5 py-1 rounded-full">
                  Hired
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiredTalentsList;