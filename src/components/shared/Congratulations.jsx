import React from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti-boom';

function Celebrate() {
  return <Confetti mode="boom" particleCount={100} colors={['#ff577f', '#ff884b']} />;
}

const WelcomeOnboardScreen = () => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate('/');
  };


  return (
    
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center w-full max-w-lg">
        <div className="mb-12 absolute top-4 left-4">
          <span className="text-3xl font-jaro text-gray-800">MasterHire</span>
        </div>
        <Celebrate />

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome on board!</h1>
          <p className="text-lg text-gray-500">
            Congratulations on successfully creating your <strong>MasterHire</strong> account.
          </p>
        </div>

        <div>
          <button
            onClick={handleGoToProfile}
            className="w-full max-w-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-4 rounded-lg transition duration-200 shadow-lg"
          >
            Go to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboardScreen;
