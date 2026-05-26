import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionContainer from '../../../../../components/common/SectionContainer';
import { useJobPost } from '../../../../../context/JobPostContext'; // Path to your context file

const BasicDetails = () => {
  const navigate = useNavigate();
  
  // Use context instead of local useState
  const { jobData, updateJobData } = useJobPost();

  // Update context state on input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateJobData({ [id]: value });
  };

  // Validation using context data
  const isFormValid =
  jobData.title?.trim() &&
  jobData.skills?.length > 0 &&  // 🔥 FIXED
  jobData.description?.trim();

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!isFormValid) return;

  // Data already saved in Context using updateJobData
  navigate("/client/dashboard/post-job/budget");
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-top justify-center  ">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">
        <p className=" font-semibold text-2xl text-gray-800 my-6 ">Basic Details</p>

        <SectionContainer title="Job title " initiallyOpen={false} required>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 space-y-4">
              <p className="text-gray-600">
                Write a clear, specific job title that describes what you want to get done.
              </p>
              <p className="text-gray-600">
                A good title helps the right freelancers understand your project quickly.
              </p>
              <p className="text-sm font-semibold text-gray-800">Example:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Build a Professional WordPress Website for My Business</li>
                <li>Develop a Custom Web Application Using Laravel</li>
                <li>Design and Build a Responsive Landing Page</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <label htmlFor="Job title" className="block text-sm font-medium text-gray-700 mb-2">Job title</label>
              <input
                type="text"
                id="title"
                value={jobData.title || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border"
                placeholder="e.g. Need a Shopify expert"
              />
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Skills" initiallyOpen={false} required>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 space-y-4">
              <p className="text-gray-600">
                List the specific skills your project requires.
              </p>
              <p className="text-gray-600">
                Adding the right skills helps freelancers understand your expectations.
              </p>
            </div>
            <div className="md:w-1/2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <textarea
                id="skills"
                rows={4}
                value={jobData.skills || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border"
                placeholder="e.g. React, Tailwind CSS, JavaScript"
              />
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Job description" initiallyOpen={false} required>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 space-y-4">
              <p className="text-gray-600">
                Clearly describe what you need done, including the project scope and key requirements.
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-4">Talents are looking for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Clear expectations about final deliverables</li>
                <li>Specific features you want included</li>
                <li>How you prefer to work (milestones, communication)</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                rows={8}
                value={jobData.description || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-teal-500 focus:ring-1 p-3 border"
                placeholder="Describe your project here..."
              />
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <button className="flex items-center text-teal-600 hover:text-teal-800 font-medium">
                  <svg xmlns="http://www.w3.org" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  Attach files
                </button>
                <span>pdf, doc, zip (max 10 MB)</span>
              </div>
            </div>
          </div>
        </SectionContainer>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`${
              !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            } text-white font-semibold mr-5 py-3 px-12 rounded-lg shadow-md transition duration-150 ease-in-out`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
