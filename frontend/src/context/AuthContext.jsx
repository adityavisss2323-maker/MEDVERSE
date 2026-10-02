import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const DEMO_USER = {
  id: "usr_1042",
  name: "Dr. Sarah Jenkins",
  email: "sarah.jenkins@medverse.hospital",
  role: "SOC Lead Analyst",
  roleCode: "analyst",
  department: "Emergency & Critical Care",
  avatar: "SJ",
  isAuthenticated: true,
};

export function AuthProvider({ children }) {
  // Always initialize as null so every time the app/link is opened, user authentication is required first
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem("medverse_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("medverse_auth_user");
    }
  }, [user]);

  const login = async (email, password, role = "SOC Lead Analyst") => {
    // Simulated authentication delay
    await new Promise((res) => setTimeout(res, 400));
    
    const initials = email
      ? email.split("@")[0].substring(0, 2).toUpperCase()
      : "SA";

    const newUser = {
      id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email: email,
      role: role,
      roleCode: role.toLowerCase().includes("director") ? "executive" : "analyst",
      department: "Emergency & Cyber Operations",
      avatar: initials,
      isAuthenticated: true,
    };

    setUser(newUser);
    return newUser;
  };

  const register = async ({ name, email, password, role, department }) => {
    await new Promise((res) => setTimeout(res, 500));
    
    const initials = name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
      : "US";

    const newUser = {
      id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || "Authorized SOC Analyst",
      email: email,
      role: role || "SOC Lead Analyst",
      roleCode: role.toLowerCase().includes("director") ? "executive" : "analyst",
      department: department || "Emergency Operations",
      avatar: initials,
      isAuthenticated: true,
    };

    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medverse_auth_user");
  };

  const loginAsPreset = (presetType) => {
    if (presetType === "analyst") {
      setUser({
        id: "usr_1042",
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@medverse.hospital",
        role: "SOC Lead Analyst",
        roleCode: "analyst",
        department: "Emergency Operations",
        avatar: "SJ",
        isAuthenticated: true,
      });
    } else if (presetType === "executive") {
      setUser({
        id: "usr_9001",
        name: "Dr. Aris Vance",
        email: "aris.vance@medverse.hospital",
        role: "Hospital CISO & Executive Director",
        roleCode: "executive",
        department: "Executive Administration",
        avatar: "AV",
        isAuthenticated: true,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.isAuthenticated,
        login,
        register,
        logout,
        loginAsPreset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
