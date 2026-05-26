import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, AlertCircle, Trash2 } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";

/* ---------------- MODAL COMPONENT ---------------- */

const ExperienceModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validateAndSave = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.title) newErrors.title = true;
    if (!formData.company) newErrors.company = true;
    if (!formData.startDate) newErrors.startDate = true;
    if (!formData.current && !formData.endDate) newErrors.endDate = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Add Experience
          </h2>

          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={validateAndSave} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              type="text"
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Company</label>
            <input
              name="company"
              type="text"
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium">
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                disabled={formData.current}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              name="current"
              type="checkbox"
              checked={formData.current}
              onChange={handleChange}
              className="mr-2"
            />
            <label>I currently work here</label>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */

const WorkExperiencePage = () => {

  const navigate = useNavigate();

  const {
    signupData,
    updateSignupData,
    progress,
    startLoading,
    stopLoading,
    nextStep
  } = useSignup();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [experiences, setExperiences] = useState(
    signupData.experiences || []
  );

  const [showError, setShowError] = useState(false);

  const addExperienceHandler = (newExp) => {

    const experienceWithId = {
      ...newExp,
      id: Date.now()
    };

    const updatedList = [...experiences, experienceWithId];

    setExperiences(updatedList);

    updateSignupData({
      experiences: updatedList
    });

    setShowError(false);
  };

  const removeExperienceHandler = (id) => {

    const updatedList = experiences.filter(
      (exp) => exp.id !== id
    );

    setExperiences(updatedList);

    updateSignupData({
      experiences: updatedList
    });
  };

  const handleNext = () => {

    if (experiences.length === 0) {
      setShowError(true);
      return;
    }

    startLoading();

    updateSignupData({
      experiences
    });

    setTimeout(() => {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/education");
    }, 400);
  };

  const handleSkip = () => {
    startLoading();

    setTimeout(() => {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/education");
    }, 300);
  };

  const handleBack = () => {
    startLoading();

    setTimeout(() => {
      stopLoading();
      navigate("/signup/freelancer/bio");
    }, 300);
  };

  return (
    <>
      <Loader progress={progress} />

      <div className="min-h-screen bg-white flex flex-col justify-between p-4">

        <header className="absolute top-4 left-4">
          <h1 className="text-3xl font-jaro text-gray-800">
            MasterHire
          </h1>
        </header>

        <main className="w-full max-w-2xl mx-auto mt-20">

          <h2 className="text-xl font-bold mb-4">
            Work Experience
          </h2>

          <p className="text-gray-600 mb-8">
            List your professional experience to showcase your skills.
          </p>

          <div
            className={`border rounded-lg p-6 h-[300px] overflow-y-auto ${
              showError
                ? "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
          >

            {experiences.length === 0 ? (

              <div className="flex flex-col justify-center items-center h-full gap-2">

                <p className="text-gray-500">
                  No experience added yet.
                </p>

                {showError && (
                  <div className="flex items-center text-red-500 gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">
                      Add at least one experience
                    </p>
                  </div>
                )}

              </div>

            ) : (

              <ul className="space-y-4">

                {experiences.map((exp) => (

                  <li
                    key={exp.id}
                    className="relative p-4 border rounded-lg bg-teal-50"
                  >

                    <button
                      onClick={() =>
                        removeExperienceHandler(exp.id)
                      }
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>

                    <p className="font-semibold">
                      {exp.title} at {exp.company}
                    </p>

                    <p className="text-sm text-gray-500">
                      {exp.startDate} -{" "}
                      {exp.current ? "Present" : exp.endDate}
                    </p>

                    {exp.description && (
                      <p className="mt-2 text-sm">
                        {exp.description}
                      </p>
                    )}

                  </li>

                ))}

              </ul>

            )}

          </div>

          <div className="mt-8">

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-6 py-3 border border-dashed border-teal-600 text-teal-600 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Work Experience
            </button>

          </div>

        </main>

        <footer className="w-full max-w-2xl mx-auto flex justify-between pt-6 pb-4">

          <button
            onClick={handleBack}
            className="px-12 py-3 border rounded-lg"
          >
            Back
          </button>

          <div className="flex gap-6">

            <button
              onClick={handleSkip}
              className="text-teal-600"
            >
              Skip for now
            </button>

            <button
              onClick={handleNext}
              className="px-12 py-3 bg-teal-600 font-semibold text-white rounded-lg"
            >
              Next
            </button>

          </div>

        </footer>

        {isModalOpen && (
          <ExperienceModal
            onClose={() => setIsModalOpen(false)}
            onSave={addExperienceHandler}
          />
        )}

      </div>
    </>
  );
};

export default WorkExperiencePage;