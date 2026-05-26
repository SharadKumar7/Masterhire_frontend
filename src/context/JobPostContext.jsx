import React, { createContext, useState, useContext, useCallback } from "react";

const JobPostContext = createContext();

const initialState = {
  // 🔥 MATCH BACKEND
  title: "",
  skills: [],
  description: "",
  experienceLevel: "",
  budget: 0,
  deadline: "",
  visibility: "Public",
  allowNegotiation: false,
  status: "draft",
};

export const JobPostProvider = ({ children }) => {
  const [jobData, setJobData] = useState(initialState);

  const updateJobData = useCallback((newData) => {
    setJobData((prev) => ({ ...prev, ...newData }));
  }, []);

  const clearJobData = useCallback(() => {
    setJobData(initialState);
  }, []);

  return (
    <JobPostContext.Provider value={{ jobData, updateJobData, clearJobData }}>
      {children}
    </JobPostContext.Provider>
  );
};

export const useJobPost = () => useContext(JobPostContext);