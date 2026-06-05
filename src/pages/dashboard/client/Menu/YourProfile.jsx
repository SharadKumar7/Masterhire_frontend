import React, { useState, useEffect } from "react";
import {
  MapPin, Globe, Users, Building2, Calendar, Edit2,
  Briefcase, UserCheck, DollarSign, CheckCircle, RefreshCw,
  Star, ChevronRight, CreditCard, Activity, X, Save
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const api = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${apiUrl}${path}`, opts);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Edit About Modal ──────────────────────────────────────────────────────
const EditAboutModal = ({ data, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...data });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Edit Company Info</h3>
          <button onClick={onClose}><X size={20} className="text-white/80 hover:text-white" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">About</label>
            <textarea rows={3} value={form.about || ""} onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-teal-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Industry</label>
              <input value={form.industry || ""} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Company Size</label>
              <select value={form.companySize || ""} onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                className="w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-teal-500 bg-white">
                <option value="">Select</option>
                <option>1 - 10 Employees</option>
                <option>10 - 50 Employees</option>
                <option>50 - 200 Employees</option>
                <option>200+ Employees</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Website</label>
            <input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-teal-500"
              placeholder="https://yourcompany.com" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onSave(form)} disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              <Save size={15} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={14} className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const ClientProfile = () => {
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState("all");

  // ── Fetch profile ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api("/api/client/profile");
        setProfile(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveAbout = async (form) => {
    try {
      setSaving(true);
      const { data } = await api("/api/client/profile/about", "PATCH", form);
      setProfile((p) => ({ ...p, ...data }));
      setShowEditModal(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
        <p className="text-red-500 font-semibold mb-2">Failed to load profile</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── Dummy fallback data (replace with API) ───────────────────────────────
  const p = profile || {
    companyName: "TechNova Solutions",
    industry: "IT Services",
    location: "Mumbai, India",
    about: "We build modern, scalable and reliable digital solutions for startups and enterprises.",
    companySize: "10 - 50 Employees",
    website: "technova.com",
    memberSince: "May 2024",
    isEmailVerified: true,
    isPaymentVerified: true,
    avatar: "",
    stats: { projectsPosted: 12, freelancersHired: 6, totalSpent: 45600, projectsCompleted: 8, repeatHires: 3 },
    reviews: [
      { id: 1, name: "Sharad Kumar", avatar: "", rating: 4, comment: "Great client! Clear requirements and payment on time.", time: "2 weeks ago" },
      { id: 2, name: "Aman Verma", avatar: "", rating: 5, comment: "Good communication and very professional.", time: "1 month ago" },
    ],
    recentActivity: [
      { id: 1, text: 'Posted a new project "E-commerce Website"', time: "2 days ago", type: "post" },
      { id: 2, text: 'Hired Sharad Kumar for "Website Development"', time: "1 week ago", type: "hire" },
    ],
    paymentMethod: { type: "Visa", last4: "4242", expiry: "12/26" },
  };

  const initials = p.companyName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header Banner */}
      <div className="bg-teal-600 h-32" />

      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-12">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
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
              <p className="text-gray-500 text-sm mt-0.5">{p.industry}</p>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <MapPin size={13} />
                <span>{p.location}</span>
              </div>
              {/* Verified badges */}
              <div className="flex gap-3 mt-3">
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

            {/* Edit Profile Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all px-5 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0"
            >
              <Edit2 size={15} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard icon={Briefcase}   value={p.stats?.projectsPosted}     label="Projects Posted"     color="bg-teal-500" />
          <StatCard icon={UserCheck}   value={p.stats?.freelancersHired}    label="Freelancers Hired"   color="bg-teal-600" />
          <StatCard icon={DollarSign}  value={`₹${(p.stats?.totalSpent || 0).toLocaleString("en-IN")}`} label="Total Spent" color="bg-teal-700" />
          <StatCard icon={CheckCircle} value={p.stats?.projectsCompleted}   label="Projects Completed"  color="bg-teal-500" />
          <StatCard icon={RefreshCw}   value={p.stats?.repeatHires}         label="Repeat Hires"        color="bg-teal-600" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* About Company */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">About Company</h2>
              <button onClick={() => setShowEditModal(true)}
                className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">
                <Edit2 size={13} /> Edit
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{p.about}</p>
            <div className="space-y-3">
              {[
                { icon: Building2, label: "Industry",     value: p.industry },
                { icon: Users,     label: "Company Size", value: p.companySize },
                { icon: Globe,     label: "Website",      value: p.website, link: true },
                { icon: Calendar,  label: "Member Since", value: p.memberSince },
              ].map(({ icon: Icon, label, value, link }) => (
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Reviews from Freelancers</h2>
              <button className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>

            {(p.reviews || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {(p.reviews || []).map((r) => (
                  <div key={r.id} className="flex gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{r.name[0]}</span>
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

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Activity size={18} className="text-teal-500" />
            </div>
            {(p.recentActivity || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {(p.recentActivity || []).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      act.type === "post" ? "bg-teal-50" : "bg-teal-100"
                    }`}>
                      {act.type === "post"
                        ? <Briefcase size={14} className="text-teal-600" />
                        : <UserCheck size={14} className="text-teal-700" />
                      }
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-700">{act.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              <CreditCard size={18} className="text-teal-500" />
            </div>
            {p.paymentMethod ? (
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-5 text-white relative overflow-hidden">
                {/* Card shine effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <CreditCard size={28} className="text-white/80 mb-4" />
                  <p className="text-white/60 text-xs font-medium mb-1">Card Number</p>
                  <p className="text-lg font-bold tracking-widest">•••• •••• •••• {p.paymentMethod.last4}</p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-white/60 text-xs">Expires</p>
                      <p className="font-semibold text-sm">{p.paymentMethod.expiry}</p>
                    </div>
                    <p className="font-bold text-lg">{p.paymentMethod.type}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <CreditCard size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No payment method added</p>
              </div>
            )}
            <button className="mt-4 w-full text-teal-600 text-sm font-semibold hover:underline text-center">
              Manage Payment Methods
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditAboutModal
          data={{ about: p.about, industry: p.industry, companySize: p.companySize, website: p.website }}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveAbout}
          saving={saving}
        />
      )}
    </div>
  );
};

export default ClientProfile;