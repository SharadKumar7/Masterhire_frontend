import React, { useState, useEffect } from "react";
import { Edit2, ShieldAlert } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = `${apiUrl}/api/client/settings`;
const getToken = () => localStorage.getItem("token");

const api = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATIONS = {
  proposalReceived: true,
  hiringUpdates: true,
  interviewReminders: true,
  messageReceived: true,
  paymentAlerts: true,
  marketingEmails: false,
};

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("Personal details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Core user data (source of truth from server) ──────────────────────────
  const [userData, setUserData] = useState({
    // Personal details
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    location: "",
    bio: "",
    profilePhoto: "",
    // Hiring preferences
    freelancerLevel: "",
    budgetRange: "",
    communicationPreference: "",
    autoInviteFreelancers: false,
    jobVisibility: "Public",
    // Billing
    walletBalance: 0,
    paymentMethod: "",
    upi_id: "",
    billingAddress: "",
    // Security
    lastSignIn: new Date().toISOString(),
    // Notifications
    notifications: DEFAULT_NOTIFICATIONS,
  });

  // ── Local draft (what user is editing right now) ───────────────────────────
  const [draft, setDraft] = useState({});

  // ── Inline field editing ───────────────────────────────────────────────────
  const [editingField, setEditingField] = useState(null);

  // ── Delete modal ───────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState("confirm");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  // ── Payment & Invoice history ──────────────────────────────────────────────
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // ─── Flash helpers ─────────────────────────────────────────────────────────
  const flash = (type, msg) => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  // ─── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api("/me");

        const merged = {
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          companyName: data.companyName || "",
          location: data.location || "",
          bio: data.bio || "",
          profilePhoto: data.profilePhoto || "",
          // Hiring preferences
          freelancerLevel: data.freelancerLevel || "",
          budgetRange: data.budgetRange || "",
          communicationPreference: data.communicationPreference || "",
          autoInviteFreelancers: data.autoInviteFreelancers ?? false,
          jobVisibility: data.jobVisibility || "Public",
          // Billing
          walletBalance: data.walletBalance ?? 0,
          paymentMethod: data.paymentMethod || "",
          upi_id: data.upi_id || "",
          billingAddress: data.billingAddress || "",
          // Security
          lastSignIn: data.lastSignIn || new Date().toISOString(),
          // Notifications
          notifications: {
            ...DEFAULT_NOTIFICATIONS,
            ...(data.notifications || {}),
          },
        };

        setUserData(merged);
        setDraft(merged);
        setPaymentHistory(data.paymentHistory || []);
        setInvoices(data.invoices || []);
      } catch (e) {
        flash("error", "Failed to load profile: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset draft when tab changes
  useEffect(() => {
    setDraft(userData);
    setEditingField(null);
    setError("");
    setSuccess("");
  }, [activeTab]); // eslint-disable-line

  // ─── Save: Personal Details ────────────────────────────────────────────────
  const handleSavePersonal = async () => {
    try {
      setSaving(true);
      const { data } = await api("/personal", "PATCH", {
        fullName: draft.fullName,
        email: draft.email,
        phone: draft.phone,
        companyName: draft.companyName,
        location: draft.location,
        bio: draft.bio,
        profilePhoto: draft.profilePhoto,
      });
      const updated = {
        ...userData,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        location: data.location,
        bio: data.bio,
        profilePhoto: data.profilePhoto,
      };
      setUserData(updated);
      setDraft(updated);
      setEditingField(null);
      flash("success", "Personal details saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save: Hiring Preferences ──────────────────────────────────────────────
  const handleSaveHiringPrefs = async () => {
    try {
      setSaving(true);
      const { data } = await api("/hiring-preferences", "PATCH", {
        freelancerLevel: draft.freelancerLevel,
        budgetRange: draft.budgetRange,
        communicationPreference: draft.communicationPreference,
        autoInviteFreelancers: draft.autoInviteFreelancers,
        jobVisibility: draft.jobVisibility,
      });
      const updated = { ...userData, ...data };
      setUserData(updated);
      setDraft(updated);
      setEditingField(null);
      flash("success", "Hiring preferences saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save: UPI ─────────────────────────────────────────────────────────────
  const handleSaveUPI = async () => {
    try {
      setSaving(true);
      await api("/upi", "PATCH", { upi_id: draft.upi_id });
      const updated = { ...userData, upi_id: draft.upi_id };
      setUserData(updated);
      setDraft(updated);
      setEditingField(null);
      flash("success", "UPI ID updated!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save: Payment Method ──────────────────────────────────────────────────
  const handleSavePaymentMethod = async () => {
    try {
      setSaving(true);
      await api("/payment-method", "PATCH", { paymentMethod: draft.paymentMethod });
      const updated = { ...userData, paymentMethod: draft.paymentMethod };
      setUserData(updated);
      setDraft(updated);
      setEditingField(null);
      flash("success", "Payment method updated!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save: Billing Address ─────────────────────────────────────────────────
  const handleSaveBillingAddress = async () => {
    try {
      setSaving(true);
      await api("/billing-address", "PATCH", { billingAddress: draft.billingAddress });
      const updated = { ...userData, billingAddress: draft.billingAddress };
      setUserData(updated);
      setDraft(updated);
      setEditingField(null);
      flash("success", "Billing address updated!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save: Notifications ───────────────────────────────────────────────────
  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await api("/notifications", "PATCH", { notifications: draft.notifications });
      const updated = { ...userData, notifications: draft.notifications };
      setUserData(updated);
      setDraft(updated);
      flash("success", "Notification settings saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      await api("/change-password", "PATCH", { currentPassword, newPassword });
      flash("success", "Password changed successfully!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Logout all devices ────────────────────────────────────────────────────
  const handleLogoutAllDevices = async () => {
    if (!window.confirm("Log out from all other devices?")) return;
    try {
      await api("/logout-all", "POST");
      flash("success", "Logged out from all devices!");
    } catch (e) {
      flash("error", e.message);
    }
  };

  // ─── Delete account flow ───────────────────────────────────────────────────
  const handleSendOTP = async () => {
    try {
      setOtpSending(true);
      await api("/send-delete-otp", "POST");
      setDeleteStep("otp");
    } catch (e) {
      flash("error", "Failed to send OTP: " + e.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleFinalDelete = async () => {
    try {
      setSaving(true);
      await api("/delete", "DELETE", { otp });
      alert("Account deleted. Goodbye!");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Add Funds ─────────────────────────────────────────────────────────────
  const handleAddFunds = async () => {
    const amount = prompt("Enter amount to add (₹):");
    if (!amount || isNaN(amount)) return;
    try {
      const { data } = await api("/add-funds", "POST", { amount: Number(amount) });
      const updated = { ...userData, walletBalance: data.walletBalance };
      setUserData(updated);
      setDraft(updated);
      flash("success", `₹${amount} added to wallet!`);
    } catch (e) {
      flash("error", e.message);
    }
  };

  const handleCancel = () => {
    setDraft(userData);
    setEditingField(null);
  };

  // ─── UI helpers ────────────────────────────────────────────────────────────
  const SaveCancelBar = ({ onSave }) => (
    <div className="flex gap-4 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-teal-700 transition disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button
        onClick={handleCancel}
        className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
      >
        Cancel
      </button>
    </div>
  );

  const ToggleRow = ({ title, description, field }) => (
    <div className="flex justify-between items-start py-4 border-b border-gray-50 last:border-0">
      <div className="space-y-0.5">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-400 max-w-md">{description}</p>
      </div>
      <button
        onClick={() =>
          setDraft((d) => ({
            ...d,
            notifications: {
              ...d.notifications,
              [field]: !d.notifications[field],
            },
          }))
        }
        className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          draft.notifications?.[field] ? "bg-teal-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
            draft.notifications?.[field] ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="p-6 border rounded-xl bg-white shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  // ─── Tab renderers ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading)
      return (
        <div className="p-8 text-center text-gray-500">Loading profile…</div>
      );

    const blurClass = showDeleteModal
      ? "blur-sm pointer-events-none transition-all"
      : "";

    switch (activeTab) {

      // ── PERSONAL DETAILS ──────────────────────────────────────────────────
      case "Personal details":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Personal Details</h2>

            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div
                className="relative cursor-pointer group w-40 h-40"
                onClick={() => setEditingField("profilePhoto")}
              >
                <img
                  src={draft.profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData.fullName || "User")}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-gray-100 group-hover:border-teal-400 transition-all"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={16} className="text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Edit</span>
                </div>
              </div>

              <div className="flex-grow space-y-3">
                {/* Full Name */}
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">Name</p>
                    {editingField === "fullName" ? (
                      <input
                        className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                        value={draft.fullName || ""}
                        onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <p className="font-medium">{userData.fullName || "—"}</p>
                    )}
                  </div>
                  {editingField !== "fullName" && (
                    <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("fullName")} />
                  )}
                </div>

                {/* Email */}
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">Email</p>
                    {editingField === "email" ? (
                      <input
                        className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                        value={draft.email || ""}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">
                        {userData.email}
                        <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Primary</span>
                      </p>
                    )}
                  </div>
                  {editingField !== "email" && (
                    <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("email")} />
                  )}
                </div>
              </div>

              {/* Profile Photo URL input */}
              {editingField === "profilePhoto" && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white p-3 border rounded-lg shadow-lg z-10">
                  <p className="text-xs mb-1 font-medium">Paste Image URL:</p>
                  <input
                    type="text"
                    className="w-full border p-2 rounded text-sm outline-none focus:border-teal-500"
                    value={draft.profilePhoto || ""}
                    onChange={(e) => setDraft({ ...draft, profilePhoto: e.target.value })}
                    placeholder="https://..."
                    autoFocus
                    onBlur={() => setEditingField(null)}
                  />
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Company Name</p>
                {editingField === "companyName" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.companyName || ""}
                    onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{userData.companyName || "—"}</p>
                )}
              </div>
              {editingField !== "companyName" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("companyName")} />
              )}
            </div>

            {/* Phone */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Phone</p>
                {editingField === "phone" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.phone || ""}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">
                    {userData.phone || "—"}
                    {userData.phone && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Verified</span>
                    )}
                  </p>
                )}
              </div>
              {editingField !== "phone" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("phone")} />
              )}
            </div>

            {/* Location */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Location</p>
                {editingField === "location" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.location || ""}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{userData.location || "—"}</p>
                )}
              </div>
              {editingField !== "location" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("location")} />
              )}
            </div>

            {/* Bio */}
            <div className="flex justify-between items-start p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Bio</p>
                {editingField === "bio" ? (
                  <textarea
                    rows={4}
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1 resize-none"
                    value={draft.bio || ""}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  />
                ) : (
                  <p className="font-medium text-gray-700">{userData.bio || "—"}</p>
                )}
              </div>
              {editingField !== "bio" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer mt-1" onClick={() => setEditingField("bio")} />
              )}
            </div>

            {editingField && <SaveCancelBar onSave={handleSavePersonal} />}

            {/* Account Closure */}
            <div className="pt-6 border-t">
              <h3 className="text-red-500 font-semibold mb-2">Account closure</h3>
              <p className="text-sm text-gray-500 mb-4">
                Closing your account is permanent. Please ensure all payments and activities are completed first.
              </p>
              <button
                onClick={() => { setShowDeleteModal(true); setDeleteStep("confirm"); }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Close my account
              </button>
            </div>
          </div>
        );

      // ── HIRING PREFERENCES ───────────────────────────────────────────────
      case "Hiring Preferences":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Hiring Preferences</h2>

            {/* Preferred Freelancer Level */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Preferred Freelancer Level</p>
                {editingField === "freelancerLevel" ? (
                  <select
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1 bg-transparent"
                    value={draft.freelancerLevel || ""}
                    onChange={(e) => setDraft({ ...draft, freelancerLevel: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <p className="font-medium">{userData.freelancerLevel || "—"}</p>
                )}
              </div>
              {editingField !== "freelancerLevel" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("freelancerLevel")} />
              )}
            </div>

            {/* Preferred Budget Range */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Preferred Budget Range</p>
                {editingField === "budgetRange" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.budgetRange || ""}
                    onChange={(e) => setDraft({ ...draft, budgetRange: e.target.value })}
                    placeholder="e.g. ₹5,000 - ₹20,000"
                  />
                ) : (
                  <p className="font-medium">{userData.budgetRange || "—"}</p>
                )}
              </div>
              {editingField !== "budgetRange" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("budgetRange")} />
              )}
            </div>

            {/* Communication Preference */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Communication Preference</p>
                {editingField === "communicationPreference" ? (
                  <select
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1 bg-transparent"
                    value={draft.communicationPreference || ""}
                    onChange={(e) => setDraft({ ...draft, communicationPreference: e.target.value })}
                  >
                    <option value="">Select Preference</option>
                    <option value="Chat">Chat</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Email">Email</option>
                  </select>
                ) : (
                  <p className="font-medium">{userData.communicationPreference || "—"}</p>
                )}
              </div>
              {editingField !== "communicationPreference" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("communicationPreference")} />
              )}
            </div>

            {/* Auto Invite Freelancers */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Auto Invite Freelancers</p>
                <p className="font-medium">{draft.autoInviteFreelancers ? "Enabled" : "Disabled"}</p>
              </div>
              <button
                onClick={() => setDraft({ ...draft, autoInviteFreelancers: !draft.autoInviteFreelancers })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  draft.autoInviteFreelancers ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    draft.autoInviteFreelancers ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Job Visibility */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Job Visibility</p>
                {editingField === "jobVisibility" ? (
                  <select
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1 bg-transparent"
                    value={draft.jobVisibility || ""}
                    onChange={(e) => setDraft({ ...draft, jobVisibility: e.target.value })}
                  >
                    <option value="">Select Visibility</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                    <option value="Invite Only">Invite Only</option>
                  </select>
                ) : (
                  <p className="font-medium">{userData.jobVisibility || "—"}</p>
                )}
              </div>
              {editingField !== "jobVisibility" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("jobVisibility")} />
              )}
            </div>

            {/* Always show Save for Hiring Preferences (toggle can change without editingField) */}
            <SaveCancelBar onSave={handleSaveHiringPrefs} />
          </div>
        );

      // ── PASSWORD & SECURITY ──────────────────────────────────────────────
      case "Password & security":
        return (
          <div className={`space-y-8 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Password & security</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Sign-in email</span>
                <span className="text-gray-900 font-medium">{userData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Password</span>
                <button
                  onClick={() => {
                    const current = prompt("Enter current password:");
                    if (!current) return;
                    const newPass = prompt("Enter new password:");
                    if (!newPass) return;
                    handleChangePassword(current, newPass);
                  }}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Change password
                </button>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Last sign-in</span>
                <span className="text-gray-900 font-medium">
                  {new Date(userData.lastSignIn).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleLogoutAllDevices}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-colors"
              >
                Log out from all devices
              </button>
            </div>
          </div>
        );

      // ── BILLING & PAYMENTS ───────────────────────────────────────────────
      case "Billing & Payments":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-2xl font-bold mb-6">Billing & Payments</h2>

            {/* Wallet Balance */}
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-teal-600">₹ {userData.walletBalance ?? 0}</p>
                </div>
                <button
                  onClick={handleAddFunds}
                  className="bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-800 transition"
                >
                  Add Funds
                </button>
              </div>
            </div>

            {/* Saved Payment Method */}
            <div className="p-6 border rounded-xl bg-white flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Saved Payment Method</p>
                {editingField === "paymentMethod" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none"
                    value={draft.paymentMethod || ""}
                    onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })}
                    placeholder="e.g. Visa ending 4242"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">{userData.paymentMethod || "No payment method added"}</p>
                )}
              </div>
              {editingField === "paymentMethod" ? (
                <button onClick={handleSavePaymentMethod} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Save
                </button>
              ) : (
                <button onClick={() => setEditingField("paymentMethod")} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Edit
                </button>
              )}
            </div>

            {/* UPI ID */}
            <div className="p-6 border rounded-xl bg-white flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">UPI ID</p>
                {editingField === "upi" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none"
                    value={draft.upi_id || ""}
                    onChange={(e) => setDraft({ ...draft, upi_id: e.target.value })}
                    placeholder="yourname@upi"
                  />
                ) : (
                  <p className="font-medium">{userData.upi_id || "Not set"}</p>
                )}
              </div>
              {editingField === "upi" ? (
                <button onClick={handleSaveUPI} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Save UPI
                </button>
              ) : (
                <button onClick={() => setEditingField("upi")} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Edit UPI
                </button>
              )}
            </div>

            {/* Billing Address */}
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900 mb-2">Billing Address</p>
                  {editingField === "billingAddress" ? (
                    <textarea
                      rows={3}
                      className="w-full border-b border-teal-500 outline-none resize-none"
                      value={draft.billingAddress || ""}
                      onChange={(e) => setDraft({ ...draft, billingAddress: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-gray-700">{userData.billingAddress || "No billing address added"}</p>
                  )}
                </div>
                {editingField === "billingAddress" ? (
                  <button onClick={handleSaveBillingAddress} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold ml-4">
                    Save
                  </button>
                ) : (
                  <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("billingAddress")} />
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Payment History</h3>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No payment history yet.</p>
              ) : (
                paymentHistory.map((item) => (
                  <div key={item._id || item.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-gray-900">₹{item.amount}</p>
                      <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                      item.status === "Success" ? "bg-teal-100 text-teal-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Invoices */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Invoices</h3>
              {invoices.length === 0 ? (
                <p className="text-sm text-gray-400">No invoices yet.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice._id || invoice.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-gray-900">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => window.open(`${API_BASE}/invoices/${invoice._id}/download`, "_blank")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // ── NOTIFICATION SETTINGS ────────────────────────────────────────────
      case "Notification settings":
        return (
          <div className={`pb-20 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification settings</h2>

            <Section title="Hiring & Proposals">
              <ToggleRow title="Proposal received" description="Get notified when a freelancer submits a proposal to your job" field="proposalReceived" />
              <ToggleRow title="Hiring updates" description="Receive updates about shortlisted, hired, or declined freelancers" field="hiringUpdates" />
              <ToggleRow title="Interview reminders" description="Get reminders before scheduled interviews or meetings" field="interviewReminders" />
            </Section>

            <Section title="Messages">
              <ToggleRow title="Message received" description="Get notified when a freelancer sends you a message" field="messageReceived" />
            </Section>

            <Section title="Billing & Payments">
              <ToggleRow title="Payment alerts" description="Receive alerts for successful payments, failed transactions, and invoices" field="paymentAlerts" />
            </Section>

            <Section title="Marketing & Updates">
              <ToggleRow title="Marketing emails" description="Receive product updates, feature announcements, and promotional emails" field="marketingEmails" />
            </Section>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-teal-700 transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save All Changes"}
              </button>
              <button onClick={handleCancel} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold">
                Discard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Root render ───────────────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-6xl mx-auto p-8 flex gap-12 min-h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <nav className="space-y-1">
          {[
            "Personal details",
            "Hiring Preferences",
            "Password & security",
            "Billing & Payments",
            "Notification settings",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-grow max-w-2xl">
        {success && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        {renderContent()}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border">
            {deleteStep === "confirm" ? (
              <div className="text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="text-red-500" size={30} />
                </div>
                <h3 className="text-lg font-bold">Are you sure?</h3>
                <p className="text-gray-500 text-sm mt-2 mb-6">
                  This will permanently delete your account and all associated data.
                </p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-60"
                  >
                    {otpSending ? "Sending OTP…" : "Yes, Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-bold">Enter OTP</h3>
                <p className="text-gray-500 text-sm mt-1 mb-6">
                  A verification code was sent to your email.
                </p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <input
                  type="text"
                  placeholder="000000"
                  className="w-full border-2 border-teal-500 rounded-xl p-3 text-center text-xl font-bold tracking-widest outline-none mb-4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  onClick={handleFinalDelete}
                  disabled={saving}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-60"
                >
                  {saving ? "Deleting…" : "Confirm Delete & Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;