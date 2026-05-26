import React from "react";
import { useJobPost } from "../../../../context/JobPostContext";
import { useNavigate } from "react-router-dom";
const today = new Date().toISOString().split("T")[0];

// Props:
//   source="draft"     → shows both "Save Draft" and "Publish Job" buttons
//   source="published" → shows only "Save Changes" button
const ReviewJobPost = ({ source = "draft" }) => {
  const { jobData, updateJobData, clearJobData } = useJobPost();
  const navigate = useNavigate();

  const isFromPublished = source === "published";

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const key = id || name;
    const updatedValue = type === "checkbox" ? checked : value;
    updateJobData({ [key]: updatedValue });
  };

  const handleSubmit = async (status) => {
    try {
      const token = localStorage.getItem("token");

      const formattedData = {
        title: jobData.title,
        description: jobData.description,
        experienceLevel: jobData.experienceLevel,
        skills:
          typeof jobData.skills === "string"
            ? jobData.skills.split(",").map((s) => s.trim())
            : jobData.skills,
        budget: Number(jobData.budget),
        deadline: jobData.deadline,
        allowNegotiation: jobData.allowNegotiation,
        visibility: jobData.visibility,
        status,
      };

      console.log("FINAL DATA:", formattedData);

      const response = await fetch("http://localhost:5006/api/jobs/post-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        if (status === "draft") {
          alert("Job saved as Draft ✅");
        } else if (status === "published") {
          alert("Job Posted Successfully ✅");
        } else {
          alert("Changes Saved Successfully ✅");
        }
        clearJobData();
        navigate("/client/dashboard");
      } else {
        alert(data.message || "Server error");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Failed to submit. Please check your connection.");
    }
  };

  const inputClass =
    "w-full rounded-lg px-4 py-2.5 text-sm border transition-all outline-none bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  const radioClass = (isChecked) =>
    `flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
      isChecked
        ? "bg-teal-50 border-teal-500 text-teal-700 ring-2 ring-teal-100"
        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto  bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className=" bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">Review Job Post</h1>
          <p className="text-xs text-gray-500 mt-1">Review or update details before finalizing</p>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-6">

          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              id="title"
              value={jobData.title || ""}
              onChange={handleChange}
              placeholder="e.g. Need a Shopify expert"
              className={inputClass}
            />
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Skills Required
            </label>
            <textarea
              id="skills"
              rows={2}
              value={jobData.skills || ""}
              onChange={handleChange}
              placeholder="e.g. React, Tailwind CSS"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Job Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={jobData.description || ""}
              onChange={handleChange}
              placeholder="Describe your project expectations..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              Required Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Beginner", "Intermediate", "Expert"].map((level) => {
                const isChecked = jobData.experienceLevel === level;
                return (
                  <label key={level} className={radioClass(isChecked)}>
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={isChecked}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {level}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Budget & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Project Budget
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm font-medium pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  id="budget"
                  value={jobData.budget || ""}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Project Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={jobData.deadline || ""}
                min={today}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
              Visibility Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Public", "Invite only"].map((type) => {
                const isChecked = jobData.visibility === type;
                return (
                  <label key={type} className={radioClass(isChecked)}>
                    <input
                      type="radio"
                      name="visibility"
                      value={type}
                      checked={isChecked}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Negotiation Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-800">Allow Budget Negotiation</p>
              <p className="text-xs text-gray-500 mt-0.5">Permit candidates to propose alternative pricing parameters</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="allowNegotiation"
                name="allowNegotiation"
                checked={!!jobData.allowNegotiation}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

        </div>

        {/* Footer — conditional based on `source` prop */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          {isFromPublished ? (
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
            >
              💾 Save Changes
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("published")}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                Publish Job
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReviewJobPost;