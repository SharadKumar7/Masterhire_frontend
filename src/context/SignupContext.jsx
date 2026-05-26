import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  useMemo
} from "react";

const SignupContext = createContext();

export const SignupProvider = ({ children }) => {

  const initialSignupState = {
    role: "",
    step: 1,

    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    terms: false,

    photo: null,
    dob: "",
    gender: "",
    mobile: "",

    streetAddress: "",
    city: "",
    state: "",
    zip: "",

    selectedCategory: "Accounting & Consulting",
    selectedSpecialities: [],

    skills: [],
    title: "",
    bio: "",

    experiences: [],
    education: [],
    languages: []
  };

  const [signupData, setSignupData] = useState(initialSignupState);

  const updateSignupData = (newData) => {
    setSignupData((prev) => ({
      ...prev,
      ...newData
    }));
  };

  useEffect(() => {
    localStorage.setItem("signupData", JSON.stringify(signupData));
  }, [signupData]);


  const resetSignupData = (type) => {

  const newState = {
    ...initialSignupState,
    role: type,
    step: 1
  };

  setSignupData(newState);

  localStorage.setItem("signupData", JSON.stringify(newState));
};

const nextStep = () => {
  setSignupData(prev => ({
    ...prev,
    step: prev.step + 1
  }));
};

const prevStep = () => {
  setSignupData(prev => ({
    ...prev,
    step: prev.step - 1
  }));
};

  // Progress Loading System
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const startLoading = () => {
    setProgress(10);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 200);
  };

  

  const stopLoading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setProgress(100);

    setTimeout(() => {
      setProgress(0);
    }, 400);
  };

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Memoized context value to prevent unnecessary renders
  const value = useMemo(() => ({
    signupData,
    updateSignupData,
    resetSignupData,
    progress,
    startLoading,
    stopLoading,
    nextStep,
    prevStep
  }), [signupData, progress]);

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  return useContext(SignupContext);
};