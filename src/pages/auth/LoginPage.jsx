import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff  } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Loader from '../../components/common/Loader'; 
import { useSignup } from '../../context/SignupContext'; 
import { useAuth } from "../../context/AuthContext";
const apiUrl = import.meta.env.VITE_API_URL;


const LoginContent = () => {
  const navigate = useNavigate();
  const {  progress, startLoading, stopLoading } = useSignup();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  startLoading();

  try {
    const res = await login(formData.email, formData.password);

    console.log("Login response:", res);

    if (res.success) {
      if (res.role === "freelancer") {
        navigate("/freelancer/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } else {
      setError(res.message || "Login failed");
    }

  } catch (err) {
    setError("Something went wrong");
  } finally {
    stopLoading();
  }
};

  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const res = await fetch("YOUR_BACKEND_API/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenResponse.access_token,
        }),
      });

      const data = await res.json();

      const userData = data.user;

      login(userData);

      if (userData.role === "freelancer") {
        navigate("/dashboard/find-jobs");
      } else {
        navigate("/dashboard/my-jobs");
      }

    } catch {
      setError("Google login failed");
    }
  },
});

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
          <h2 className="text-2xl font-bold text-gray-800 mt-1">Login To MasterHire</h2>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
 
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
          </div>

          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition">
            Log In
          </button>

        </form>

        <div className="mt-2 flex justify-end">
          <Link to="/forgetpassword" className="text-teal-600 hover:text-teal-700">Forget Password?</Link>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* FULLY CUSTOM GOOGLE BUTTON */}
        <button
          onClick={() => googleLogin()}
          className="flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out mb-6"
          > 
        <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.78 7.18l7.73 6c4.51-4.18 7.11-10.5 7.11-18.5z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.84l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          Continue with Google
        </button>

        <div className="mt-4 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold">Sign Up</Link>
        </div>
      </main>
    </div>
    </>
  );
};

const MasterHireLoginPage = () => (
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <LoginContent />
  </GoogleOAuthProvider>
);

export default MasterHireLoginPage;
