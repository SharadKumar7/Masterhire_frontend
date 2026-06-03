import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Star } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

const API_BASE = `${apiUrl}/api`;

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ message = "No data available." }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Star size={16} className="text-gray-300" />
    </div>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
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
            {t === "completed"
              ? `Completed jobs (${completed.length})`
              : `In progress (${inProgress.length})`}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          message={
            tab === "completed"
              ? "No completed jobs yet."
              : "No jobs currently in progress."
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((job, i) => (
            <div
              key={i}
              className="p-3 border border-gray-100 rounded-lg text-sm"
            >
              <p className="font-semibold text-gray-800">
                {job.title || "Untitled job"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {job.date || "Date not provided"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const FreelancerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) {
      setError("No profile ID provided in URL.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // 1. Fetch profile
        const res = await fetch(`${API_BASE}/profile/${id}`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
        const data = await res.json();
        setProfile(data);
        console.log("Fetched profile data:", data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-2">
        <p className="text-gray-700 font-medium text-sm">
          Could not load profile
        </p>
        <p className="text-gray-400 text-xs">{error}</p>
      </div>
    );
  }

  // ── No profile returned ────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-400 text-sm">No profile data available.</p>
      </div>
    );
  }

  // ── Safe accessors ─────────────────────────────────────────────────────────
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const workExperience = Array.isArray(profile.experiences)
    ? profile.experiences
    : [];
  const certifications = Array.isArray(profile.certifications)
    ? profile.certifications
    : [];
  const otherExperiences = Array.isArray(profile.otherExperiences)
    ? profile.otherExperiences
    : [];
  const completed = Array.isArray(profile.workHistory?.completed)
    ? profile.workHistory.completed
    : [];
  const inProgress = Array.isArray(profile.workHistory?.inProgress)
    ? profile.workHistory.inProgress
    : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 p-6 space-y-6">
        {/* ── TOP CARD ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-100">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={`${(profile.firstName ?? "") + " " + (profile.lastName ?? "") || "User"} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-teal-600 bg-teal-50">
                    {profile.firstName + " " + profile.lastName
                      ? profile.firstName.slice(0, 2).toUpperCase()
                      : "?"}
                  </div>
                )}
              </div>
            </div>

            {/* Title + Bio */}
            <div className="flex-1 min-w-0">
              {profile.title ? (
                <p className="text-lg font-bold text-gray-900 leading-snug">
                  {profile.title}
                </p>
              ) : (
                <p className="text-lg text-gray-400 italic">No title added.</p>
              )}
              {profile.bio ? (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-2 italic">
                  No bio added.
                </p>
              )}
            </div>
          </div>

          {/* Name + Location + Stats */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-gray-900">
                  {profile.firstName + " " + profile.lastName ||
                    "Name not provided"}
                </span>
                {profile.verified && (
                  <CheckCircle2
                    size={16}
                    className="text-teal-500 flex-shrink-0"
                  />
                )}
              </div>
              {profile.address?.city || profile.address?.state ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {profile.address?.city}, {profile.address?.state}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5 italic">
                  Location not provided
                </p>
              )}
            </div>

            <div className="flex gap-8">
              {[
                { label: "Total jobs", value: profile.totalJobs ?? "0" },
                {
                  label: "Total earnings",
                  value: profile.totalEarnings ?? "0",
                },
                { label: "Job success", value: profile.jobSuccess ?? "0%" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LANGUAGES + EDUCATION  |  SKILLS + WORK HISTORY ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Languages
            </h2>
            {languages.length === 0 ? (
              <EmptyState message="No languages added." />
            ) : (
              <div className="space-y-2">
                {languages.map((l, i) => (
                  <div key={i} className="text-sm flex justify-between">
                    <span className="font-semibold text-gray-800">
                      {l.language || "........."}
                    </span>
                    <span className="text-gray-500">
                      {l.proficiency || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Education
              </h2>
              {education.length === 0 ? (
                <EmptyState message="No education added." />
              ) : (
                <div className="space-y-3">
                  {education.map((e, i) => (
                    <div
                      key={i}
                      className="text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="font-bold text-gray-800">
                        {e.institution || "Institution not provided"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Degree: {e.degree || "Degree not provided"}
                      </p>
                      {e.fieldOfStudy && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          Field of Study: {e.fieldOfStudy}{" "}
                        </p>
                      )}
                      {e.passingYear && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          Passing Year: {e.passingYear}{" "}
                        </p>
                      )}

                      {e.description && (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                          {e.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-5">
            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">Skills</h2>
              {skills.length === 0 ? (
                <EmptyState message="No skills added." />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Work History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Work history
              </h2>
              <WorkHistoryTabs completed={completed} inProgress={inProgress} />
            </div>
          </div>
        </div>

        {/* ── WORK EXPERIENCE ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Work experience
          </h2>
          {workExperience.length === 0 ? (
            <EmptyState message="No work experience added." />
          ) : (
            <div className="space-y-5">
              {workExperience.map((exp, i) => (
                <div
                  key={i}
                  className="pb-5 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">
                      {exp.title || "Title not provided"}
                    </span>
                    {exp.company && (
                      <>
                        <span className="text-gray-400 text-sm">|</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {exp.company}
                        </span>
                      </>
                    )}
                  </div>
                  {exp.startDate && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(exp.startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" - "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Present"}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CERTIFICATIONS ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Certifications
          </h2>
          {certifications.length === 0 ? (
            <EmptyState message="No certifications added." />
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, i) => (
                <div
                  key={i}
                  className="pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <p className="font-bold text-gray-900 text-sm">
                    {cert.name || "Certification name not provided"}
                  </p>
                  {cert.issuer && (
                    <p className="text-gray-500 text-sm mt-0.5">
                      {cert.issuer}
                    </p>
                  )}
                  {cert.period && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {cert.period}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── OTHER EXPERIENCES ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Other experiences
          </h2>
          {otherExperiences.length === 0 ? (
            <EmptyState message="No other experiences added." />
          ) : (
            <div className="space-y-3">
              {otherExperiences.map((exp, i) => (
                <div key={i} className="text-sm">
                  <p className="font-bold text-gray-800">
                    {exp.title || "Title not provided"}
                  </p>
                  {exp.description && (
                    <p className="text-gray-500 mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
