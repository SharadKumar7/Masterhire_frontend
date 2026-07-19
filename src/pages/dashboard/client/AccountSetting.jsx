import React, { useState, useEffect } from "react";
import { Edit2, ShieldAlert, Wallet, X, Plus } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID; // ✅ NEW
import { useRef } from "react";

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

// ✅ NEW — Payment API helper (uses our payment routes)
const paymentApi = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${apiUrl}/api/payment${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ✅ NEW — Load Razorpay script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// 🩹 FIX — paymentMethod can arrive from the backend as either a plain string
// ("Visa ending 4242") OR a structured object ({ type, last4, expiry }).
// Rendering an object directly inside <p>{...}</p> crashes React
// ("Objects are not valid as a React child"), which is what caused the blank
// page. This helper always returns a safe, human-readable string.
const formatPaymentMethod = (pm) => {
  if (!pm) return "";
  if (typeof pm === "string") return pm;
  if (typeof pm === "object") {
    const type = pm.type || "Card";
    const last4 = pm.last4 ? ` ending ${pm.last4}` : "";
    const expiry = pm.expiry ? ` (exp ${pm.expiry})` : "";
    return `${type}${last4}${expiry}`;
  }
  return String(pm);
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

// ─── Add Funds Modal — ✅ Razorpay integrated, same design ───────────────────
const AddFundsModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const presets = [500, 1000, 2000, 5000];

  const handleConfirm = async () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError("");

    // ✅ Step 1 — Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your internet.");
      setSubmitting(false);
      return;
    }

    try {
      // ✅ Step 2 — Create top-up order
      const data = await paymentApi("/topup/create-order", "POST", {
        amount: num,
      });

      // ✅ Step 3 — Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: data.amount, // paise
        currency: "INR",
        name: "FreelanceHub",
        description: "Wallet Top-up",
        order_id: data.orderId,
        handler: async (response) => {
          // ✅ Step 4 — Verify payment
          try {
            const verifyData = await paymentApi("/topup/verify", "POST", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: num,
            });
            setSubmitted(true);
            onSuccess(verifyData.newBalance);
            setTimeout(() => onClose(), 2000);
          } catch (e) {
            setError("Payment verification failed: " + e.message);
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#0d9488" },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled.");
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header — same design */}
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-white" />
            <h3 className="text-white font-bold text-lg">
              Add Funds to Wallet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!submitted ? (
            <>
              {/* Quick select — same design */}
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  Quick Select
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setAmount(String(p));
                        setError("");
                      }}
                      className={`py-2 rounded-lg text-sm font-semibold border transition ${
                        amount === String(p)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "border-gray-200 text-gray-700 hover:border-teal-400"
                      }`}
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount — same design */}
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  Or enter custom amount
                </p>
                <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-teal-500 transition">
                  <span className="px-4 text-lg font-bold text-gray-400 border-r py-3">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 text-lg font-semibold outline-none"
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                <p className="text-xs text-gray-400 mt-1">Minimum: ₹1</p>
              </div>

              {/* Summary — same design */}
              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <div className="bg-teal-50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm text-teal-700">Amount to add</span>
                  <span className="text-lg font-bold text-teal-700">
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* ✅ Button now opens Razorpay */}
              <button
                onClick={handleConfirm}
                disabled={submitting || !amount}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-base hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Opening Payment..."
                  : `Add ₹${amount ? Number(amount).toLocaleString("en-IN") : "0"} to Wallet`}
              </button>

              <p className="text-xs text-center text-gray-400">
                Secured by Razorpay • Funds added instantly after payment
              </p>
            </>
          ) : (
            // Success state — same design
            <div className="py-6 text-center space-y-2">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Wallet size={28} className="text-teal-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">Funds Added!</p>
              <p className="text-xs text-slate-500">
                ₹{Number(amount).toLocaleString("en-IN")} has been added to your
                wallet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (!form.newPassword) e.newPassword = "Required";
    else if (form.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form.currentPassword, form.newPassword);
  };

  const Field = ({ label, field, showKey }) => (
    <div>
      <p className="text-sm text-gray-500 mb-1 font-medium">{label}</p>
      <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-teal-500 transition">
        <input
          type={showPass[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => {
            setForm({ ...form, [field]: e.target.value });
            setErrors({ ...errors, [field]: "" });
          }}
          className="flex-1 px-4 py-2.5 outline-none text-sm"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={() =>
            setShowPass({ ...showPass, [showKey]: !showPass[showKey] })
          }
          className="px-3 text-gray-400 hover:text-gray-600 text-xs"
        >
          {showPass[showKey] ? "Hide" : "Show"}
        </button>
      </div>
      {errors[field] && (
        <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Change Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field
            label="Current Password"
            field="currentPassword"
            showKey="current"
          />
          <Field label="New Password" field="newPassword" showKey="new" />
          <Field
            label="Confirm New Password"
            field="confirmPassword"
            showKey="confirm"
          />
          {form.newPassword && (
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    form.newPassword.length > i * 3
                      ? form.newPassword.length >= 12
                        ? "bg-teal-500"
                        : form.newPassword.length >= 8
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("Personal details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    location: "",
    bio: "",
    profilePhoto: "",
    freelancerLevel: "",
    budgetRange: "",
    communicationPreference: "",
    autoInviteFreelancers: false,
    jobVisibility: "Public",
    walletBalance: 0,
    paymentMethod: "",
    upi_id: "",
    billingAddress: "",
    lastSignIn: new Date().toISOString(),
    notifications: DEFAULT_NOTIFICATIONS,
  });

  const [draft, setDraft] = useState({});
  const [editingField, setEditingField] = useState(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState("confirm");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ Payment history now from payment API
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  // ─── Flash helpers ────────────────────────────────────────────────────────
  const flash = (type, msg) => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  // ─── Fetch profile ────────────────────────────────────────────────────────
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
          freelancerLevel: data.freelancerLevel || "",
          budgetRange: data.budgetRange || "",
          communicationPreference: data.communicationPreference || "",
          autoInviteFreelancers: data.autoInviteFreelancers ?? false,
          jobVisibility: data.jobVisibility || "Public",
          walletBalance: 0, // ✅ fetched from /api/payment/wallet
          paymentMethod: data.paymentMethod || "",
          upi_id: data.upi_id || "",
          billingAddress: data.billingAddress || "",
          lastSignIn: data.lastSignIn || new Date().toISOString(),
          notifications: {
            ...DEFAULT_NOTIFICATIONS,
            ...(data.notifications || {}),
          },
        };
        setUserData(merged);
        setDraft(merged);
        setInvoices(data.invoices || []);
      } catch (e) {
        flash("error", "Failed to load profile: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Fetch wallet + payment history when Billing tab opens
  useEffect(() => {
    if (activeTab === "Billing & Payments") fetchWalletData();
  }, [activeTab]);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const [walletRes, txRes] = await Promise.all([
        paymentApi("/wallet"),
        paymentApi("/transactions"),
      ]);

      // Sync wallet balance
      const balance = walletRes.wallet?.balance || 0;
      setUserData((prev) => ({ ...prev, walletBalance: balance }));

      // Payment history from transactions
      const history = (txRes.transactions || [])
        .filter((t) =>
          ["Escrow Deposit", "Wallet Top-up", "Milestone Release"].includes(
            t.type,
          ),
        )
        .map((t) => ({
          _id: t._id,
          amount: t.amount,
          date: t.dateValue || t.createdAt,
          status:
            t.status === "Held" ||
            t.status === "Completed" ||
            t.status === "Released"
              ? "Success"
              : "Pending",
          description: t.description || t.type,
        }));
      setPaymentHistory(history);
    } catch (e) {
      flash("error", "Failed to load wallet: " + e.message);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    setDraft(userData);
    setEditingField(null);
    setError("");
    setSuccess("");
  }, [activeTab]); // eslint-disable-line

  const fileInputRef = useRef(null);

const handlePhotoSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Preview ke liye local URL bana lo
  const previewUrl = URL.createObjectURL(file);
  setDraft({ ...draft, profilePhoto: previewUrl, profilePhotoFile: file });
};

  // ─── Save handlers ────────────────────────────────────────────────────────
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
      const updated = { ...userData, ...data };
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

  const handleSavePaymentMethod = async () => {
    try {
      setSaving(true);
      await api("/payment-method", "PATCH", {
        paymentMethod: draft.paymentMethod,
      });
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

  const handleSaveBillingAddress = async () => {
    try {
      setSaving(true);
      await api("/billing-address", "PATCH", {
        billingAddress: draft.billingAddress,
      });
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

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await api("/notifications", "PATCH", {
        notifications: draft.notifications,
      });
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

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      await api("/change-password", "PATCH", { currentPassword, newPassword });
      setShowPasswordModal(false);
      flash("success", "Password changed successfully!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm("Log out from all other devices?")) return;
    try {
      await api("/logout-all", "POST");
      flash("success", "Logged out from all devices!");
    } catch (e) {
      flash("error", e.message);
    }
  };

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

  const handleCancel = () => {
    setDraft(userData);
    setEditingField(null);
  };

  // ─── UI helpers ───────────────────────────────────────────────────────────
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
        className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors ${draft.notifications?.[field] ? "bg-teal-500" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${draft.notifications?.[field] ? "translate-x-5" : "translate-x-0"}`}
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

  // ─── Tab renderers ────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading)
      return (
        <div className="p-8 text-center text-gray-500">Loading profile…</div>
      );
    const blurClass = showDeleteModal
      ? "blur-sm pointer-events-none transition-all"
      : "";

    switch (activeTab) {
      case "Personal details":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Personal Details</h2>
            <div className="relative flex items-center gap-6">
              <div
                className="relative cursor-pointer group w-40 h-40 flex-shrink-0"
                onClick={() => fileInputRef.current.click()}
              >
                <img
                  src={
                    draft.profilePhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || "User")}`
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-gray-100 group-hover:border-teal-400 transition-all"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={16} className="text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">
                    Edit Photo
                  </span>
                </div>

                {/* ✅ Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
              <div className="flex-grow space-y-3">
                {["fullName", "email"].map((field) => (
                  <div
                    key={field}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500">
                        {field === "fullName" ? "Name" : "Email"}
                      </p>
                      {editingField === field ? (
                        <input
                          className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                          value={draft[field] || ""}
                          onChange={(e) =>
                            setDraft({ ...draft, [field]: e.target.value })
                          }
                          autoFocus
                        />
                      ) : (
                        <p className="font-medium">
                          {userData[field] || "—"}
                          {field === "email" && userData.email && (
                            <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {editingField !== field && (
                      <Edit2
                        size={18}
                        className="text-gray-400 cursor-pointer"
                        onClick={() => setEditingField(field)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {["companyName", "phone", "location"].map((field) => (
              <div
                key={field}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 capitalize">
                    {field === "companyName"
                      ? "Company Name"
                      : field === "phone"
                        ? "Phone"
                        : "Location"}
                  </p>
                  {editingField === field ? (
                    <input
                      className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                      value={draft[field] || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, [field]: e.target.value })
                      }
                      placeholder={field === "location" ? "City, State" : ""}
                    />
                  ) : (
                    <p className="font-medium">
                      {userData[field] || "—"}
                      {field === "phone" && userData.phone && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {editingField !== field && (
                  <Edit2
                    size={18}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setEditingField(field)}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-between items-start p-4 border rounded-lg">
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Bio</p>
                {editingField === "bio" ? (
                  <textarea
                    rows={4}
                    className="font-medium border-b border-teal-500 outline-none w-full mt-1 resize-none"
                    value={draft.bio || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, bio: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium text-gray-700">
                    {userData.bio || "—"}
                  </p>
                )}
              </div>
              {editingField !== "bio" && (
                <Edit2
                  size={18}
                  className="text-gray-400 cursor-pointer mt-1"
                  onClick={() => setEditingField("bio")}
                />
              )}
            </div>
            {editingField && editingField !== "profilePhoto" && (
              <SaveCancelBar onSave={handleSavePersonal} />
            )}
            <div className="pt-6 border-t">
              <h3 className="text-red-500 font-semibold mb-2">
                Account closure
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Closing your account is permanent. Please ensure all payments
                and activities are completed first.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteStep("confirm");
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Close my account
              </button>
            </div>
          </div>
        );

      case "Hiring Preferences":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-xl font-semibold">Hiring Preferences</h2>
            {[
              {
                field: "freelancerLevel",
                label: "Preferred Freelancer Level",
                type: "select",
                options: ["", "Beginner", "Intermediate", "Expert"],
              },
              {
                field: "budgetRange",
                label: "Preferred Budget Range",
                type: "input",
                placeholder: "e.g. ₹5,000 - ₹20,000",
              },
              {
                field: "communicationPreference",
                label: "Communication Preference",
                type: "select",
                options: ["", "Chat", "Video Call", "Email"],
              },
              {
                field: "jobVisibility",
                label: "Job Visibility",
                type: "select",
                options: ["", "Public", "Private", "Invite Only"],
              },
            ].map(({ field, label, type, options, placeholder }) => (
              <div
                key={field}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="flex-grow">
                  <p className="text-sm text-gray-500">{label}</p>
                  {editingField === field ? (
                    type === "select" ? (
                      <select
                        className="font-medium border-b border-teal-500 outline-none w-full mt-1 bg-transparent"
                        value={draft[field] || ""}
                        onChange={(e) =>
                          setDraft({ ...draft, [field]: e.target.value })
                        }
                      >
                        {options.map((o) => (
                          <option key={o} value={o}>
                            {o || `Select ${label}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="font-medium border-b border-teal-500 outline-none w-full mt-1"
                        value={draft[field] || ""}
                        onChange={(e) =>
                          setDraft({ ...draft, [field]: e.target.value })
                        }
                        placeholder={placeholder}
                      />
                    )
                  ) : (
                    <p className="font-medium">{userData[field] || "—"}</p>
                  )}
                </div>
                {editingField !== field && (
                  <Edit2
                    size={18}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setEditingField(field)}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Auto Invite Freelancers</p>
                <p className="font-medium">
                  {draft.autoInviteFreelancers ? "Enabled" : "Disabled"}
                </p>
              </div>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    autoInviteFreelancers: !draft.autoInviteFreelancers,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${draft.autoInviteFreelancers ? "bg-teal-500" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${draft.autoInviteFreelancers ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            <SaveCancelBar onSave={handleSaveHiringPrefs} />
          </div>
        );

      case "Password & security":
        return (
          <div className={`space-y-8 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Password & security
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Sign-in email</span>
                <span className="text-gray-900 font-medium">
                  {userData.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Password</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
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
            {showPasswordModal && (
              <ChangePasswordModal
                onClose={() => setShowPasswordModal(false)}
                onSave={handleChangePassword}
                saving={saving}
              />
            )}
          </div>
        );

      // ✅ BILLING & PAYMENTS — wallet from payment API
      case "Billing & Payments":
        return (
          <div className={`space-y-6 ${blurClass}`}>
            <h2 className="text-2xl font-bold mb-6">Billing & Payments</h2>

            {/* Wallet Balance — same design, real balance */}
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Wallet Balance
                  </p>
                  {walletLoading ? (
                    <p className="text-xl text-gray-400 animate-pulse">
                      Loading…
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-teal-600">
                      ₹ {(userData.walletBalance ?? 0).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-800 transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Funds
                </button>
              </div>
            </div>

            {/* Saved Payment Method */}
            <div className="p-6 border rounded-xl bg-white flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Saved Payment Method
                </p>
                {editingField === "paymentMethod" ? (
                  <input
                    className="font-medium border-b border-teal-500 outline-none"
                    value={
                      typeof draft.paymentMethod === "string"
                        ? draft.paymentMethod
                        : formatPaymentMethod(draft.paymentMethod)
                    }
                    onChange={(e) =>
                      setDraft({ ...draft, paymentMethod: e.target.value })
                    }
                    placeholder="e.g. Visa ending 4242"
                    autoFocus
                  />
                ) : (
                  // 🩹 FIX — was rendering the raw object here, causing the crash.
                  <p className="font-medium">
                    {formatPaymentMethod(userData.paymentMethod) ||
                      "No payment method added"}
                  </p>
                )}
              </div>
              {editingField === "paymentMethod" ? (
                <button
                  onClick={handleSavePaymentMethod}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditingField("paymentMethod")}
                  className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
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
                    onChange={(e) =>
                      setDraft({ ...draft, upi_id: e.target.value })
                    }
                    placeholder="yourname@upi"
                  />
                ) : (
                  <p className="font-medium">{userData.upi_id || "Not set"}</p>
                )}
              </div>
              {editingField === "upi" ? (
                <button
                  onClick={handleSaveUPI}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Save UPI
                </button>
              ) : (
                <button
                  onClick={() => setEditingField("upi")}
                  className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Edit UPI
                </button>
              )}
            </div>

            {/* Billing Address */}
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900 mb-2">
                    Billing Address
                  </p>
                  {editingField === "billingAddress" ? (
                    <textarea
                      rows={3}
                      className="w-full border-b border-teal-500 outline-none resize-none"
                      value={draft.billingAddress || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, billingAddress: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium text-gray-700">
                      {userData.billingAddress || "No billing address added"}
                    </p>
                  )}
                </div>
                {editingField === "billingAddress" ? (
                  <button
                    onClick={handleSaveBillingAddress}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold ml-4"
                  >
                    Save
                  </button>
                ) : (
                  <Edit2
                    size={18}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setEditingField("billingAddress")}
                  />
                )}
              </div>
            </div>

            {/* ✅ Payment History from payment API */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Payment History</h3>
              {walletLoading ? (
                <p className="text-sm text-gray-400 animate-pulse">
                  Loading history…
                </p>
              ) : paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No payment history yet.</p>
              ) : (
                paymentHistory.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 border rounded-xl bg-white flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-gray-900">
                        ₹{item.amount?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-400">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold ${item.status === "Success" ? "bg-teal-100 text-teal-600" : "bg-yellow-100 text-yellow-600"}`}
                    >
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
                  <div
                    key={invoice._id || invoice.id}
                    className="p-4 border rounded-xl bg-white flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          `${API_BASE}/invoices/${invoice._id}/download`,
                          "_blank",
                        )
                      }
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

      case "Notification settings":
        return (
          <div className={`pb-20 ${blurClass}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Notification settings
            </h2>
            <Section title="Hiring & Proposals">
              <ToggleRow
                title="Proposal received"
                description="Get notified when a freelancer submits a proposal to your job"
                field="proposalReceived"
              />
              <ToggleRow
                title="Hiring updates"
                description="Receive updates about shortlisted, hired, or declined freelancers"
                field="hiringUpdates"
              />
              <ToggleRow
                title="Interview reminders"
                description="Get reminders before scheduled interviews or meetings"
                field="interviewReminders"
              />
            </Section>
            <Section title="Messages">
              <ToggleRow
                title="Message received"
                description="Get notified when a freelancer sends you a message"
                field="messageReceived"
              />
            </Section>
            <Section title="Billing & Payments">
              <ToggleRow
                title="Payment alerts"
                description="Receive alerts for successful payments, failed transactions, and invoices"
                field="paymentAlerts"
              />
            </Section>
            <Section title="Marketing & Updates">
              <ToggleRow
                title="Marketing emails"
                description="Receive product updates, feature announcements, and promotional emails"
                field="marketingEmails"
              />
            </Section>
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-teal-700 transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save All Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold"
              >
                Discard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

      {/* ✅ Add Funds Modal — Razorpay integrated */}
      {showAddFundsModal && (
        <AddFundsModal
          onClose={() => setShowAddFundsModal(false)}
          onSuccess={(newBal) => {
            setUserData((prev) => ({ ...prev, walletBalance: newBal }));
            fetchWalletData();
            flash("success", "Funds added to wallet!");
          }}
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
                <p className="text-gray-500 text-sm mt-2 mb-6">
                  This will permanently delete your account and all associated
                  data.
                </p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg font-medium"
                  >
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
