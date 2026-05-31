import React, { useState } from "react";
import SectionContainer from "../../../../../components/common/SectionContainer";
import { useJobPost } from "../../../../../context/JobPostContext";
import { useNavigate } from "react-router-dom";
const today = new Date().toISOString().split("T")[0];
const apiUrl = import.meta.env.VITE_API_URL;

const ReviewJobPost = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { jobData, updateJobData, clearJobData } = useJobPost();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    // Map ID or Name to the context state keys
    const key = id || name;
    updateJobData({ [key]: value });
  };

  const handleSubmit = async (status) => {
  try {
    const token = localStorage.getItem("token");

    // 🔥 FIX DATA BEFORE SEND
    const formattedData = {
      title: jobData.title,
      description: jobData.description,
      experienceLevel: jobData.experienceLevel,

      // ✅ FIX types
      skills:
        typeof jobData.skills === "string"
          ? jobData.skills.split(",").map((s) => s.trim())
          : jobData.skills,

      budget: Number(jobData.budget),

      // ✅ FIX names
      deadline: jobData.deadline,
      allowNegotiation: jobData.allowNegotiation,

      visibility: jobData.visibility,
      status,
    };

    const response = await fetch(
      `${apiUrl}/api/jobs/post-job`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      }
    );


    const data = await response.json();

    if (response.ok) {
      if (status === "draft") {
        alert("Job saved as Draft ✅");
      } else {
        alert("Job Posted Successfully ✅");
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

  // Helper for input styling - FIXED: added w-full for responsiveness
  const getInputClass = (base) =>
    `${base} w-full ${!isEditing ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-500" : "bg-white border-gray-300 text-gray-900"}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-top justify-center ">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">

        <p className="font-semibold text-2xl text-gray-800 my-6">
          Review Job Post
        </p>

        {/* Job Title */}
        <SectionContainer title="Job title" initiallyOpen={true}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-gray-600">
                Write a clear, specific job title that describes what you want
                to get done.
              </p>
              <ul className="hidden md:block list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                <li>Build a Professional WordPress Website</li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job title
              </label>
              <input
                type="text"
                id="title"
                disabled={!isEditing}
                value={jobData.title || ""}
                onChange={handleChange}
                className={getInputClass(
                  "mt-1 block rounded-md shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border",
                )}
                placeholder="e.g. Need a Shopify expert"
              />
            </div>
          </div>
        </SectionContainer>

        {/* Skills */}
        <SectionContainer title="Skills" initiallyOpen={false}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-gray-600">
                List the specific skills your project requires.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <textarea
                id="skills"
                rows={4}
                disabled={!isEditing}
                value={jobData.skills || ""}
                onChange={handleChange}
                className={getInputClass(
                  "mt-1 block rounded-md shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border",
                )}
                placeholder="e.g. React, Tailwind CSS"
              />
            </div>
          </div>
        </SectionContainer>

        {/* Job Description */}
        <SectionContainer title="Job description" initiallyOpen={false}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-gray-600">
                Clearly describe what you need done, including project scope.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={8}
                disabled={!isEditing}
                value={jobData.description || ""}
                onChange={handleChange}
                className={getInputClass(
                  "mt-1 block rounded-md shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border",
                )}
                placeholder="Describe your project here..."
              />
            </div>
          </div>
        </SectionContainer>

        {/* Experience Level */}
        <SectionContainer title="Experience level" initiallyOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-sm text-gray-600">
              <p>
                Select the experience level you're looking for to match your
                project needs.
              </p>
            </div>
            <div className="space-y-3">
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <label
                  key={level}
                  className={`flex items-center space-x-3 ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={level}
                    disabled={!isEditing}
                    checked={jobData.experienceLevel === level}
                    onChange={handleChange}
                    className="w-5 h-5 border-gray-300 accent-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Project Budget" initiallyOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-gray-600">
              <p>Set an estimated budget for your project to help freelancers understand your expectations.</p>
              <p className="italic text-gray-500">This doesn't have to be final - the budget can be adjusted later.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Set your project budget</h4>
              <div className="relative max-w-[240px]">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-medium">₹</span>
                <input
                  type="number"
                  id="budget"
                  value={jobData.budget || ""}
                  disabled={!isEditing}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Project Deadline" initiallyOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-gray-600">
              <p>Set a target deadline for your project if you have a specific timeline in mind.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Set your project deadline</h4>
             
               <div>
                    
                    <input
                      type="date"
                      id="deadline"
                      value={jobData.deadline || ""}
                      disabled={!isEditing}
                      min={today}
                      onChange={handleChange}
                       className="w-half pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Visibility" initiallyOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-gray-600">
              <p className="font-medium text-black">
                Choose who can see and apply to your job.
              </p>
              <p>
                You can make your job public to receive proposals from all
                freelancers, or select invite only to share the job.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Visibility level
              </h4>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="Public"
                    disabled={!isEditing}
                    checked={jobData.visibility === "Public"}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-800 focus:ring-black accent-teal-600"
                  />
                  <span className="text-sm text-gray-700">Public</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="Invite only"
                    disabled={!isEditing}
                    checked={jobData.visibility === "Invite only"}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-800 focus:ring-black accent-teal-600"
                  />
                  <span className="text-sm text-gray-700">Invite only</span>
                </label>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Negotiation" initiallyOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-gray-600">
              <p className="font-medium text-black">
                Choose whether freelancers can negotiate the budget and terms of
                your project.
              </p>
              <p>
                Turning this on allows discussion and flexibility, while turning
                it off keeps your budget fixed.
              </p>
            </div>
            <div className="flex items-center justify-between md:justify-start md:space-x-4">
              <span className="text-sm font-semibold text-gray-700">
                Allow negotiation
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowNegotiation"
                  disabled={!isEditing}
                  checked={jobData.allowNegotiation}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </SectionContainer>

        <div className="flex justify-between items-center pt-4 mb-10">
          {/* Left Side Button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="w-44 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
          >
            {isEditing ? "Lock & Save" : "Edit"}
          </button>

          {/* Right Side Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit("draft")}
              className="w-44 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              Save Draft
            </button>

            <button
              onClick={() => handleSubmit("published")}
              className="w-44 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              Post Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewJobPost;
