import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, GraduationCap, Briefcase, Award, Star, Globe } from "lucide-react";

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
export const ModalWrapper = ({ title, icon: Icon, onClose, children, onSave, saving }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {Icon && <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center"><Icon size={16} className="text-teal-600" /></div>}
          <h3 className="text-base font-black text-slate-900">{title}</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <X size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-6 py-5">
        {children}
      </div>

      {/* Footer */}
      {onSave && (
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm">
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={13} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  </div>
);

// ─── Input / Textarea helpers ─────────────────────────────────────────────────
const Input = ({ label, value, onChange, placeholder, type = "text", required }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all" />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all resize-none" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-white appearance-none cursor-pointer">
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

// ─── 1. Title & Bio Modal ─────────────────────────────────────────────────────
export const TitleBioModal = ({ profile, onClose, onSave }) => {
  const [title, setTitle] = useState(profile.title || "");
  const [bio, setBio]     = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ title, bio });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Edit Title & Bio" icon={Briefcase} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <Textarea label="Professional Title" value={title} onChange={setTitle}
          placeholder="e.g. Full Stack Developer | React Expert" rows={2} />
        <Textarea label="Bio / Overview" value={bio} onChange={setBio}
          placeholder="Describe your experience, expertise and what makes you stand out..." rows={6} />
        <p className="text-[10px] text-slate-400">{bio.length} / 2000 characters</p>
      </div>
    </ModalWrapper>
  );
};

// ─── 2. Languages Modal ───────────────────────────────────────────────────────
const LANGUAGE_OPTIONS = ["Hindi", "Bengali", "Marathi", "Gujarati", "Kannada", "Telugu", "Tamil", "Punjabi", "Urdu", "Odia"];
const PROFICIENCY_OPTIONS = [
  { value: "Select Level", label: "Select Level" },
  { value: "Basic", label: "Basic" },
  { value: "Conversational", label: "Conversational" },
  { value: "Fluent", label: "Fluent" },
  { value: "Native/Bilingual", label: "Native/Bilingual" },
];

export const LanguagesModal = ({ profile, onClose, onSave }) => {
  const [englishLevel, setEnglishLevel] = useState(
    profile.languages?.find(l => l.lang === "English")?.level || "Select Level"
  );
  const [others, setOthers] = useState(
    profile.languages?.filter(l => l.lang !== "English") || []
  );
  const [saving, setSaving] = useState(false);

  const addRow = () => setOthers(prev => [...prev, { lang: LANGUAGE_OPTIONS[0], level: "Select Level" }]);
  const removeRow = (i) => setOthers(prev => prev.filter((_, j) => j !== i));
  const updateRow = (i, field, val) => setOthers(prev => prev.map((r, j) => j === i ? { ...r, [field]: val } : r));

  const handleSave = async () => {
    setSaving(true);
    const languages = [{ lang: "English", level: englishLevel }, ...others];
    await onSave({ languages });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Edit Languages" icon={Globe} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-3">

        {/* English — fixed, only proficiency editable */}
        <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
          <div className="flex-1">
            <p className="text-xs font-bold text-teal-700">English</p>
            <p className="text-[10px] text-teal-500">Required · Cannot be removed</p>
          </div>
          <div className="w-40">
            <Select value={englishLevel} onChange={setEnglishLevel} options={PROFICIENCY_OPTIONS} />
          </div>
        </div>

        {/* Other languages */}
        {others.map((row, i) => (
          <div key={i} className="flex items-center gap-2 p-3 border border-slate-100 rounded-xl bg-slate-50">
            <div className="flex-1">
              <Select value={row.lang} onChange={val => updateRow(i, "lang", val)}
                options={LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))} />
            </div>
            <div className="w-40">
              <Select value={row.level} onChange={val => updateRow(i, "level", val)} options={PROFICIENCY_OPTIONS} />
            </div>
            <button onClick={() => removeRow(i)}
              className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <Trash2 size={13} className="text-rose-500" />
            </button>
          </div>
        ))}

        <button onClick={addRow}
          className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors py-1">
          <Plus size={13} /> Add another language
        </button>
      </div>
    </ModalWrapper>
  );
};

// ─── 3. Skills Modal ──────────────────────────────────────────────────────────
export const SkillsModal = ({ profile, onClose, onSave }) => {
  const [skills, setSkills] = useState([...(profile.skills || [])]);
  const [input, setInput]   = useState("");
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setInput("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ skills });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Edit Skills" icon={Star} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        {/* Input box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Add Skill</label>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSkill()}
              placeholder="Type skill and press Enter..."
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
            />
            <button onClick={addSkill}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Skills tags box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Your Skills <span className="text-slate-300">({skills.length})</span>
          </label>
          <div className="min-h-[80px] border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 bg-slate-50">
            {skills.length === 0 ? (
              <p className="text-xs text-slate-300 m-auto">No skills added yet</p>
            ) : (
              skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-200 text-teal-700 text-xs font-semibold rounded-full shadow-sm">
                  {s}
                  <button onClick={() => setSkills(prev => prev.filter(x => x !== s))}
                    className="hover:text-rose-500 transition-colors">
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// ─── 4. Education Modal ───────────────────────────────────────────────────────
const EMPTY_EDU = { institution: "", degree: "", field: "", year: "", description: "" };

export const EducationModal = ({ profile, onClose, onSave }) => {
  const [list, setList]     = useState(profile.education?.map(e => ({ ...EMPTY_EDU, ...e })) || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ ...EMPTY_EDU });
  const [saving, setSaving] = useState(false);

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const saveEntry = () => {
    if (!form.institution.trim() || !form.degree.trim()) return;
    setList(prev => [...prev, { ...form }]);
    setForm({ ...EMPTY_EDU });
    setAdding(false);
  };

  const removeEntry = (i) => setList(prev => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ education: list });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Education" icon={GraduationCap} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">

        {/* Existing entries */}
        {list.map((e, i) => (
          <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{e.institution}</p>
              <p className="text-xs text-slate-600 mt-0.5">{e.degree}{e.field ? ` · ${e.field}` : ""}</p>
              {e.year && <p className="text-[11px] text-slate-400 mt-0.5">{e.year}</p>}
              {e.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{e.description}</p>}
            </div>
            <button onClick={() => removeEntry(i)}
              className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <Trash2 size={13} className="text-rose-500" />
            </button>
          </div>
        ))}

        {/* Add new entry form */}
        {adding ? (
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 space-y-3">
            <p className="text-xs font-black text-teal-700 uppercase tracking-wider">Add Education</p>
            <Input label="Institution / University" value={form.institution} onChange={v => updateForm("institution", v)}
              placeholder="e.g. IIT Bombay" required />
            <Input label="Degree / Level" value={form.degree} onChange={v => updateForm("degree", v)}
              placeholder="e.g. Bachelor's Degree" required />
            <Input label="Field of Study" value={form.field} onChange={v => updateForm("field", v)}
              placeholder="e.g. Computer Science" />
            <Input label="Passing Year" value={form.year} onChange={v => updateForm("year", v)}
              placeholder="e.g. 2024 or 2020–2024" />
            <Textarea label="Description (Optional)" value={form.description} onChange={v => updateForm("description", v)}
              placeholder="GPA, awards, achievements..." rows={2} />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ ...EMPTY_EDU }); }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={saveEntry}
                disabled={!form.institution.trim() || !form.degree.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-all">
                Add Education
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2.5 border border-dashed border-teal-300 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
            <Plus size={14} /> Add Education
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};

// ─── 5. Work Experience Modal ─────────────────────────────────────────────────
const EMPTY_EXP = { title: "", company: "", startDate: "", endDate: "", current: false, description: "" };

export const WorkExperienceModal = ({ profile, onClose, onSave }) => {
  const [list, setList]     = useState(profile.workExperience?.map(e => ({ ...EMPTY_EXP, ...e })) || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ ...EMPTY_EXP });
  const [saving, setSaving] = useState(false);

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const saveEntry  = () => {
    if (!form.title.trim() || !form.company.trim()) return;
    setList(prev => [...prev, { ...form }]);
    setForm({ ...EMPTY_EXP });
    setAdding(false);
  };
  const removeEntry = (i) => setList(prev => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ workExperience: list });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Work Experience" icon={Briefcase} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">

        {list.map((e, i) => (
          <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{e.title}</p>
              <p className="text-xs text-slate-600 mt-0.5">{e.company}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {e.startDate} – {e.current ? "Present" : e.endDate}
              </p>
              {e.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{e.description}</p>}
            </div>
            <button onClick={() => removeEntry(i)}
              className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <Trash2 size={13} className="text-rose-500" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 space-y-3">
            <p className="text-xs font-black text-teal-700 uppercase tracking-wider">Add Experience</p>
            <Input label="Job Title" value={form.title} onChange={v => updateForm("title", v)}
              placeholder="e.g. Senior Developer" required />
            <Input label="Company" value={form.company} onChange={v => updateForm("company", v)}
              placeholder="e.g. Google India" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" value={form.startDate} onChange={v => updateForm("startDate", v)}
                placeholder="e.g. Jan 2022" />
              <Input label="End Date" value={form.endDate} onChange={v => updateForm("endDate", v)}
                placeholder="e.g. Dec 2024" disabled={form.current} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => updateForm("current", !form.current)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  form.current ? "bg-teal-600 border-teal-600" : "border-slate-300"
                }`}
              >
                {form.current && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs font-semibold text-slate-600">I currently work here</span>
            </label>
            <Textarea label="Description" value={form.description} onChange={v => updateForm("description", v)}
              placeholder="Describe your responsibilities and achievements..." rows={3} />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ ...EMPTY_EXP }); }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={saveEntry}
                disabled={!form.title.trim() || !form.company.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-all">
                Add Experience
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2.5 border border-dashed border-teal-300 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
            <Plus size={14} /> Add Work Experience
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};

// ─── 6. Certifications Modal ──────────────────────────────────────────────────
const EMPTY_CERT = { name: "", issuer: "", issueDate: "", expiryDate: "", noExpiry: false, credentialUrl: "" };

export const CertificationsModal = ({ profile, onClose, onSave }) => {
  const [list, setList]     = useState(profile.certifications?.map(c => ({ ...EMPTY_CERT, ...c })) || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ ...EMPTY_CERT });
  const [saving, setSaving] = useState(false);

  const updateForm  = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const saveEntry   = () => {
    if (!form.name.trim()) return;
    setList(prev => [...prev, { ...form }]);
    setForm({ ...EMPTY_CERT });
    setAdding(false);
  };
  const removeEntry = (i) => setList(prev => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ certifications: list });
    setSaving(false);
    onClose();
  };

  return (
    <ModalWrapper title="Certifications" icon={Award} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">

        {list.map((c, i) => (
          <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full">
                  {c.issuer}
                </span>
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
            <button onClick={() => removeEntry(i)}
              className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <Trash2 size={13} className="text-rose-500" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 space-y-3">
            <p className="text-xs font-black text-teal-700 uppercase tracking-wider">Add Certification</p>
            <Input label="Certification Name" value={form.name} onChange={v => updateForm("name", v)}
              placeholder="e.g. AWS Solutions Architect" required />
            <Input label="Issuing Organization" value={form.issuer} onChange={v => updateForm("issuer", v)}
              placeholder="e.g. Amazon, Google, Coursera" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issue Date" value={form.issueDate} onChange={v => updateForm("issueDate", v)}
                placeholder="e.g. Jun 2024" />
              <Input label="Expiry Date" value={form.expiryDate} onChange={v => updateForm("expiryDate", v)}
                placeholder="e.g. Jun 2027" disabled={form.noExpiry} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => updateForm("noExpiry", !form.noExpiry)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  form.noExpiry ? "bg-teal-600 border-teal-600" : "border-slate-300"
                }`}>
                {form.noExpiry && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs font-semibold text-slate-600">This credential does not expire</span>
            </label>
            <Input label="Credential URL (Optional)" value={form.credentialUrl} onChange={v => updateForm("credentialUrl", v)}
              placeholder="https://credential-link.com" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ ...EMPTY_CERT }); }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={saveEntry} disabled={!form.name.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-all">
                Add Certification
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2.5 border border-dashed border-teal-300 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
            <Plus size={14} /> Add Certification
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};

// ─── 7. Other Experiences Modal ───────────────────────────────────────────────
const EMPTY_OTHER = { title: "", type: "Volunteer", organization: "", year: "", description: "" };
const OTHER_TYPES = ["Volunteer", "Freelance Project", "Open Source", "Hackathon", "Award", "Publication", "Other"];

export const OtherExperiencesModal = ({ profile, onClose, onSave }) => {
  const [list, setList]     = useState(profile.otherExperiences?.map(e => ({ ...EMPTY_OTHER, ...e })) || []);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ ...EMPTY_OTHER });
  const [saving, setSaving] = useState(false);

  const updateForm  = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const saveEntry   = () => {
    if (!form.title.trim()) return;
    setList(prev => [...prev, { ...form }]);
    setForm({ ...EMPTY_OTHER });
    setAdding(false);
  };
  const removeEntry = (i) => setList(prev => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ otherExperiences: list });
    setSaving(false);
    onClose();
  };

  const TYPE_COLORS = {
    "Volunteer":        "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Freelance Project":"bg-teal-50 text-teal-700 border-teal-200",
    "Open Source":      "bg-blue-50 text-blue-700 border-blue-200",
    "Hackathon":        "bg-violet-50 text-violet-700 border-violet-200",
    "Award":            "bg-amber-50 text-amber-700 border-amber-200",
    "Publication":      "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Other":            "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <ModalWrapper title="Other Experiences" icon={Star} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">

        {list.map((e, i) => (
          <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-900 truncate">{e.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[e.type] || TYPE_COLORS["Other"]}`}>
                  {e.type}
                </span>
              </div>
              {e.organization && <p className="text-xs text-slate-500 mt-0.5">{e.organization}</p>}
              {e.year && <p className="text-[11px] text-slate-400 mt-0.5">{e.year}</p>}
              {e.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{e.description}</p>}
            </div>
            <button onClick={() => removeEntry(i)}
              className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <Trash2 size={13} className="text-rose-500" />
            </button>
          </div>
        ))}

        {list.length === 0 && !adding && (
          <div className="py-6 text-center">
            <Star size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No other experiences added yet</p>
            <p className="text-xs text-slate-300 mt-0.5">Add volunteer work, hackathons, awards and more</p>
          </div>
        )}

        {adding ? (
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 space-y-3">
            <p className="text-xs font-black text-teal-700 uppercase tracking-wider">Add Experience</p>
            <Input label="Title" value={form.title} onChange={v => updateForm("title", v)}
              placeholder="e.g. Hackathon Winner, Open Source Contributor" required />
            <Select label="Type" value={form.type} onChange={v => updateForm("type", v)}
              options={OTHER_TYPES.map(t => ({ value: t, label: t }))} />
            <Input label="Organization / Event" value={form.organization} onChange={v => updateForm("organization", v)}
              placeholder="e.g. Google, HackerEarth" />
            <Input label="Year" value={form.year} onChange={v => updateForm("year", v)}
              placeholder="e.g. 2024 or 2022–2023" />
            <Textarea label="Description" value={form.description} onChange={v => updateForm("description", v)}
              placeholder="Describe what you did and what you achieved..." rows={3} />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ ...EMPTY_OTHER }); }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={saveEntry} disabled={!form.title.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-all">
                Add Experience
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2.5 border border-dashed border-teal-300 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
            <Plus size={14} /> Add Other Experience
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};