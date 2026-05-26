import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, AlertCircle, Trash2 } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";

const EducationModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    fieldOfStudy: "",
    passingYear: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add Education</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institution/University
            </label>
            <input
              type="text"
              name="institution"
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Degree/Level of Education
            </label>
            <input
              type="text"
              name="degree"
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Field of Study
            </label>
            <input
              type="text"
              name="fieldOfStudy"
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Passing Year
            </label>
            <input
              type="text"
              name="passingYear"
              onChange={handleChange}
              required
              placeholder="YYYY"
              maxLength={4}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional, e.g., GPA, awards)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Save Education
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const EducationPage = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData, progress, startLoading, stopLoading , nextStep} =
    useSignup();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educationList, setEducationList] = useState(
    signupData.education || [],
  );
  const [showError, setShowError] = useState(false);

  const addEducationHandler = (newEdu) => {
    const updatedList = [...educationList, { ...newEdu, id: Date.now() }];
    setEducationList(updatedList);
    updateSignupData({ education: updatedList });
    setShowError(false);
  };

  const removeEducationHandler = (id) => {
    const updatedList = educationList.filter((edu) => edu.id !== id);
    setEducationList(updatedList);
    updateSignupData({ education: updatedList });
  };

  const performNavigation = () => {
  startLoading();

  try {
    updateSignupData({ education: educationList });

    setTimeout(() => {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/languages");
    }, 600);

  } catch (error) {
    console.error("Error saving education", error);
    stopLoading();
  }
};

  const handleNext = async () => {
    if (educationList.length === 0) {
      setShowError(true);
      return;
    }
    await performNavigation();
  };

  const handleSkip = async () => {
    startLoading();
    await stopLoading();
    nextStep();
    navigate("/signup/freelancer/languages");
  };

  const handleBack = async () => {
    startLoading();
    await stopLoading();
    navigate("/signup/freelancer/experience");
  };

  return (
    <>
      <Loader progress={progress} />
      <div className="min-h-screen bg-white flex flex-col justify-between p-4">
        <header className="absolute top-4 left-4">
          <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
        </header>

        <main className="w-full max-w-2xl mx-auto mt-20">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Education</h2>
          <p className="text-gray-600 mb-8">
            Add your educational background to support your expertise and give
            clients context about your professional foundation.
          </p>

          <div
            className={`border border-gray-200 rounded-lg p-6 h-[300px] overflow-y-auto scroll-smooth ${showError ? "border-red-500 bg-red-50" : "border-gray-200"}`}
          >
            {educationList.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col items-center justify-center w-full max-w-xs px-6 py-12 border border-dashed border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition duration-150 ease-in-out"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-lg font-semibold">Add Education</span>
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {educationList.map((edu) => (
                  <li
                    key={edu.id}
                    className="relative p-4 border border-teal-100 bg-teal-50/30 rounded-lg"
                  >
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => removeEducationHandler(edu.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-semibold text-gray-800">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      Passing Year: {edu.passingYear}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {edu.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {showError && (
            <div className="flex items-center gap-1 text-red-500 mt-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">
                At least one education entry is required to click Next.
              </p>
            </div>
          )}

          {educationList.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 border border-dashed border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition duration-150 ease-in-out"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add More Education
              </button>
            </div>
          )}
        </main>

        <footer className="w-full max-w-2xl mx-auto flex justify-between items-center pt-6 pb-4">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-12 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out"
          >
            Back
          </button>
          <div className="flex items-center gap-6">
            <button
              onClick={handleSkip}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Skip for now
            </button>
            <button
              type="submit"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Next
            </button>
          </div>
        </footer>

        {isModalOpen && (
          <EducationModal
            onClose={() => setIsModalOpen(false)}
            onSave={addEducationHandler}
          />
        )}
      </div>
    </>
  );
};

export default EducationPage;
