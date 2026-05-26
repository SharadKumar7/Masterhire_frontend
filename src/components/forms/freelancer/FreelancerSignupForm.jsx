import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";
const apiUrl = import.meta.env.VITE_API_URL;

const FreelancerSignupForm = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData, progress, startLoading, stopLoading ,nextStep} =
    useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState(signupData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    const updated = { ...formData, [id]: val };
    setFormData(updated);
    updateSignupData({ [id]: val });

    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: false }));
  };

  const handleGoogleSignup = async () => {
    startLoading();
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          body: JSON.stringify({ provider: "google", email: "user@gmail.com" }),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        },
      );

      if (response.ok) {
        stopLoading();
        navigate("/signup/details");
      } else {
        stopLoading();
        alert("Google sign-in failed.");
      }
    } catch (error) {
      stopLoading();
      alert("Network error during Google sign-in.");
    }
  };

  const handleNext = async (e) => {
  e.preventDefault();

  const newErrors = {};
  const fieldsToValidate = [
    "firstName",
    "lastName",
    "email",
    "password",
    "country",
    "terms",
  ];

  fieldsToValidate.forEach((key) => {
    if (!formData[key] || formData[key] === "Select Country") {
      newErrors[key] = true;
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  startLoading();

  // ✅ Save data to Context
  updateSignupData(formData);

  try {
    // ✅ Call Send OTP API
    const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country,
          email: formData.email,
          password: formData.password,
          role: formData.role, 
      }),
    });

    if (response.ok) {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/otp");
    } else {
      stopLoading();
      alert("Failed to send OTP. Try again.");
    }

  } catch (error) {
    stopLoading();
    alert("Network error while sending OTP.");
  }
};

  const getBorderClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-teal-500 outline-none transition-colors ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const ErrorText = ({ fieldName, label }) =>
    errors[fieldName] ? (
      <div className="flex items-center gap-1 mt-1 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">{label} is required</p>
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
              Sign up to find work you desire
            </h2>

            <button
              onClick={handleGoogleSignup}
              className="flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out mb-6"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.78 7.18l7.73 6c4.51-4.18 7.11-10.5 7.11-18.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.84l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center mb-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <form className="space-y-6" onSubmit={handleNext}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={getBorderClass("firstName")}
                  />
                  <ErrorText fieldName="firstName" label="First name" />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={getBorderClass("lastName")}
                  />
                  <ErrorText fieldName="lastName" label="Last name" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getBorderClass("email")}
                />
                <ErrorText fieldName="email" label="Email" />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password (8 or more characters)"
                    className={getBorderClass("password")}
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
                <ErrorText fieldName="password" label="A valid password" />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`${getBorderClass("country")} bg-white appearance-none`}
                >
                  <option>Select Country</option>
                  <option value="India">India</option>
                </select>
                <ErrorText fieldName="country" label="Country" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="h-4 w-4  text-teal-600 border-gray-300 rounded mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Yes, I agree to the MasterHire{" "}
                    <Link to="/about" className="text-teal-600">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/about" className="text-teal-600">
                      Privacy
                    </Link>
                    .
                  </label>
                </div>
                <ErrorText fieldName="terms" label="Agreement" />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 font-semibold">
                Log In
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FreelancerSignupForm;
