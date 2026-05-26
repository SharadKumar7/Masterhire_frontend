import React, { useState, useEffect, useRef } from "react";
import { Pencil, Check, X, Plus, Trash2, CheckCircle2 } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

const API_BASE = `${apiUrl}/api`;

// ─── Inline Text Editor ───────────────────────────────────────────────────────
const EditableText = ({ value, onChange, multiline = false, className = "", placeholder = "Click to edit" }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return multiline ? (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
        className={`w-full border border-teal-400 rounded-md px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 ${className}`}
        rows={4}
      />
    ) : (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        className={`border border-teal-400 rounded-md px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 w-full ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-pointer hover:bg-teal-50 rounded px-0.5 transition-colors ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-gray-300 italic">{placeholder}</span>}
    </span>
  );
};

// ─── Section Header with Edit Icon ───────────────────────────────────────────
const SectionHeader = ({ title, onEdit }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    <button onClick={onEdit} className="text-gray-400 hover:text-teal-600 transition-colors">
      <Pencil size={15} />
    </button>
  </div>
);

// ─── Skill Tag ────────────────────────────────────────────────────────────────
const SkillTag = ({ skill, onRemove, editable }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-full">
    {skill}
    {editable && (
      <button onClick={() => onRemove(skill)} className="hover:text-red-500 transition-colors">
        <X size={11} />
      </button>
    )}
  </span>
);

// ─── Work History Tabs ────────────────────────────────────────────────────────
const WorkHistoryTabs = ({ completed = [], inProgress = [] }) => {
  const [tab, setTab] = useState("completed");
  const items = tab === "completed" ? completed : inProgress;

  return (
    <div>
      <div className="flex gap-0 border-b border-gray-200 mb-4">
        {["completed", "inProgress"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "completed" ? `Completed jobs (${completed.length})` : `In progress (${inProgress.length})`}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">Nothing to show.</p>
      ) : (
        <div className="space-y-3">
          {items.map((job, i) => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg text-sm">
              <p className="font-semibold text-gray-800">{job.title}</p>
              <p className="text-gray-500 text-xs">{job.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const FreelancerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit modals state
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingCerts, setEditingCerts] = useState(false);
  const [editingOther, setEditingOther] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);

  const fileInputRef = useRef(null);

  // ── Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProfile(data);
      } catch {
        // fallback mock data
        setProfile({
          id: 1,
          avatar: null,
          name: "Bijoy Pantu",
          verified: true,
          location: "Howrah, West Bengal",
          title: "Laravel Expert | PHP Expert | Shopify Expert | Backend Developer | React.js, Node.js",
          bio: "Results-oriented Data Analyst skilled in statistical analysis, data visualization, and SQL, passionate about turning raw data into actionable insights to support decision-making. Interested in discovering insights through accurate, clean data and communicating them through easy-to-use dashboards.",
          totalJobs: 34,
          totalEarnings: "₹12K+",
          jobSuccess: "95%",
          languages: [
            { lang: "English", level: "Fluent" },
            { lang: "Bengali", level: "Native or Bilingual" },
            { lang: "Hindi", level: "Conversational" },
          ],
          education: [
            { institution: "Budge Budge Institute of Technology", degree: "Bachelor's degree, Computer Science", years: "2022–2026" },
            { institution: "Budge Budge Institute of Technology", degree: "Master's degree, Computer Science", years: "2027–2029" },
          ],
          skills: ["Wordpress", "MS SQL Server", "Node.js", "Laravel", "MongoDB", "Tableau", "PostgreSQL", "React.js"],
          workHistory: { completed: [], inProgress: [] },
          workExperience: [
            { title: "Senior Data Analyst", company: "Virginia Commonwealth University", period: "July 2015 - Present", description: "Use of insurance claim files to create markers of disease and health services, Integration and linking of large data from multiple sources and at different levels, Transformation of clinical data for research and compliance monitoring, Development of new measures in epidemiological studies." },
            { title: "Graduate Research Assistant", company: "Virginia Commonwealth University", period: "August 2012 - May 2015", description: "" },
          ],
          certifications: [
            { name: "Google Data Analytics", issuer: "Coursera", period: "June 2025 - July 2025" },
            { name: "IBM Generative AI Engineering", issuer: "IBM", period: "August 2012 - May 2015" },
          ],
          otherExperiences: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Mark dirty whenever profile changes after initial load
  const update = (updater) => {
    setProfile((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
    setDirty(true);
  };

  // ── Save to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Save failed");
      setDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update({ avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 p-6 space-y-6">

        {/* ── TOP CARD ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 cursor-pointer border-2 border-gray-100 hover:border-teal-400 transition-all"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-teal-600 bg-teal-50">
                    {profile.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all flex items-center justify-center">
                  <Pencil size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Title + Bio + Edit icon */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <EditableText
                    value={profile.title}
                    onChange={(val) => update({ title: val })}
                    className="text-lg font-bold text-gray-900 block w-full"
                  />
                  <EditableText
                    value={profile.bio}
                    onChange={(val) => update({ bio: val })}
                    multiline
                    className="text-sm text-gray-500 mt-2 leading-relaxed block w-full"
                    placeholder="Add a bio..."
                  />
                </div>
                <button
                  onClick={() => {}}
                  className="text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0 mt-1"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Name + Location + Stats */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1.5">
                <EditableText
                  value={profile.name}
                  onChange={(val) => update({ name: val })}
                  className="text-base font-bold text-gray-900"
                />
                {profile.verified && (
                  <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0" />
                )}
              </div>
              <EditableText
                value={profile.location}
                onChange={(val) => update({ location: val })}
                className="text-xs text-gray-500 mt-0.5 block"
                placeholder="Add location"
              />
            </div>

            <div className="flex gap-8">
              {[
                { label: "Total jobs", value: profile.totalJobs },
                { label: "Total earnings", value: profile.totalEarnings },
                { label: "Job success", value: profile.jobSuccess },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LANGUAGES + SKILLS ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Languages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Languages" onEdit={() => setEditingLanguages(!editingLanguages)} />
            <div className="space-y-2">
              {profile.languages.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div className="text-sm">
                    <EditableText
                      value={l.lang}
                      onChange={(val) => {
                        const langs = [...profile.languages];
                        langs[i] = { ...langs[i], lang: val };
                        update({ languages: langs });
                      }}
                      className="font-semibold text-gray-800"
                    />
                    <span className="text-gray-500">: </span>
                    <EditableText
                      value={l.level}
                      onChange={(val) => {
                        const langs = [...profile.languages];
                        langs[i] = { ...langs[i], level: val };
                        update({ languages: langs });
                      }}
                      className="text-gray-600"
                    />
                  </div>
                  {editingLanguages && (
                    <button
                      onClick={() => update({ languages: profile.languages.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              {editingLanguages && (
                <button
                  onClick={() => update({ languages: [...profile.languages, { lang: "New Language", level: "Basic" }] })}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 mt-2"
                >
                  <Plus size={13} /> Add language
                </button>
              )}
            </div>

            {/* Education */}
            <div className="mt-6">
              <SectionHeader title="Education" onEdit={() => setEditingEducation(!editingEducation)} />
              <div className="space-y-3">
                {profile.education.map((e, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <div className="text-sm">
                      <EditableText
                        value={e.institution}
                        onChange={(val) => {
                          const ed = [...profile.education];
                          ed[i] = { ...ed[i], institution: val };
                          update({ education: ed });
                        }}
                        className="font-bold text-gray-800 block"
                      />
                      <EditableText
                        value={e.degree}
                        onChange={(val) => {
                          const ed = [...profile.education];
                          ed[i] = { ...ed[i], degree: val };
                          update({ education: ed });
                        }}
                        className="text-gray-500 block"
                      />
                      <EditableText
                        value={e.years}
                        onChange={(val) => {
                          const ed = [...profile.education];
                          ed[i] = { ...ed[i], years: val };
                          update({ education: ed });
                        }}
                        className="text-gray-400 text-xs block"
                      />
                    </div>
                    {editingEducation && (
                      <button
                        onClick={() => update({ education: profile.education.filter((_, j) => j !== i) })}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {editingEducation && (
                  <button
                    onClick={() => update({ education: [...profile.education, { institution: "Institution", degree: "Degree", years: "Year–Year" }] })}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800"
                  >
                    <Plus size={13} /> Add education
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Skills + Work History */}
          <div className="md:col-span-2 space-y-5">

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionHeader title="Skills" onEdit={() => setEditingSkills(!editingSkills)} />
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <SkillTag key={s} skill={s} editable={editingSkills} onRemove={(sk) => update({ skills: profile.skills.filter((x) => x !== sk) })} />
                ))}
              </div>
              {editingSkills && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSkill.trim()) {
                        update({ skills: [...profile.skills, newSkill.trim()] });
                        setNewSkill("");
                      }
                    }}
                    placeholder="Add skill & press Enter"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  <button
                    onClick={() => {
                      if (newSkill.trim()) {
                        update({ skills: [...profile.skills, newSkill.trim()] });
                        setNewSkill("");
                      }
                    }}
                    className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Work History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Work history</h2>
              <WorkHistoryTabs
                completed={profile.workHistory?.completed || []}
                inProgress={profile.workHistory?.inProgress || []}
              />
            </div>
          </div>
        </div>

        {/* ── WORK EXPERIENCE ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <SectionHeader title="Work experience" onEdit={() => setEditingExperience(!editingExperience)} />
          <div className="space-y-5">
            {profile.workExperience.map((exp, i) => (
              <div key={i} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <EditableText
                        value={exp.title}
                        onChange={(val) => {
                          const wx = [...profile.workExperience];
                          wx[i] = { ...wx[i], title: val };
                          update({ workExperience: wx });
                        }}
                        className="font-bold text-gray-900 text-sm"
                      />
                      <span className="text-gray-400 text-sm">|</span>
                      <EditableText
                        value={exp.company}
                        onChange={(val) => {
                          const wx = [...profile.workExperience];
                          wx[i] = { ...wx[i], company: val };
                          update({ workExperience: wx });
                        }}
                        className="font-bold text-gray-900 text-sm"
                      />
                    </div>
                    <EditableText
                      value={exp.period}
                      onChange={(val) => {
                        const wx = [...profile.workExperience];
                        wx[i] = { ...wx[i], period: val };
                        update({ workExperience: wx });
                      }}
                      className="text-xs text-gray-500 block mt-0.5"
                    />
                    {exp.description && (
                      <EditableText
                        value={exp.description}
                        onChange={(val) => {
                          const wx = [...profile.workExperience];
                          wx[i] = { ...wx[i], description: val };
                          update({ workExperience: wx });
                        }}
                        multiline
                        className="text-sm text-gray-600 mt-2 block leading-relaxed"
                      />
                    )}
                  </div>
                  {editingExperience && (
                    <button
                      onClick={() => update({ workExperience: profile.workExperience.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {editingExperience && (
              <button
                onClick={() => update({ workExperience: [...profile.workExperience, { title: "Job Title", company: "Company", period: "Month Year - Present", description: "" }] })}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800"
              >
                <Plus size={14} /> Add experience
              </button>
            )}
          </div>
        </div>

        {/* ── CERTIFICATIONS ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <SectionHeader title="Certifications" onEdit={() => setEditingCerts(!editingCerts)} />
          <div className="space-y-4">
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex justify-between gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="text-sm">
                  <EditableText
                    value={cert.name}
                    onChange={(val) => {
                      const certs = [...profile.certifications];
                      certs[i] = { ...certs[i], name: val };
                      update({ certifications: certs });
                    }}
                    className="font-bold text-gray-900 block"
                  />
                  <EditableText
                    value={cert.issuer}
                    onChange={(val) => {
                      const certs = [...profile.certifications];
                      certs[i] = { ...certs[i], issuer: val };
                      update({ certifications: certs });
                    }}
                    className="text-gray-500 block mt-0.5"
                  />
                  <EditableText
                    value={cert.period}
                    onChange={(val) => {
                      const certs = [...profile.certifications];
                      certs[i] = { ...certs[i], period: val };
                      update({ certifications: certs });
                    }}
                    className="text-gray-400 text-xs block mt-0.5"
                  />
                </div>
                {editingCerts && (
                  <button
                    onClick={() => update({ certifications: profile.certifications.filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {editingCerts && (
              <button
                onClick={() => update({ certifications: [...profile.certifications, { name: "Certification Name", issuer: "Issuer", period: "Month Year" }] })}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800"
              >
                <Plus size={14} /> Add certification
              </button>
            )}
          </div>
        </div>

        {/* ── OTHER EXPERIENCES ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <SectionHeader title="Other experiences" onEdit={() => setEditingOther(!editingOther)} />
          {profile.otherExperiences?.length === 0 && !editingOther ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Add any other experiences that help you stand out
            </p>
          ) : (
            <div className="space-y-3">
              {profile.otherExperiences?.map((exp, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div className="text-sm flex-1">
                    <EditableText
                      value={exp.title}
                      onChange={(val) => {
                        const oe = [...profile.otherExperiences];
                        oe[i] = { ...oe[i], title: val };
                        update({ otherExperiences: oe });
                      }}
                      className="font-bold text-gray-800 block"
                    />
                    <EditableText
                      value={exp.description}
                      onChange={(val) => {
                        const oe = [...profile.otherExperiences];
                        oe[i] = { ...oe[i], description: val };
                        update({ otherExperiences: oe });
                      }}
                      multiline
                      className="text-gray-500 block mt-1"
                    />
                  </div>
                  {editingOther && (
                    <button
                      onClick={() => update({ otherExperiences: profile.otherExperiences.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {editingOther && (
                <button
                  onClick={() => update({ otherExperiences: [...(profile.otherExperiences || []), { title: "Experience Title", description: "Description..." }] })}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800"
                >
                  <Plus size={14} /> Add experience
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── FLOATING SAVE BAR ─────────────────────────────────────────────── */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-4xl mx-auto px-4 pb-4">
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-300">You have unsaved changes</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDirty(false);
                    window.location.reload(); // revert by refetching
                  }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE SUCCESS TOAST ────────────────────────────────────────────── */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-teal-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <Check size={16} />
            Changes saved successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile;