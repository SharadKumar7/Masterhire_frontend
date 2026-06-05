import React, { useState, useEffect, useRef } from "react";
import { Pencil, CheckCircle2 } from "lucide-react";
import {
  TitleBioModal, LanguagesModal, SkillsModal,
  EducationModal, WorkExperienceModal, CertificationsModal,
  OtherExperiencesModal,
} from "./ProfileModal";

const apiUrl = import.meta.env.VITE_API_URL;
const API_BASE = `${apiUrl}/api`;

// ─── Auth header helper ───────────────────────────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, onEdit, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      {onEdit && (
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-all">
          <Pencil size={13} />
        </button>
      )}
    </div>
    {children}
  </div>
);

// ─── Work History Tabs ────────────────────────────────────────────────────────
const WorkHistoryTabs = ({ completed = [], inProgress = [] }) => {
  const [tab, setTab] = useState("completed");
  const items = tab === "completed" ? completed : inProgress;
  return (
    <div>
      <div className="flex border-b border-slate-100 mb-4">
        {[
          { key: "completed",  label: `Completed (${completed.length})`   },
          { key: "inProgress", label: `In Progress (${inProgress.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-8">Nothing to show.</p>
      ) : (
        <div className="space-y-3">
          {items.map((job, i) => (
            <div key={i} className="p-3 border border-slate-100 rounded-xl text-sm bg-slate-50">
              <p className="font-semibold text-slate-800">{job.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{job.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Skill Tag ────────────────────────────────────────────────────────────────
const SkillTag = ({ skill }) => (
  <span className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold rounded-full">
    {skill}
  </span>
);

// ─── Main Profile ─────────────────────────────────────────────────────────────
const FreelancerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [openModal, setOpenModal] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/my-profile`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Save to backend ────────────────────────────────────────────────────────
  const saveToBackend = async (patch) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/my-profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Modal save ─────────────────────────────────────────────────────────────
  const handleModalSave = async (patch) => {
    setProfile(prev => ({ ...prev, ...patch }));
    await saveToBackend(patch);
  };

  // ── Avatar change ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Max 2MB check
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setProfile(prev => ({ ...prev, avatar: base64 }));
      await saveToBackend({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-slate-500 text-sm">Failed to load profile.</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Saving indicator */}
        {saving && (
          <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </div>
        )}

        {/* ── TOP CARD ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 cursor-pointer border-2 border-slate-100 hover:border-teal-400 transition-all relative"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-teal-600 bg-teal-50">
                    {profile.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-full transition-all flex items-center justify-center">
                  <Pencil size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Title + Bio */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 leading-snug line-clamp-2">
                    {profile.title || "Add your professional title"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {profile.bio || "Add a short bio about yourself"}
                  </p>
                </div>
                <button
                  onClick={() => setOpenModal("titleBio")}
                  className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-all shrink-0 mt-0.5"
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Name + Location + Stats */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900">{profile.name}</span>
                {profile.verified && <CheckCircle2 size={16} className="text-teal-500 shrink-0" />}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">{profile.location}</span>
            </div>
            <div className="flex gap-8">
              {[
                { label: "Total jobs",     value: profile.totalJobs     },
                { label: "Total earnings", value: profile.totalEarnings  },
                { label: "Job success",    value: profile.jobSuccess     },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LANGUAGES + SKILLS + EDUCATION ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="space-y-5">
            {/* Languages */}
            <SectionCard title="Languages" onEdit={() => setOpenModal("languages")}>
              {profile.languages?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No languages added</p>
              ) : (
                <div className="space-y-2">
                  {profile.languages?.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800">{l.lang}</span>
                      <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{l.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" onEdit={() => setOpenModal("education")}>
              {profile.education?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No education added</p>
              ) : (
                <div className="space-y-3">
                  {profile.education?.map((e, i) => (
                    <div key={i} className={`pb-3 ${i !== profile.education.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <p className="text-xs font-black text-slate-900">{e.institution}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{e.degree}{e.field ? ` · ${e.field}` : ""}</p>
                      {e.year && <p className="text-[11px] text-slate-400 mt-0.5">{e.year}</p>}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="md:col-span-2 space-y-5">
            {/* Skills */}
            <SectionCard title="Skills" onEdit={() => setOpenModal("skills")}>
              {profile.skills?.length === 0 ? (
                <p className="text-sm text-slate-400">No skills added</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              )}
            </SectionCard>

            {/* Work History */}
            <SectionCard title="Work History">
              <WorkHistoryTabs
                completed={profile.workHistory?.completed || []}
                inProgress={profile.workHistory?.inProgress || []}
              />
            </SectionCard>
          </div>
        </div>

        {/* ── WORK EXPERIENCE ───────────────────────────────────────── */}
        <SectionCard title="Work Experience" onEdit={() => setOpenModal("experience")}>
          {profile.workExperience?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No work experience added</p>
          ) : (
            <div className="space-y-5">
              {profile.workExperience?.map((exp, i) => (
                <div key={i} className={`pb-5 ${i !== profile.workExperience.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div className="flex items-start gap-1 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{exp.title}</span>
                    <span className="text-slate-300 text-sm">·</span>
                    <span className="font-semibold text-slate-600 text-sm">{exp.company}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── CERTIFICATIONS ────────────────────────────────────────── */}
        <SectionCard title="Certifications" onEdit={() => setOpenModal("certifications")}>
          {profile.certifications?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No certifications added</p>
          ) : (
            <div className="space-y-4">
              {profile.certifications?.map((c, i) => (
                <div key={i} className={`pb-4 ${i !== profile.certifications.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{c.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full">{c.issuer}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.issueDate && `Issued: ${c.issueDate}`}
                    {c.noExpiry ? " · No Expiry" : c.expiryDate ? ` · Expires: ${c.expiryDate}` : ""}
                  </p>
                  {c.credentialUrl && (
                    <a href={c.credentialUrl} target="_blank" rel="noreferrer"
                      className="text-[11px] text-teal-600 font-semibold hover:underline mt-0.5 block">
                      View Credential →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── OTHER EXPERIENCES ─────────────────────────────────────── */}
        <SectionCard title="Other Experiences" onEdit={() => setOpenModal("other")}>
          {profile.otherExperiences?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Add volunteer work, hackathons, awards and more</p>
          ) : (
            <div className="space-y-4">
              {profile.otherExperiences?.map((e, i) => {
                const TYPE_COLORS = {
                  "Volunteer":         "bg-emerald-50 text-emerald-700 border-emerald-200",
                  "Freelance Project": "bg-teal-50 text-teal-700 border-teal-200",
                  "Open Source":       "bg-blue-50 text-blue-700 border-blue-200",
                  "Hackathon":         "bg-violet-50 text-violet-700 border-violet-200",
                  "Award":             "bg-amber-50 text-amber-700 border-amber-200",
                  "Publication":       "bg-cyan-50 text-cyan-700 border-cyan-200",
                  "Other":             "bg-slate-50 text-slate-600 border-slate-200",
                };
                return (
                  <div key={i} className={`pb-4 ${i !== profile.otherExperiences.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">{e.title}</span>
                      {e.type && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[e.type] || TYPE_COLORS["Other"]}`}>
                          {e.type}
                        </span>
                      )}
                    </div>
                    {e.organization && <p className="text-xs text-slate-500 mt-0.5">{e.organization}</p>}
                    {e.year && <p className="text-[11px] text-slate-400 mt-0.5">{e.year}</p>}
                    {e.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

      </div>

      {/* ── MODALS ────────────────────────────────────────────────────── */}
      {openModal === "titleBio" && (
        <TitleBioModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "languages" && (
        <LanguagesModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "skills" && (
        <SkillsModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "education" && (
        <EducationModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "experience" && (
        <WorkExperienceModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "certifications" && (
        <CertificationsModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
      {openModal === "other" && (
        <OtherExperiencesModal profile={profile} onClose={() => setOpenModal(null)} onSave={handleModalSave} />
      )}
    </div>
  );
};

export default FreelancerProfile;