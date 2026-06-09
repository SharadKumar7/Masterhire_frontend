import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Loader from "../../components/common/Loader";
import { useSignup } from "../../context/SignupContext";
import { useAuth } from "../../context/AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

const MasterHireLoginPage = () => {
  const navigate = useNavigate();
  const { progress, startLoading, stopLoading, nextStep } = useSignup();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, setUser, setToken } = useAuth();

  // ── helper: navigate based on role & profile ──────────────────────────────
  const handleRedirect = (role, isProfileComplete) => {
    if (role === "freelancer") {
      if (isProfileComplete) {
        navigate("/freelancer/dashboard");
      } else {
        alert(
          "Please complete your freelancer profile details first and then log in again."
        );
        nextStep();
        nextStep();
        nextStep();
        navigate("/signup/freelancer/details");
      }
    } else {
      navigate("/client/dashboard");
    }
  };

  // ── Email/Password Login ───────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    startLoading();

    try {
      const res = await login(formData.email, formData.password);


      if (res.success) {
        handleRedirect(res.role, res.isProfileComplete);
      } else {
        setError(res.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Server is unavailable");
    } finally {
      stopLoading();
    }
  };

  // ── Google Login ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      startLoading();

      const res = await fetch(`${apiUrl}/api/auth/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();


      if (!res.ok) {
        setError(data.message || "Google login failed");
        return;
      }

      // ✅ sync with AuthContext instead of raw localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      setToken(data.token);
      setUser({
        role: data.user.role,
        userId: data.user.userId,
        fullName: data.user.fullName,
        isProfileComplete: data.user.isProfileComplete,
      });


      handleRedirect(data.user.role, data.user.isProfileComplete);
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError("Google login failed. Please try again.");
    } finally {
      stopLoading();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Loader progress={progress} />

      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
        <header className="absolute top-4 left-4">
          <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
        </header>

        <main className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-gray-600">Welcome Back</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Login To MasterHire
            </h2>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              Log In
            </button>
          </form>

          <div className="mt-2 flex justify-end">
            <Link
              to="/forgetpassword"
              className="text-teal-600 hover:text-teal-700"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed. Please try again.")}
          />

          <div className="mt-4 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default MasterHireLoginPage;