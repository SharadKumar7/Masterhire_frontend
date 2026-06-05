import React, { useState, useEffect } from "react";
import { Edit2, ShieldAlert, X } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = `${apiUrl}/api/freelancer/settings`;
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

// ─── DEFAULT NOTIFICATIONS ────────────────────────────────────────────────────
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

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose, onSave, saving }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (!form.newPassword) e.newPassword = "Required";
    else if (form.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const Field = ({ label, field, showKey }) => (
    <div>
      <p className="text-sm text-gray-500 mb-1 font-medium">{label}</p>
      <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-teal-500 transition">
        <input
          type={showPass[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: "" }); }}
          className="flex-1 px-4 py-2.5 outline-none text-sm"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button type="button"
          onClick={() => setShowPass({ ...showPass, [showKey]: !showPass[showKey] })}
          className="px-3 text-gray-400 hover:text-gray-600 text-xs">
          {showPass[showKey] ? "Hide" : "Show"}
        </button>
      </div>
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Change Password</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Current Password" field="currentPassword" showKey="current" />
          <Field label="New Password" field="newPassword" showKey="new" />
          <Field label="Confirm New Password" field="confirmPassword" showKey="confirm" />

          {form.newPassword && (
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                  form.newPassword.length > i * 3
                    ? form.newPassword.length >= 12 ? "bg-teal-500"
                      : form.newPassword.length >= 8 ? "bg-yellow-400" : "bg-red-400"
                    : "bg-gray-200"
                }`} />
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => { if (validate()) onSave(form.currentPassword, form.newPassword); }}
              disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition disabled:opacity-60">
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Withdraw Modal ───────────────────────────────────────────────────────────
const WithdrawModal = ({ balance, onClose, onConfirm, saving }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) { setError("Enter a valid amount"); return; }
    if (num < 100) { setError("Minimum withdrawal is ₹100"); return; }
    if (num > Number(balance)) { setError("Amount exceeds available balance"); return; }
    onConfirm(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Withdraw Money</h3>
          <button onClick={onClose}><X size={20} className="text-white/80" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-teal-50 rounded-xl p-4 flex justify-between">
            <span className="text-sm text-teal-700">Available Balance</span>
            <span className="font-bold text-teal-700">₹{Number(balance).toLocaleString("en-IN")}</span>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2 font-medium">Enter amount to withdraw</p>
            <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-teal-500 transition">
              <span className="px-4 text-lg font-bold text-gray-400 border-r py-3">₹</span>
              <input
                type="number" min="100" max={balance}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="Enter amount"
                className="flex-1 px-4 py-3 text-lg font-semibold outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-xs text-gray-400 mt-1">Minimum: ₹100 • Will be sent to your UPI ID</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            ⚠️ Final amount may vary after applicable tax deductions.
          </div>

          {/*
            TODO: Payment Gateway / Payout Integration
            When Razorpay Payouts / manual payout is added:
            1. Call POST /api/freelancer/settings/create-withdrawal { amount }
            2. Backend verifies balance, deducts, creates payout via Razorpay Payouts API
            3. Store withdrawal record in DB
            Replace onConfirm(num) below with that flow.
          */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium text-sm text-gray-600">Cancel</button>
            <button onClick={handleConfirm} disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition disabled:opacity-60">
              {saving ? "Processing…" : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FreelancerAccountSettings = () => {
  const [activeTab, setActiveTab] = useState("Contact info");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const [userData, setUserData] = useState({
    name: "", email: "", phone: "",
    category: "", subCategories: [],
    experienceLevel: "Entry level",
    visibility: "Public",
    isEarningsPrivate: true,
    upi_id: "", balance: 0,
    notifications: DEFAULT_NOTIFICATIONS,
    lastSignIn: new Date().toISOString(),
  });

  const [draft, setDraft]               = useState({});
  const [editingField, setEditingField] = useState(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [deleteStep, setDeleteStep]               = useState("confirm");
  const [otp, setOtp]                             = useState("");
  const [otpSending, setOtpSending]               = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // FIX: replaces alert()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // FIX: replaces nothing

  // FIX: withdrawal history from API, not hardcoded
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // ─── Flash helpers ──────────────────────────────────────────────────────────
  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }
    else { setError(msg); setTimeout(() => setError(""), 4000); }
  };

  // ─── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api("/me");
        const merged = {
          name:              data.fullName || "",
          email:             data.email || "",
          phone:             data.mobile || "",
          category:          data.category || "",
          subCategories:     data.subCategories || [],
          experienceLevel:   data.experienceLevel || "Entry level",
          visibility:        data.visibility || "Public",
          isEarningsPrivate: data.isEarningsPrivate ?? true,
          upi_id:            data.upi_id || "",
          balance:           data.currentBalance ?? 0,
          notifications:     { ...DEFAULT_NOTIFICATIONS, ...(data.notifications || {}) },
          lastSignIn:        data.lastSignIn || new Date().toISOString(),
        };
        setUserData(merged);
        setDraft(merged);
        // FIX: withdrawal history from API
        setWithdrawalHistory(data.withdrawalHistory || []);
      } catch (e) {
        flash("error", "Failed to load profile: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setDraft(userData);
    setEditingField(null);
    setError("");
    setSuccess("");
  }, [activeTab]); // eslint-disable-line

  // ─── Save handlers ──────────────────────────────────────────────────────────
  const handleSaveContact = async () => {
    try {
      setSaving(true);
      const { data } = await api("/contact", "PATCH", {
        name: draft.name, email: draft.email, phone: draft.phone,
      });
      const merged = {
        ...userData,
        name:  `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
      };
      setUserData(merged); setDraft(merged); setEditingField(null);
      flash("success", "Contact info saved!");
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await api("/profile", "PATCH", {
        category:          draft.category,
        subCategories:     draft.subCategories,
        experienceLevel:   draft.experienceLevel,
        visibility:        draft.visibility,
        isEarningsPrivate: draft.isEarningsPrivate,
      });
      setUserData({ ...userData, ...draft });
      flash("success", "Profile settings saved!");
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  const handleSaveUPI = async () => {
    try {
      setSaving(true);
      await api("/upi", "PATCH", { upi_id: draft.upi_id });
      setUserData({ ...userData, upi_id: draft.upi_id });
      setEditingField(null);
      flash("success", "UPI ID updated!");
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await api("/notifications", "PATCH", { notifications: draft.notifications });
      setUserData({ ...userData, notifications: draft.notifications });
      flash("success", "Notification settings saved!");
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  // FIX: proper password change via modal
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      await api("/change-password", "PATCH", { currentPassword, newPassword });
      setShowPasswordModal(false);
      flash("success", "Password changed successfully!");
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  // FIX: proper logout all devices API call
  const handleLogoutAllDevices = async () => {
    if (!window.confirm("Log out from all other devices?")) return;
    try {
      await api("/logout-all", "POST");
      flash("success", "Logged out from all devices!");
    } catch (e) { flash("error", e.message); }
  };

  // FIX: withdraw via modal
  const handleWithdraw = async (amount) => {
    try {
      setSaving(true);
      /*
        TODO: Payout Integration
        Replace this with Razorpay Payouts flow:
        const { data } = await api("/create-withdrawal", "POST", { amount });
        Then update balance & history from response.
      */
      const { data } = await api("/withdraw", "POST", { amount });
      const updated = { ...userData, balance: data.balance };
      setUserData(updated); setDraft(updated);
      setWithdrawalHistory(data.withdrawalHistory || withdrawalHistory);
      setShowWithdrawModal(false);
      flash("success", `₹${amount.toLocaleString("en-IN")} withdrawal requested!`);
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  // ─── Delete flow ────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    try {
      setOtpSending(true);
      await api("/send-otp", "POST");
      setDeleteStep("otp");
    } catch (e) { flash("error", "Failed to send OTP: " + e.message); }
    finally { setOtpSending(false); }
  };

  const handleFinalDelete = async () => {
    try {
      setSaving(true);
      await api("/delete", "DELETE", { otp });
      alert("Account deleted. Goodbye!");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (e) { flash("error", e.message); }
    finally { setSaving(false); }
  };

  const handleCancel = () => { setDraft(userData); setEditingField(null); };

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const SaveCancelBar = ({ onSave }) => (
    <div className="flex gap-4 pt-2">
      <button onClick={onSave} disabled={saving}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-teal-700 transition disabled:opacity-60">
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button onClick={handleCancel}
        className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
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
        onClick={() => setDraft((d) => ({ ...d, notifications: { ...d.notifications, [field]: !d.notifications[field] } }))}
        className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors ${draft.notifications?.[field] ? "bg-teal-500" : "bg-gray-200"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${draft.notifications?.[field] ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="p-6 border rounded-xl bg-white shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  // ─── Tab renderers ───────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile…</div>;
    const blurClass = showDeleteModal ? "blur-sm pointer-events-none transition-all" : "";

    switch (activeTab) {

      // ── CONTACT INFO ─────────────────────────────────────────────────────────
      case "Contact info":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Contact Info</h2>

            {["name", "email", "phone"].map((field) => (
              <div key={field} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 capitalize">{field === "name" ? "Name" : field === "email" ? "Email" : "Phone"}</p>
                  {editingField === field ? (
                    <input
                      className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                      value={draft[field] || ""}
                      onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium">
                      {userData[field] || "—"}
                      {field === "email" && userData.email && (
                        <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Primary</span>
                      )}
                      {field === "phone" && userData.phone && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Verified</span>
                      )}
                    </p>
                  )}
                </div>
                {editingField !== field && (
                  <Edit2 size={18} className="text-gray-400 cursor-pointer" onClick={() => setEditingField(field)} />
                )}
              </div>
            ))}

            {editingField && <SaveCancelBar onSave={handleSaveContact} />}

            <div className="pt-6 border-t">
              <h3 className="text-red-500 font-semibold mb-2">Account closure</h3>
              <p className="text-sm text-gray-500 mb-4">Closing your account is permanent. Please ensure all funds are withdrawn first.</p>
              <button onClick={() => { setShowDeleteModal(true); setDeleteStep("confirm"); }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
                Close my account
              </button>
            </div>
          </div>
        );

      // ── PROFILE SETTINGS ─────────────────────────────────────────────────────
      case "Profile settings":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold mb-6">Profile settings</h2>

            <div className="p-6 border rounded-xl bg-white">
              <p className="text-sm font-bold text-gray-900 mb-1">Category</p>
              <p className="font-semibold text-gray-900 mb-3">{draft.category || "—"}</p>
              <div className="flex gap-2 flex-wrap">
                {(draft.subCategories || []).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-100">{tag}</span>
                ))}
              </div>
            </div>

            <div className="p-6 border rounded-xl bg-white">
              <p className="text-sm font-bold text-gray-900 mb-4">Experience level</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "Entry level",  desc: "I am relatively new in this field." },
                  { id: "Intermediate", desc: "I have substantial experience in this field." },
                  { id: "Expert",       desc: "I have comprehensive and deep expertise in this field." },
                ].map((level) => (
                  <div key={level.id} onClick={() => setDraft({ ...draft, experienceLevel: level.id })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${draft.experienceLevel === level.id ? "border-black" : "border-gray-100"}`}>
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

            <div className="p-6 border rounded-xl bg-white space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">Visibility</label>
                <select className="w-full p-3 border rounded-lg text-sm bg-gray-50 outline-none"
                  value={draft.visibility}
                  onChange={(e) => setDraft({ ...draft, visibility: e.target.value })}>
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
                    <button onClick={() => setDraft({ ...draft, isEarningsPrivate: !draft.isEarningsPrivate })}
                      className="relative w-10 h-5 bg-teal-500 rounded-full p-1 transition-colors">
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

      // ── PASSWORD & SECURITY ──────────────────────────────────────────────────
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
                {/* FIX: proper modal instead of alert() */}
                <button onClick={() => setShowPasswordModal(true)} className="text-teal-600 font-bold hover:underline">
                  Change password
                </button>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Last sign-in</span>
                <span className="text-gray-900 font-medium">{new Date(userData.lastSignIn).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              {/* FIX: actual API call instead of alert() */}
              <button onClick={handleLogoutAllDevices}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-colors">
                Log out from all devices
              </button>
            </div>

            {showPasswordModal && (
              <ChangePasswordModal
                onClose={() => setShowPasswordModal(false)}
                onSave={handleChangePassword}
                saving={saving}
              />
            )}
          </div>
        );

      // ── WITHDRAWALS ──────────────────────────────────────────────────────────
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
                    <input className="font-medium border-b border-teal-500 outline-none"
                      value={draft.upi_id}
                      onChange={(e) => setDraft({ ...draft, upi_id: e.target.value })}
                      autoFocus />
                  ) : (
                    <span className="font-bold">{userData.upi_id || "Not set"}</span>
                  )}
                </div>
              </div>
              {editingField === "upi" ? (
                <button onClick={handleSaveUPI} disabled={saving}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
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
                  <p className="text-3xl font-bold text-teal-600">₹ {Number(userData.balance).toLocaleString("en-IN")}</p>
                </div>
                {/* FIX: opens proper modal */}
                <button onClick={() => setShowWithdrawModal(true)}
                  className="bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-800 transition">
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

            {/* FIX: withdrawal history from API */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Withdrawal History</h3>
              {withdrawalHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No withdrawals yet.</p>
              ) : (
                withdrawalHistory.map((item) => (
                  <div key={item._id || item.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-gray-900">Amount: ₹{Number(item.amount).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Requested on: {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                      item.status === "Pending" ? "bg-orange-100 text-orange-600" : "bg-teal-100 text-teal-600"
                    }`}>
                      {item.status === "Pending" ? "🕒 Pending" : "✅ Success"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // ── NOTIFICATION SETTINGS ────────────────────────────────────────────────
      case "Notification settings":
        return (
          <div className={`pb-20 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification settings</h2>
            <Section title="Work Notifications">
              <ToggleRow title="New job recommendations"       description="Get notified when new jobs match your skills"                    field="jobRecommendations" />
              <ToggleRow title="Application status updates"    description="Know when a client views, shortlists, or rejects your application" field="applicationUpdates" />
              <ToggleRow title="Interview & meeting reminders" description="Receive reminders before a scheduled interview or meeting"         field="interviewReminders" />
            </Section>
            <Section title="Earnings & Payments">
              <ToggleRow title="Payment received"         description="Get notified when a client releases payment"          field="paymentReceived" />
              <ToggleRow title="Withdrawal status update" description="Stay updated when your withdrawal is processed"        field="withdrawalStatus" />
              <ToggleRow title="Invoice generated"        description="Get notified when an invoice is automatically created" field="invoiceGenerated" />
            </Section>
            <Section title="Messages">
              <ToggleRow title="New message received"    description="Get notified when a client sends you a message"               field="messageReceived" />
              <ToggleRow title="Unread message reminder" description="Reminder if you have unread messages older than 24 hours"     field="unreadReminders" />
            </Section>
            <Section title="Account & Security">
              <ToggleRow title="New device login alert" description="Get alerted whenever your account is accessed from a new device" field="newDeviceLogin" />
              <ToggleRow title="Password change alert"  description="Be notified immediately when your password is changed"          field="passwordChange" />
            </Section>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSaveNotifications} disabled={saving}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-teal-700 transition disabled:opacity-60">
                {saving ? "Saving…" : "Save All Changes"}
              </button>
              <button onClick={handleCancel} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold">Discard</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Root render ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-6xl mx-auto p-8 flex gap-12 min-h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <nav className="space-y-1">
          {["Contact info", "Profile settings", "Password & security", "Withdrawals", "Notification settings"].map((item) => (
            <button key={item} onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}>
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-grow max-w-2xl">
        {success && <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-sm font-medium">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
        {renderContent()}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          balance={userData.balance}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={handleWithdraw}
          saving={saving}
        />
      )}

      {/* Delete Modal */}
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
                  <button onClick={handleSendOTP} disabled={otpSending}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium disabled:opacity-60">
                    {otpSending ? "Sending OTP…" : "Yes, Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-bold">Enter OTP</h3>
                <p className="text-gray-500 text-sm mt-1 mb-6">A verification code was sent to your email.</p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <input type="text" placeholder="000000"
                  className="w-full border-2 border-teal-500 rounded-xl p-3 text-center text-xl font-bold tracking-widest outline-none mb-4"
                  value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button onClick={handleFinalDelete} disabled={saving}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-60">
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

export default FreelancerAccountSettings;