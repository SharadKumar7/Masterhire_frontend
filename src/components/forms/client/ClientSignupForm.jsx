import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";
import { GoogleLogin } from "@react-oauth/google";
const apiUrl = import.meta.env.VITE_API_URL;

const validatePassword = (password) => {
  if (!password || password.length < 8) return "Password must be at least 8 characters";
  if (!/[0-9]/.test(password)) return "Password must contain at least 1 number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Password must contain at least 1 special character";
  return null;
};

const ClientSignupForm = () => {
  const navigate = useNavigate();
  const {
    signupData, updateSignupData, progress,
    startLoading, stopLoading, nextStep,
  } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(signupData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updated = { ...formData, [id]: val };
    setFormData(updated);
    updateSignupData({ [id]: val });
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName)  newErrors.lastName  = "Last name is required";
    if (!formData.email)     newErrors.email     = "Email is required";
    if (!formData.country || formData.country === "Select Country") newErrors.country = "Country is required";
    if (!formData.terms)     newErrors.terms     = "You must agree to the terms";

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startLoading();
    updateSignupData(formData);

    try {
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName:  formData.lastName,
          country:   formData.country,
          email:     formData.email,
          password:  formData.password,
          role:      formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        nextStep();
        navigate("/signup/client/otp");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("SEND OTP ERROR:", error);
      alert("Server is unavailable");
    } finally {
      stopLoading();
    }
  };

  const getBorderClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-teal-500 outline-none transition-colors ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const ErrorText = ({ fieldName }) =>
    errors[fieldName] ? (
      <div className="flex items-center gap-1 mt-1 text-red-500">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p className="text-sm font-medium">{errors[fieldName]}</p>
      </div>
    ) : null;

  return (
    <>
      <Loader progress={progress} />

      <div className="min-h-screen bg-white flex justify-center items-center p-4">
        <div className="w-full max-w-lg">
          <header className="absolute top-4 left-4">
            <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
          </header>

          <main className="mt-12">
            <h2 className="text-lg font-semibold mb-8 text-gray-800 text-center">
              Sign up to hire talent
            </h2>

            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                startLoading();
                try {
                  const response = await fetch(`${apiUrl}/api/auth/google-auth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      credential: credentialResponse.credential,
                      role: "client",
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok) { alert(data.message || "Google signup failed"); return; }
                  localStorage.setItem("token", data.token);
                  navigate("/signup/client/welcome");
                } catch (error) {
                  console.error("GOOGLE AUTH ERROR:", error);
                  alert("Server is unavailable");
                } finally {
                  stopLoading();
                }
              }}
              onError={() => alert("Google Login Failed")}
            />

            <div className="flex items-center mb-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <form className="space-y-6" onSubmit={handleNext}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} className={getBorderClass("firstName")} />
                  <ErrorText fieldName="firstName" />
                </div>
                <div className="w-1/2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} className={getBorderClass("lastName")} />
                  <ErrorText fieldName="lastName" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Business email address</label>
                <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={getBorderClass("email")} />
                <ErrorText fieldName="email" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 8 chars, 1 number, 1 special char"
                    className={getBorderClass("password")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                <ErrorText fieldName="password" />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select id="country" value={formData.country} onChange={handleInputChange}
                  className={`${getBorderClass("country")} bg-white appearance-none`}>
                  <option>Select Country</option>
                  <option value="India">India</option>
                </select>
                <ErrorText fieldName="country" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-start">
                  <input type="checkbox" id="terms" checked={formData.terms} onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded mt-1" />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    Yes, I agree to the MasterHire{" "}
                    <Link to="/about" className="text-teal-600">Terms</Link>{" "}and{" "}
                    <Link to="/about" className="text-teal-600">Privacy</Link>.
                  </label>
                </div>
                <ErrorText fieldName="terms" />
              </div>

              <button type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition">
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 font-semibold">Log In</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ClientSignupForm;