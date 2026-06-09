import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const apiUrl = import.meta.env.VITE_API_URL;

const BASE_URL = `${apiUrl}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD USER ON REFRESH
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }


      
      try {
        const res = await fetch(`${BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data); // { role, userId, fullName }
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // 🔐 LOGIN
  // 🔐 LOGIN
const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message };
  }

  console.log("Login successful, received data:", data);

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  setToken(data.token);
  setUser({
    role: data.role,
    userId: data.userId,
    fullName: data.fullName,
    isProfileComplete: data.isProfileComplete, // ✅ add this
  });

  return {
    success: true,
    role: data.role,
    isProfileComplete: data.isProfileComplete, // ✅ add this
  };
};
  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, setToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);