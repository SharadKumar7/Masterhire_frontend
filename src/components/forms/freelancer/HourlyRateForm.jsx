import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HourlyRatePage = () => {
  const navigate = useNavigate();
  const [hourlyRate, setHourlyRate] = useState("20");

  const handleBack = () => {
    navigate("/signup/experience");
  };

  const handleNext = () => {
    console.log("Saving hourly rate:", hourlyRate);
    navigate("/signup/welcome");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4">
      <header className="absolute top-4 left-4">
        <h1 className="text-xl font-bold text-gray-800">MasterHire</h1>
      </header>
      <main className="w-full max-w-lg mx-auto flex flex-col justify-center flex-grow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Set your Hourly Rate
        </h2>
        <p className="text-gray-600 mb-10">
          Set your hourly rate based on your skills and experience. You can
          adjust it later as your profile grows.
        </p>

        <div className="flex items-center justify-between border-t border-b border-gray-100 py-8 mb-20">
          <div className="flex flex-col">
            <label
              htmlFor="hourly-rate"
              className="text-lg font-semibold text-gray-800"
            >
              Hourly Rate
            </label>
            <p className="text-gray-500 text-sm">The amount you'll receive.</p>
          </div>

          <div className="flex items-center">
            <input
              type="number"
              id="hourly-rate"
              name="hourlyRate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-lg text-right outline-none"
              placeholder="0"
              min="0"
            />
            <span className="ml-3 text-gray-600 text-lg font-medium">/hr</span>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-lg mx-auto flex justify-between items-center pt-6 pb-8">
        <button
          type="button"
          onClick={handleBack}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-12 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Complete your Profile
        </button>
      </footer>
    </div>
  );
};

export default HourlyRatePage;
