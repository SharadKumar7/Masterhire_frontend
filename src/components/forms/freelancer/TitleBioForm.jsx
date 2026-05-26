import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";
import { AlertCircle } from "lucide-react";

const TitleBioForm = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData, progress, startLoading, stopLoading , nextStep} =
    useSignup();

  const [formData, setFormData] = useState({
    title: signupData.title || "",
    bio: signupData.bio || "",
  });

  const [errors, setErrors] = useState({});
  // const MIN_WORDS = 10;

  const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const wordCount = countWords(formData.bio);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    updateSignupData({ [id]: value });
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: false }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleNext = (e) => {
  if (e) e.preventDefault();

  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = true;
  if (!formData.bio.trim() || wordCount < 1) newErrors.bio = true;

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  startLoading();

  // save data in context
  updateSignupData({
    title: formData.title,
    bio: formData.bio
  });

  setTimeout(() => {
    stopLoading();
      nextStep();
    navigate("/signup/freelancer/experience");
  }, 400);
};

  const handleSkip = async () => {
    startLoading();
    await stopLoading();
    nextStep();
    navigate("/signup/freelancer/experience");
  };

  

  const handleBack = async () => {
    startLoading();
    await stopLoading();
    navigate("/signup/freelancer/skills");
  };

  const getBorderClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-teal-500 outline-none transition-colors ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  return (
    <>
      <Loader progress={progress} />

      <div
        className="min-h-screen bg-white flex flex-col justify-between p-4"
        onKeyDown={handleKeyDown}
      >
        <header className="absolute top-4 left-4">
          <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
        </header>

        <main className="w-full max-w-2xl mx-auto mt-20">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Title & Bio</h2>
          <p className="text-gray-600 mb-8">
            Add a clear professional title and a well-written bio that explains
            who you are, what you specialize in, and the value you bring to
            clients.
          </p>

          <form className="space-y-6" onSubmit={handleNext}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className={getBorderClass("title")}
                placeholder="e.g. Full Stack Developer"
              />
              {errors.title && (
                <div className="flex items-center gap-1 mt-1 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm"> Title is required</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Bio
              </label>
              <textarea
                id="bio"
                rows={6}
                value={formData.bio}
                onChange={handleInputChange}
                className={getBorderClass("bio")}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm"> Minimum 10 words required</p>
                  </div>
                ) : (
                  <span></span>
                )}
                <p
                  className={`text-sm ${wordCount < 1 ? "text-gray-500" : "text-teal-600"}`}
                >
                  {wordCount} words
                </p>
              </div>
            </div>
          </form>
        </main>

        <footer className="w-full max-w-2xl mx-auto flex justify-between items-center pt-6 pb-4">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-16 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out"
          >
            Back
          </button>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleSkip}
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Skip for now
            </button>

            <button
              type="submit"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-16 rounded-lg shadow-md transition"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TitleBioForm;
