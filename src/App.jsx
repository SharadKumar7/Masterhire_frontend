import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";
import StepGuard from "./components/common/StepGuard";
import WelcomeMsge from "./components/shared/Congratulations";

import { AuthProvider } from "./context/AuthContext";
import { JobPostProvider } from "./context/JobPostContext";

/* ───────────────────────── PUBLIC PAGES ──────────────────────── */
import About from "./pages/public/About";
import FeedBack from "./pages/public/Feedback";
import HelpSupport from "./pages/public/HelpSupport";
import HowItWorks from "./pages/public/HowItWorks";
import Landingpage from "./pages/public/Landingpage";
import OurImpact from "./pages/public/OurImpact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import SafetySecurity from "./pages/public/SafetySecurity";
import TermsOfService from "./pages/public/TermsOfService";

/* ───────────────────────── AUTH PAGES ────────────────────────── */
import ForgetPassword from "./pages/auth/ForgetPasswordPage";
import Login from "./pages/auth/LoginPage";

/* ───────────────────────── SIGNUP FLOW ───────────────────────── */
import SignupLayout from "./pages/signup/SignupLayout";
import SelectionSignup from "./pages/signup/RoleSelectionPage";

/* Client Signup */
import ClientSignup from "./pages/signup/client/Clientsignup";
import ClientOtp from "./pages/signup/client/clientOtpVerification";

/* Freelancer Signup */
import FreelancerSignupForm from "./pages/signup/freelancer/Step01SignupLayout";
import BasicDetailsForm from "./pages/signup/freelancer/Step02BasicDetails";
import FreelancerOtp from "./pages/signup/freelancer/Step02OtpVerification";
import DomainSelection from "./pages/signup/freelancer/Step03DomainSelection";
import SkillSelection from "./pages/signup/freelancer/Step04SkillsSelection";
import TitleBioForm from "./pages/signup/freelancer/Step05TitleBio";
import ExperiencePage from "./pages/signup/freelancer/Step06WorkExperience";
import EducationPage from "./pages/signup/freelancer/Step07Education";
import LanguageSelection from "./pages/signup/freelancer/Step08LanguageSelection";

/* ───────────────────── CLIENT DASHBOARD ──────────────────────── */
import ClientDashboard from "./pages/dashboard/client/ClientDashboard";
import ClientBody from "./pages/dashboard/client/ClientBody";
import ClientAccountSettings from "./pages/dashboard/client/AccountSetting";
import FreelancerProfile from "./pages/dashboard/client/FreelancerProfile";

import Budget from "./pages/dashboard/client/Menu/Jobpost/Budget";
import BasicInfo from "./pages/dashboard/client/Menu/Jobpost/BasicDetails";
import ReviewPost from "./pages/dashboard/client/Menu/Jobpost/ReviewPost";
import Visibility from "./pages/dashboard/client/Menu/Jobpost/Visibility";

import Filter from "./pages/dashboard/client/Menu/SearchFreelancers";
import HiredTalentsList from "./pages/dashboard/client/Menu/TalentHired";
import SavedProfiles from "./pages/dashboard/client/Menu/SavedProfiles";

import ClientApplication from "./pages/dashboard/client/projectAppilcation/ApplicationBody";
import ProjectEditJob from "./pages/dashboard/client/projectAppilcation/ProjectEditJob";
import WorkspacePage from "./pages/dashboard/client/workspace/ProjectWorkspaceBody";

/* ─────────────────── FREELANCER DASHBOARD ────────────────────── */
import FreelancerDashboard from "./pages/dashboard/freelancer/FreelancerDashboard";
import FreelancerBody from "./pages/dashboard/freelancer/FreelancerBody";
import FreelancerAccountSettings from "./pages/dashboard/freelancer/AccountSetting";

import ActiveContractsPage from "./pages/dashboard/freelancer/Menu/ActiveContracts";
import AppliedJobsPage from "./pages/dashboard/freelancer/Menu/AppliedJob";
import ProfilePage from "./pages/dashboard/freelancer/Menu/Profile";
import SavedJobsPage from "./pages/dashboard/freelancer/Menu/SavedJob";
import SearchJob from "./pages/dashboard/freelancer/Menu/SearchJob";

import JobApplication from "./pages/dashboard/freelancer/JobApplication";
import JobDetailsPage from "./pages/dashboard/freelancer/JobDetailsPage";
import Workspace from "./pages/dashboard/freelancer/workspace/WorkspaceBody";

/* ───────────────────────── SHARED PAGES ──────────────────────── */
import ResourceHelp from "./pages/dashboard/shared/ResourceHelp";

const App = () => {
  return (
    <AuthProvider>
      <JobPostProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landingpage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/our-impact" element={<OurImpact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/safety-security" element={<SafetySecurity />} />
            <Route path="/feedback" element={<FeedBack />} />
            <Route path="/help-support" element={<HelpSupport />} />

            {/* Signup Flow */}
            <Route path="/signup" element={<SignupLayout />}>
              <Route index element={<SelectionSignup />} />

              {/* Client */}
              <Route
                path="client"
                element={
                  <StepGuard stepRequired={2}>
                    <ClientSignup />
                  </StepGuard>
                }
              />

              <Route
                path="client/otp"
                element={
                  <StepGuard stepRequired={3}>
                    <ClientOtp />
                  </StepGuard>
                }
              />

              <Route
                path="client/welcome"
                element={
                  <StepGuard stepRequired={4}>
                    <WelcomeMsge />
                  </StepGuard>
                }
              />

              {/* Freelancer */}
              <Route
                path="freelancer"
                element={
                  <StepGuard stepRequired={2}>
                    <FreelancerSignupForm />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/otp"
                element={
                  <StepGuard stepRequired={3}>
                    <FreelancerOtp />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/details"
                element={
                  <StepGuard stepRequired={4}>
                    <BasicDetailsForm />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/domain"
                element={
                  <StepGuard stepRequired={5}>
                    <DomainSelection />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/skills"
                element={
                  <StepGuard stepRequired={6}>
                    <SkillSelection />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/bio"
                element={
                  <StepGuard stepRequired={7}>
                    <TitleBioForm />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/experience"
                element={
                  <StepGuard stepRequired={8}>
                    <ExperiencePage />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/education"
                element={
                  <StepGuard stepRequired={9}>
                    <EducationPage />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/languages"
                element={
                  <StepGuard stepRequired={10}>
                    <LanguageSelection />
                  </StepGuard>
                }
              />

              <Route
                path="freelancer/welcome"
                element={
                  <StepGuard stepRequired={11}>
                    <WelcomeMsge />
                  </StepGuard>
                }
              />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Client Dashboard */}
              <Route path="/client">
                <Route path="dashboard" element={<ClientDashboard />}>
                  <Route index element={<ClientBody />} />

                  <Route path="filter" element={<Filter />} />

                  <Route path="post-job" element={<BasicInfo />} />
                  <Route path="post-job/budget" element={<Budget />} />
                  <Route path="post-job/visibility" element={<Visibility />} />
                  <Route path="post-job/reviewpost" element={<ReviewPost />} />

                  <Route
                    path="freelancer-profile/:id"
                    element={<FreelancerProfile />}
                  />

                  <Route path="workspace/:id" element={<WorkspacePage />} />

                  <Route
                    path="applications/:id"
                    element={<JobApplication />}
                  />

                  <Route
                    path="project-applications/:id"
                    element={<ClientApplication />}
                  />

                  <Route
                    path="project-editjob/:id"
                    element={<ProjectEditJob />}
                  />

                  <Route path="settings" element={<ClientAccountSettings />} />
                  <Route path="resourceshelp" element={<ResourceHelp />} />
                  <Route
                    path="hired-talents"
                    element={<HiredTalentsList />}
                  />
                  <Route
                    path="saved-profiles"
                    element={<SavedProfiles />}
                  />
                </Route>
              </Route>

              {/* Freelancer Dashboard */}
              <Route path="/freelancer">
                <Route
                  path="dashboard"
                  element={<FreelancerDashboard />}
                >
                  <Route index element={<FreelancerBody />} />

                  <Route path="resourceshelp" element={<ResourceHelp />} />
                  <Route
                    path="contracts"
                    element={<ActiveContractsPage />}
                  />

                  <Route path="workspace/:id" element={<Workspace />} />

                  <Route
                    path="job-details/:id"
                    element={<JobDetailsPage />}
                  />

                  <Route path="filter" element={<SearchJob />} />

                  <Route
                    path="saved-jobs"
                    element={<SavedJobsPage />}
                  />

                  <Route
                    path="applied-jobs"
                    element={<AppliedJobsPage />}
                  />

                  <Route path="profile" element={<ProfilePage />} />

                  <Route
                    path="settings"
                    element={<FreelancerAccountSettings />}
                  />

                  <Route
                    path="applications/:id"
                    element={<JobApplication />}
                  />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Router>
      </JobPostProvider>
    </AuthProvider>
  );
};

export default App;