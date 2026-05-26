import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Camera, X, AlertCircle } from "lucide-react";
import { useSignup } from "../../../context/SignupContext";
import Loader from "../../common/Loader";

const BasicDetailsForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { progress, startLoading, stopLoading, signupData, updateSignupData,nextStep } =
    useSignup();

  const [formData, setFormData] = useState(signupData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    updateSignupData({ [id]: value });
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: false }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhoto = { ...formData, photo: reader.result };
        setFormData(updatedPhoto);
        updateSignupData({ photo: reader.result });
        setErrors((prev) => ({ ...prev, photo: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, photo: null }));
    updateSignupData({ photo: null });
  };

  const handleNext = (e) => {
  e.preventDefault();

  const fieldsToValidate = [
    "dob",
    "gender",
    "streetAddress",
    "city",
    "state",
    "zip",
    "mobile",
  ];

  const newErrors = {};
  fieldsToValidate.forEach((field) => {
    if (!formData[field]) newErrors[field] = true;
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  startLoading();

  try {
    updateSignupData(formData);

    setTimeout(() => {
      stopLoading();
      nextStep();
      navigate("/signup/freelancer/domain");
    }, 600);

  } catch (error) {
    console.error("Error saving data", error);
    stopLoading();
  }
};

  const getBorderClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-teal-500 outline-none transition-colors ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const ErrorText = ({ fieldName, label }) =>
    errors[fieldName] ? (
      <div className="flex items-center gap-1 mt-1 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">{label} is required</p>
      </div>
    ) : null;

  return (
    <>
      <Loader progress={progress} />
      <div className="min-h-screen bg-white flex justify-center items-center p-4">
        <div className="w-full max-w-2xl bg-white p-8">
          <header className="absolute top-4 left-4">
            <h1 className="text-3xl font-jaro text-gray-800">MasterHire</h1>
          </header>

          <main>
            <h2 className="text-lg font-semibold mb-8 text-gray-800 flex justify-center">
              Enter your basic details
            </h2>

            <form className="space-y-6" onSubmit={handleNext}>
              <div className="flex gap-8 items-start">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`flex-shrink-0 w-40 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-gray-50 transition overflow-hidden relative group `}
                >
                  {formData.photo ? (
                    <>
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={handleRemovePhoto}
                          className="p-2 bg-gray-600 text-white rounded-full mx-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current.click();
                          }}
                          className="p-2 bg-gray-600 text-white rounded-full mx-2"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className={`w-8 h-8 mb-2 text-gray-400`} />
                      <span className="text-xs text-gray-500 text-center px-2">
                        Click to upload photo
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="flex-grow space-y-6">
                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date of birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={getBorderClass("dob")}
                    />
                    <ErrorText fieldName="dob" label="Date of birth" />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`${getBorderClass("gender")} bg-white appearance-none`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute inset-y-0 right-3 flex items-center pointer-events-none w-4 h-4 my-auto text-gray-400" />
                    </div>
                    <ErrorText fieldName="gender" label="Gender" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="streetAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className={getBorderClass("streetAddress")}
                />
                <ErrorText fieldName="streetAddress" label="Street Address" />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={getBorderClass("city")}
                  />
                  <ErrorText fieldName="city" label="City" />
                </div>
                <div className="w-1/3">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={getBorderClass("state")}
                  />
                  <ErrorText fieldName="state" label="State/Province" />
                </div>
                <div className="w-1/3">
                  <label
                    htmlFor="zip"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ZIP/Postal code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className={getBorderClass("zip")}
                  />
                  <ErrorText fieldName="zip" label="ZIP/Postal code" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mobile No.
                </label>
                <div className="flex items-center">
                  <div className="flex items-center border border-gray-300 bg-gray-50 p-2 rounded-l-lg h-[42px] border-r-0">
                    <div className="w-6 h-4 bg-white relative mr-1 border border-gray-200">
                      <div className="absolute top-0 w-full h-1/3 bg-[#FF9933]"></div>
                      <div className="absolute bottom-0 w-full h-1/3 bg-[#128807]"></div>
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#000080]"></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 ml-1">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={getBorderClass("mobile")}
                    placeholder="Enter mobile number"
                  />
                </div>
                <ErrorText fieldName="mobile" label="Mobile No." />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Next
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
};

export default BasicDetailsForm;
