import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Globe, Users, Building2, Calendar,
  Briefcase, UserCheck, CheckCircle, RefreshCw,
  Star, ChevronLeft, CreditCard,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={14}
        className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
    ))}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ClientPublicProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/client/profile/${clientId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed");
        setProfile(data.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (clientId) fetchProfile();
  }, [clientId]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading profile…</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
        <p className="text-red-500 font-semibold mb-2">Failed to load profile</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button onClick={() => navigate(-1)}
          className="mt-4 text-teal-600 text-sm font-semibold hover:underline">
          ← Go Back
        </button>
      </div>
    </div>
  );

  const p = profile;
  const initials = p.companyName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      <div className="max-w-6xl mx-auto px-6  mt-8 pb-12">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="flex-shrink-0">
              {p.avatar ? (
                <img src={p.avatar} alt={p.companyName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-teal-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-3xl font-bold">{initials}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-900">{p.companyName}</h1>
              {p.industry && <p className="text-gray-500 text-sm mt-0.5">{p.industry}</p>}
              {p.location && (
                <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                  <MapPin size={13} />
                  <span>{p.location}</span>
                </div>
              )}

              {/* Verified badges */}
              <div className="flex gap-3 mt-3 flex-wrap">
                {p.isEmailVerified && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                    <CheckCircle size={12} className="fill-teal-500 text-white" /> Email Verified
                  </span>
                )}
                {p.isPaymentVerified && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                    <CheckCircle size={12} className="fill-teal-500 text-white" /> Payment Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats — totalSpent hidden */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Briefcase}   value={p.stats?.projectsPosted}    label="Projects Posted"    color="bg-teal-500" />
          <StatCard icon={UserCheck}   value={p.stats?.freelancersHired}   label="Freelancers Hired"  color="bg-teal-600" />
          <StatCard icon={CheckCircle} value={p.stats?.projectsCompleted}  label="Projects Completed" color="bg-teal-500" />
          <StatCard icon={RefreshCw}   value={p.stats?.repeatHires}        label="Repeat Hires"       color="bg-teal-600" />
        </div>

        {/* About + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* About Company */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About Company</h2>

            {p.about && (
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{p.about}</p>
            )}

            <div className="space-y-3">
              {[
                { icon: Building2, label: "Industry",     value: p.industry    },
                { icon: Users,     label: "Company Size", value: p.companySize },
                { icon: Globe,     label: "Website",      value: p.website, link: true },
                { icon: Calendar,  label: "Member Since", value: p.memberSince },
              ].filter(item => item.value).map(({ icon: Icon, label, value, link }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-teal-600" />
                  </div>
                  <div className="flex justify-between flex-1">
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                    {link ? (
                      <a href={`https://${value}`} target="_blank" rel="noreferrer"
                        className="text-sm text-teal-600 font-semibold hover:underline">{value}</a>
                    ) : (
                      <span className="text-sm text-gray-700 font-semibold">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews from Freelancers</h2>

            {(p.reviews || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <Star size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No reviews yet</p>
                <p className="text-xs text-gray-300 mt-1">Be the first to work with this client</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(p.reviews || []).map((r, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{r.name?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                        <span className="text-xs text-gray-400">{r.time}</span>
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientPublicProfile;