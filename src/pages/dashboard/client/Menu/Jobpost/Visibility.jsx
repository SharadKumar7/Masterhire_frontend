import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionContainer from "../../../../../components/common/SectionContainer";
import { useJobPost } from "../../../../../context/JobPostContext";

const Preferences = () => {

  const navigate = useNavigate();
  // State management
  const { jobData, updateJobData } = useJobPost();

  // Handle changes for Radio and Checkbox
  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  updateJobData({
    [name]: type === "checkbox" ? checked : value,
  });
};

  // Button logic (always enabled since visibility has a default, but logic added)
  const isFormValid = jobData.visibility !== "";

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!isFormValid) return;

  navigate("/client/dashboard/post-job/reviewpost");
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-top justify-center ">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 ">
        <p className=" font-semibold text-2xl text-gray-800 my-6 ">
          Visibility & Prefrences
        </p>

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
                  checked={jobData.allowNegotiation}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </SectionContainer>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`${
              !isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            } text-white font-semibold mr-5 py-3 px-12 rounded-lg shadow-md transition duration-150 ease-in-out`}
          >
            Review Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
