import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';
import { useSignup } from '../../context/SignupContext';

const RoleSelection = () => {

  const navigate = useNavigate();
  const { resetSignupData, nextStep } = useSignup();

  const [selection, setSelection] = useState(() => {
    return sessionStorage.getItem('selectedRole') || null;
  });

  useEffect(() => {
    if (selection) {
      sessionStorage.setItem('selectedRole', selection);
    }
  }, [selection]);

 const handleJoin = () => {

  if (selection === "client") {
    resetSignupData("client");
    nextStep();
    navigate("/signup/client");
  }

  if (selection === "freelancer") {
    resetSignupData("freelancer");
    nextStep();
    navigate("/signup/freelancer");
  }

};

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">

      <header className="absolute top-4 left-4">
        <h1 className="font-jaro text-3xl text-gray-800">MasterHire</h1>
      </header>

      <main className="text-center">

        <h2 className="text-lg font-semibold mb-8 text-gray-800">
          Join as a Client or Freelancer
        </h2>

        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">

          {/* CLIENT */}

          <label
            className={`flex items-center p-6 border rounded-lg shadow-sm cursor-pointer w-80 bg-white ${
              selection === 'client'
                ? 'border-teal-500 ring-1 ring-teal-500'
                : 'border-gray-300 hover:border-teal-500'
            }`}
          >

            <input
              type="radio"
              name="accountType"
              checked={selection === 'client'}
              onChange={() => setSelection('client')}
              className="form-radio h-8 w-8 accent-teal-600 mr-4"
            />

            <div className="flex items-center">
              <User className="w-10 h-10 text-gray-500 mr-3" />
              <span className="text-gray-700">
                I'm a Client, hiring for a project
              </span>
            </div>

          </label>

          {/* FREELANCER */}

          <label
            className={`flex items-center p-6 border rounded-lg shadow-sm cursor-pointer w-80 bg-white ${
              selection === 'freelancer'
                ? 'border-teal-500 ring-1 ring-teal-500'
                : 'border-gray-300 hover:border-teal-500'
            }`}
          >

            <input
              type="radio"
              name="accountType"
              checked={selection === 'freelancer'}
              onChange={() => setSelection('freelancer')}
              className="form-radio h-8 w-8 accent-teal-600 mr-4"
            />

            <div className="flex items-center">
              <Briefcase className="w-10 h-10 text-gray-500 mr-3" />
              <span className="text-gray-700">
                I'm a Freelancer, looking for work
              </span>
            </div>

          </label>

        </div>

        <button
          onClick={handleJoin}
          disabled={!selection}
          className={`${
            !selection
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700'
          } text-white font-semibold py-3 px-12 rounded-lg`}
        >

          {selection
            ? `Join as a ${selection === 'client' ? 'Client' : 'Freelancer'}`
            : 'Create Account'}

        </button>

      </main>

    </div>
  );
};

export default RoleSelection;