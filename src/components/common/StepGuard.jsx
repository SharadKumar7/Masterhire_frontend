import { Navigate } from "react-router-dom";
import { useSignup } from "../../context/SignupContext";

const StepGuard = ({ stepRequired, children }) => {

  const { signupData } = useSignup();

  if (signupData.step < stepRequired) {

    const redirectPath =
      signupData.userType === "client"
        ? "/signup"
        : "/signup";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default StepGuard;