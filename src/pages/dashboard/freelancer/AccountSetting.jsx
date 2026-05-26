import React, { useState, useEffect, useCallback } from "react";
import { Edit2, ShieldAlert } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = `${apiUrl}/api/freelancer/settings`; // change to your full URL if needed e.g. http://localhost:5000/api/account
const getToken = () => localStorage.getItem("token"); // adjust to wherever you store JWT

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
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATIONS = {
  jobRecommendations: true,
  applicationUpdates: true,
  interviewReminders: true,
  paymentReceived: true,
  withdrawalStatus: true,
  invoiceGenerated: false,
  messageReceived: true,
  unreadReminders: false,
  newDeviceLogin: true,
  passwordChange: true,
};

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("Contact info");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // ── Core user data (source of truth from server) ──────────────────────────
  const [userData, setUserData] = useState({
    name: "", email: "", phone: "",
    category: "",
    subCategories: [""],
    experienceLevel: "Entry level",
    visibility: "Public",
    isEarningsPrivate: true,
    upi_id: "",
    balance: "0",
    notifications: DEFAULT_NOTIFICATIONS,
  });

  // ── Local draft (what user is editing right now) ───────────────────────────
  const [draft, setDraft] = useState({});

  // ── Inline field editing (Contact info) ───────────────────────────────────
  const [editingField, setEditingField] = useState(null);

  // ── Delete modal ───────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep]           = useState("confirm");
  const [otp, setOtp]                         = useState("");
  const [otpSending, setOtpSending]           = useState(false);

  // ── Withdrawal history (fetched separately or from profile) ───────────────
  const [withdrawalHistory] = useState([
    { id: 1, amount: 1500, date: "Jun 14, 2026", status: "Pending" },
    { id: 2, amount: 2300, date: "Mar 12, 2026", status: "Success" },
  ]);

  // ─── Flash helpers ─────────────────────────────────────────────────────────
  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }
    else                    { setError(msg);   setTimeout(() => setError(""), 4000); }
  };

  // ─── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api("/me");
        console.log("Fetched profile data:", data);
        const merged = {
          name: data.fullName || "",
          email: data.email || "",
          phone: data.mobile || "",
          category: data.category || "",
          subCategories: data.subCategories || [],
          experienceLevel: data.experienceLevel || "Entry level",
          visibility: data.visibility || "Public",
          isEarningsPrivate: data.isEarningsPrivate ?? true,
          upi_id: data.upi_id || "", 
          balance: data.currentBalance || "0",
          notifications: { ...DEFAULT_NOTIFICATIONS, ...(data.notifications || {}) },
          lastSignIn: data.lastSignIn || new Date().toISOString(),
        };
        setUserData(merged);
        setDraft(merged);
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

  // ─── Save handlers per tab ─────────────────────────────────────────────────
  const handleSaveContact = async () => {
    try {
      setSaving(true);
      const { data } = await api("/contact", "PATCH", {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
      });
      const merged = { ...userData, name: `${data.firstName} ${data.lastName}`.trim(), email: data.email, phone: data.phone };
      setUserData(merged);
      setDraft(merged);
      setEditingField(null);
      flash("success", "Contact info saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await api("/profile", "PATCH", {
        category: draft.category,
        subCategories: draft.subCategories,
        experienceLevel: draft.experienceLevel,
        visibility: draft.visibility,
        isEarningsPrivate: draft.isEarningsPrivate,
      });
      setUserData({ ...userData, ...draft });
      flash("success", "Profile settings saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUPI = async () => {
    try {
      setSaving(true);
      await api("/upi", "PATCH", { upi_id: draft.upi_id });
      setUserData({ ...userData, upi_id: draft.upi_id });
      setEditingField(null);
      flash("success", "UPI ID updated!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await api("/notifications", "PATCH", { notifications: draft.notifications });
      setUserData({ ...userData, notifications: draft.notifications });
      flash("success", "Notification settings saved!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(userData);
    setEditingField(null);
  };

  // ─── Delete account flow ───────────────────────────────────────────────────
  const handleSendOTP = async () => {
    try {
      setOtpSending(true);
      await api("/send-otp", "POST");
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
      window.location.href = "/logout";
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── UI helpers ────────────────────────────────────────────────────────────
  const menuItems = ["Contact info", "Profile settings", "Password & security", "Withdrawals", "Notification settings"];

  const SaveCancelBar = ({ onSave }) => (
    <div className="flex gap-4 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-teal-700 transition disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button onClick={handleCancel} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
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
          setDraft((d) => ({ ...d, notifications: { ...d.notifications, [field]: !d.notifications[field] } }))
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
    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile…</div>;

    const blurClass = showDeleteModal ? "blur-sm pointer-events-none transition-all" : "";

    switch (activeTab) {

      // ── CONTACT INFO ────────────────────────────────────────────────────────
      case "Contact info":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Contact Info</h2>

            {/* Name */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Name</p>
                {editingField === "name" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">{userData.name || "—"}</p>
                )}
              </div>
              {editingField !== "name" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("name")} />
              )}
            </div>

            {/* Email */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Email</p>
                {editingField === "email" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">
                    {userData.email}{" "}
                    <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Primary</span>
                  </p>
                )}
              </div>
              {editingField !== "email" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("email")} />
              )}
            </div>

            {/* Phone */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Phone</p>
                {editingField === "phone" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">
                    {userData.phone || "—"}{" "}
                    {userData.phone && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Verified</span>}
                  </p>
                )}
              </div>
              {editingField !== "phone" && (
                <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField("phone")} />
              )}
            </div>

            {editingField && <SaveCancelBar onSave={handleSaveContact} />}

            {/* Account closure */}
            <div className="pt-6 border-t">
              <h3 className="text-red-500 font-semibold mb-2">Account closure</h3>
              <p className="text-sm text-gray-500 mb-4">Closing your account is permanent. Please ensure all funds are withdrawn first.</p>
              <button onClick={() => { setShowDeleteModal(true); setDeleteStep("confirm"); }} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Close my account
              </button>
            </div>
          </div>
        );

      // ── PROFILE SETTINGS ────────────────────────────────────────────────────
      case "Profile settings":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold mb-6">Profile settings</h2>

            {/* Category */}
            <div className="p-6 border rounded-xl bg-white relative">
              <p className="text-sm font-bold text-gray-900 mb-1">Category</p>
              <p className="font-semibold text-gray-900 mb-3">{draft.category}</p>
              <div className="flex gap-2 flex-wrap">
                {draft.subCategories.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="p-6 border rounded-xl bg-white">
              <p className="text-sm font-bold text-gray-900 mb-4">Experience level</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "Entry level",   desc: "I am relatively new in this field." },
                  { id: "Intermediate",  desc: "I have substantial experience in this field." },
                  { id: "Expert",        desc: "I have comprehensive and deep expertise in this field." },
                ].map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setDraft({ ...draft, experienceLevel: level.id })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${draft.experienceLevel === level.id ? "border-black" : "border-gray-100"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm">{level.id}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${draft.experienceLevel === level.id ? "border-black" : "border-gray-300"}`}>
                        {draft.experienceLevel === level.id && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{level.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visibility & Privacy */}
            <div className="p-6 border rounded-xl bg-white space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">Visibility</label>
                <select
                  className="w-full p-3 border rounded-lg text-sm bg-gray-50 outline-none"
                  value={draft.visibility}
                  onChange={(e) => setDraft({ ...draft, visibility: e.target.value })}
                >
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900">Earnings privacy</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Make your earnings private?</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${!draft.isEarningsPrivate ? "text-black" : "text-gray-300"}`}>Public</span>
                    <button
                      onClick={() => setDraft({ ...draft, isEarningsPrivate: !draft.isEarningsPrivate })}
                      className="relative w-10 h-5 bg-teal-500 rounded-full p-1 transition-colors"
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${draft.isEarningsPrivate ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className={`font-medium ${draft.isEarningsPrivate ? "text-black" : "text-gray-300"}`}>Private</span>
                  </div>
                </div>
              </div>
            </div>

            <SaveCancelBar onSave={handleSaveProfile} />
          </div>
        );

      // ── PASSWORD & SECURITY ─────────────────────────────────────────────────
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
                <button onClick={() => alert("Redirecting to change password…")} className="text-teal-600 font-bold hover:underline">
                  Change password
                </button>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Last sign-in</span>
                <span className="text-gray-900 font-medium">{new Date(userData.lastSignIn).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => { if (window.confirm("Log out from all other devices?")) alert("Logged out from all devices"); }}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-colors"
              >
                Log out from all devices
              </button>
            </div>
          </div>
        );

      // ── WITHDRAWALS ─────────────────────────────────────────────────────────
      case "Withdrawals":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-2xl font-bold mb-6">Withdrawals</h2>

            {/* UPI */}
            <div className="p-6 border rounded-xl bg-white flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Withdrawal method</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">UPI ID:</span>
                  {editingField === "upi" ? (
                    <input
                      className="font-medium border-b border-teal-500 outline-none"
                      value={draft.upi_id}
                      onChange={(e) => setDraft({ ...draft, upi_id: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold">{userData.upi_id || "Not set"}</span>
                  )}
                </div>
              </div>
              {editingField === "upi" ? (
                <button onClick={handleSaveUPI} disabled={saving} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
                  {saving ? "Saving…" : "Save UPI"}
                </button>
              ) : (
                <button onClick={() => setEditingField("upi")} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Edit UPI ID
                </button>
              )}
            </div>

            {/* Balance */}
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Withdrawable balance</p>
                  <p className="text-3xl font-bold text-teal-600">₹ {userData.balance}</p>
                </div>
                <button className="bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-800 transition">
                  Withdraw money
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
                <span className="text-amber-600">⚠️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Note: The final amount credited may vary after applicable tax deductions as per government regulations.
                </p>
              </div>
            </div>

            {/* History */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Withdrawal History</h3>
              {withdrawalHistory.map((item) => (
                <div key={item.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-gray-900">Amount: ₹{item.amount}</p>
                    <p className="text-xs text-gray-500 font-medium">Requested on: {item.date}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${item.status === "Pending" ? "bg-orange-100 text-orange-600" : "bg-teal-100 text-teal-600"}`}>
                    {item.status === "Pending" ? "🕒 Pending" : "✅ Success"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      // ── NOTIFICATION SETTINGS ───────────────────────────────────────────────
      case "Notification settings":
        return (
          <div className={`pb-20 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification settings</h2>

            <Section title="Work Notifications">
              <ToggleRow title="New job recommendations"       description="Get notified when new jobs match your skills"                   field="jobRecommendations" />
              <ToggleRow title="Application status updates"    description="Know when a client views, shortlists, or rejects your application" field="applicationUpdates" />
              <ToggleRow title="Interview & meeting reminders" description="Receive reminders before a scheduled interview or meeting"        field="interviewReminders" />
            </Section>

            <Section title="Earnings & Payments">
              <ToggleRow title="Payment received"         description="Get notified when a client releases payment"                     field="paymentReceived" />
              <ToggleRow title="Withdrawal status update" description="Stay updated when your withdrawal is processed"                   field="withdrawalStatus" />
              <ToggleRow title="Invoice generated"        description="Get notified when an invoice is automatically created"            field="invoiceGenerated" />
            </Section>

            <Section title="Messages">
              <ToggleRow title="New message received"    description="Get notified when a client sends you a message"                   field="messageReceived" />
              <ToggleRow title="Unread message reminder" description="Reminder if you have unread messages older than 24 hours"          field="unreadReminders" />
            </Section>

            <Section title="Account & Security">
              <ToggleRow title="New device login alert"  description="Get alerted whenever your account is accessed from a new device"  field="newDeviceLogin" />
              <ToggleRow title="Password change alert"   description="Be notified immediately when your password is changed"             field="passwordChange" />
            </Section>

            <div className="flex gap-4 mt-8">
              <button onClick={handleSaveNotifications} disabled={saving} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-teal-700 transition disabled:opacity-60">
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
          {["Contact info", "Profile settings", "Password & security", "Withdrawals", "Notification settings"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-grow max-w-2xl">
        {/* Flash messages */}
        {success && <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-sm font-medium">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
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
                <p className="text-gray-500 text-sm mt-2 mb-6">This will permanently delete your account and all associated data.</p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium">Cancel</button>
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
                <p className="text-gray-500 text-sm mt-1 mb-6">A verification code was sent to your email.</p>
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