import React from "react";
import { useNavigate } from "react-router-dom";
import SectionContainer from "../../../../../components/common/SectionContainer";
import { useJobPost } from "../../../../../context/JobPostContext"; // Path to your context file
const today = new Date().toISOString().split("T")[0];

const Budget = () => {
  const navigate = useNavigate();
  
  // Use context to manage global state
  const { jobData, updateJobData } = useJobPost();

  const handleChange = (e) => {
    const { name, id, value } = e.target;
    const fieldName = name || id; // Handle both radio (name) and inputs (id)
    updateJobData({ [fieldName]: value });
  };

  // Validation: Experience and Amount are required to proceed
  const isFormValid = jobData.experienceLevel && jobData.budget;

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!isFormValid) return;

  // Data already saved in context
  navigate("/client/dashboard/post-job/visibility");
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-top justify-center ">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">
        <p className=" font-semibold text-2xl text-gray-800 my-6 ">
          Budget & Timeline
        </p>

        <SectionContainer title="Experience level" initiallyOpen={false} required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-sm text-gray-600">
              <p>Select the experience level you're looking for to match your project needs.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Freelancer experience level</h4>
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <label key={level} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level}
                    checked={jobData.experienceLevel === level}
                    onChange={handleChange}
                    className="w-5 h-5 border-gray-300 accent-teal-600 "
                  />
                  <span className="text-gray-700 group-hover:text-black transition-colors">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Project Budget" initiallyOpen={false} required>
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
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Project Deadline" initiallyOpen={false} required>
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
                      min={today}
                      onChange={handleChange}
                       className="w-half pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Budget;
