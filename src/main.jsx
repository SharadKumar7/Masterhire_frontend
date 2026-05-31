import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { SignupProvider } from "./context/SignupContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <SignupProvider>
        <App />
      </SignupProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);