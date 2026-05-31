import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";
const apiUrl = import.meta.env.VITE_API_URL;

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData, progress, startLoading, stopLoading, nextStep } =
    useSignup();

  const [languages, setLanguages] = useState(() => {
    if (signupData.languages && signupData.languages.length > 0) {
      return signupData.languages;
    }
    return [
      {
        id: Date.now(),
        language: "English",
        proficiency: "Select Level",
        isDefault: true,
      },
    ];
  });

  const [error, setError] = useState("");
  const availableLanguages = [
    "Hindi",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Telugu",
    "Tamil",
  ];

  useEffect(() => {
    updateSignupData({ languages });
  }, [languages]);

  const addLanguageRow = () => {
    if (languages.length < 5) {
      setLanguages([
        ...languages,
        {
          id: Date.now(),
          language: "Choose Language",
          proficiency: "Select Level",
          isDefault: false,
        },
      ]);
    }
  };

  const removeLanguageRow = (id) => {
    setLanguages(languages.filter((lang) => lang.id !== id));
  };

  const handleLanguageChange = (id, value) => {
    setLanguages(
      languages.map((lang) =>
        lang.id === id ? { ...lang, language: value } : lang,
      ),
    );
    if (error) setError("");
  };

  const handleProficiencyChange = (id, value) => {
    setLanguages(
      languages.map((lang) =>
        lang.id === id ? { ...lang, proficiency: value } : lang,
      ),
    );
    if (error) setError("");
  };

  const handleNext = async (e) => {
  e.preventDefault();

  const isInvalid = languages.some(
    (l) =>
      l.proficiency === "Select Level" || l.language === "Choose Language"
  );

  if (isInvalid) {
    setError(
      "Please set the proficiency for English and select other languages correctly."
    );
    return;
  }

  startLoading();

  try {

    // update final language data in context
    const finalData = {
      ...signupData,
      languages: languages,
    };
    const response = await fetch(`${apiUrl}/api/auth/complete-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalData),
    });

    if (response.ok) {
      stopLoading();
        nextStep();
      navigate("/signup/freelancer/welcome");
    } else {
      stopLoading();
      setError("Server error. Please try again.");
    }

  } catch (err) {
    stopLoading();
    setError("Network error. Check your connection.");
  }
};
  const handleBack = () => {
    navigate("/signup/freelancer/education");
  };

  return (
    <>
      <Loader progress={progress} />
      <div className="min-h-screen bg-white flex flex-col justify-between p-4">
        <header className="absolute top-4 left-4">
          <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
        </header>

        <main className="w-full max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Language</h2>
          <p className="text-gray-600 mb-8">
            Strong language skills enable clear communication with clients.
            English is mandatory. Include any additional languages you are
            proficient in.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8 ">
              <h3 className="text-sm font-medium text-gray-700">Language</h3>
              <h3 className="text-sm font-medium text-gray-700">Proficiency</h3>
            </div>

            {languages.map((lang) => (
              <div
                key={lang.id}
                className="grid grid-cols-2 gap-8 items-center"
              >
                <div className="relative">
                  <select
                    value={lang.language}
                    disabled={lang.isDefault}
                    onChange={(e) =>
                      handleLanguageChange(lang.id, e.target.value)
                    }
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white appearance-none outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                      lang.isDefault
                        ? "text-gray-500 bg-gray-50"
                        : "text-gray-800"
                    }`}
                  >
                    {lang.isDefault ? (
                      <option value="English">English</option>
                    ) : (
                      <>
                        <option value="Choose Language">Choose Language</option>
                        {availableLanguages.map((al) => (
                          <option key={al} value={al}>
                            {al}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {!lang.isDefault && (
                    <ChevronDown className="absolute inset-y-0 right-3 flex items-center pointer-events-none w-5 h-full text-gray-400" />
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-grow">
                    <select
                      value={lang.proficiency}
                      onChange={(e) =>
                        handleProficiencyChange(lang.id, e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white appearance-none outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Select Level">Select Level</option>
                      <option value="Basic">Basic</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native/Bilingual">Native/Bilingual</option>
                    </select>
                    <ChevronDown className="absolute inset-y-0 right-3 flex items-center pointer-events-none w-5 h-full text-gray-400" />
                  </div>

                  {!lang.isDefault && (
                    <button
                      type="button"
                      onClick={() => removeLanguageRow(lang.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className=" flex items-center gap-2  mt-2 text-red-600 rounded-lg ">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={addLanguageRow}
            disabled={languages.length >= 4}
            className="mt-6 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Language
          </button>
        </main>

        <footer className="w-full max-w-3xl mx-auto flex justify-between pt-10 pb-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-12 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-16 rounded-lg shadow-md transition-all active:scale-95"
          >
            Complete Your Profile
          </button>
        </footer>
      </div>
    </>
  );
};

export default LanguageSelection;
