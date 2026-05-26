import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";
import { AlertCircle } from "lucide-react";

const domainData = {
  "Accounting & Consulting": [
    "Personal & Professional Coaching",
    "Accounting & Book-keeping",
    "Financial Planning",
    "Recruiting & Human Resources",
    "Management Consulting",
    "Other - Accounting & Consulting",
  ],
  "Admin Support": [
    "Data Entry & Transcription Services",
    "Virtual Assistance",
    "Project Management",
    "Market Research & Product Reviews",
  ],
  "Data Science & Analytics": [
    "Data Analysis & Reporting",
    "Data Extraction/ETL",
    "Data Mining & Management",
    "AI & Machine Learning",
  ],
  "Design & Creativity": [
    "Art & Illustration",
    "Branding & Logo Design",
    "NFT, AR/VR & Game Art",
    "Graphic, Editorial & Presentation Design",
    "Photography",
    "Product Design",
    "Video & Animation",
  ],
  "IT & Networking": [
    "Database Management & Administration",
    "ERP/CRM Software",
    "Information Security & Compliance",
    "Network & System Administration",
    "DevOps & Solution Architecture",
  ],
  "Sales Marketing": [
    "Digital Marketing",
    "Lead Generation & Telemarketing",
    "Marketing, PR & Brand Strategy",
  ],
  "Web, Mobile & Software Dev": [
    "Blockchain, NFT & Cryptocurrency",
    "AI Apps & Integration",
    "Desktop Application Development",
    "Ecommerce Development",
    "Game Design & Development",
    "Mobile Development",
    "Other-Software Development",
    "QA Testing",
    "Web & Mobile Design",
    "Web Development",
  ],
};

const DomainSelectionCorrected = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData, progress, startLoading, stopLoading, nextStep } =
    useSignup();

  const categories = Object.keys(domainData);

  const [selectedCategory, setSelectedCategory] = useState(
    signupData.selectedCategory || categories[0],
  );
  const [selectedSpecialities, setSelectedSpecialities] = useState(
    signupData.selectedSpecialities || [],
  );
  const [error, setError] = useState(false);

  const availableSpecialities = useMemo(() => {
    return domainData[selectedCategory] || [];
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSpecialities([]);
    updateSignupData({ selectedCategory: category, selectedSpecialities: [] });
    setError(false);
  };

  const handleSpecialityChange = (e) => {
    const value = e.target.value;
    let updatedSpecialities = [];

    if (selectedSpecialities.includes(value)) {
      updatedSpecialities = selectedSpecialities.filter(
        (item) => item !== value,
      );
    } else if (selectedSpecialities.length < 3) {
      updatedSpecialities = [...selectedSpecialities, value];
    } else {
      return;
    }

    setSelectedSpecialities(updatedSpecialities);
    updateSignupData({ selectedSpecialities: updatedSpecialities });
    if (updatedSpecialities.length > 0) setError(false);
  };

  const handleNext = () => {
  if (selectedSpecialities.length === 0) {
    setError(true);
    return;
  }

  startLoading();

  try {
    // save data to context
    updateSignupData({
      selectedCategory,
      selectedSpecialities,
    });

    setTimeout(() => {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/skills");
    }, 600);

  } catch (error) {
    console.error("Error saving data", error);
    stopLoading();
  }
};

  const handleBack = async () => {
    startLoading();
    await stopLoading();
    navigate("/signup/freelancer/details");
  };

  return (
    <>
      <Loader progress={progress} />

      <div className="min-h-screen bg-white flex justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white p-8">
          <header className="absolute top-4 left-4">
            <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
          </header>

          <main>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Select your professional domain
            </h2>
            <p className="text-gray-600 mb-10">
              Choose the domain that best represents your expertise, then select
              up to three specializations.
            </p>

            <div
              className={`flex border rounded-lg overflow-hidden transition-colors ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
            >
              <div className="w-1/2 p-6 bg-gray-50 border-r border-gray-200">
                <h3 className="text-sm font-semibold mb-4 text-gray-800">
                  Select Category
                </h3>
                <ul className="space-y-3">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className={`p-3 rounded-lg cursor-pointer transition duration-150 ease-in-out ${
                        selectedCategory === category
                          ? "bg-teal-100 text-teal-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-1/2 p-6 bg-white">
                <h3 className="text-sm font-semibold mb-4 text-gray-800">
                  Choose 1 to 3 specialities
                </h3>
                <div className="space-y-4">
                  {availableSpecialities.map((speciality) => (
                    <label
                      key={speciality}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        value={speciality}
                        checked={selectedSpecialities.includes(speciality)}
                        onChange={handleSpecialityChange}
                        className="form-checkbox h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                      />
                      <span
                        className={`ml-3 transition-colors ${selectedSpecialities.includes(speciality) ? "text-teal-600 font-medium" : "text-gray-700"}`}
                      >
                        {speciality}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1 mt-4 text-red-500 justify-center">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-medium">
                  {" "}
                  Please select at least one speciality to continue.
                </p>
              </div>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-12 border border-gray-300 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DomainSelectionCorrected;
