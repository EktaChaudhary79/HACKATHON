import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("aeroway_current_user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const signup = (userData) => {
    const users = JSON.parse(localStorage.getItem("aeroway_users")) || [];

    const userExists = users.find(
      (u) => u.email === userData.email
    );

    if (userExists) {
      throw new Error("User already exists. Please sign in.");
    }

    users.push(userData);
    localStorage.setItem("aeroway_users", JSON.stringify(users));
    localStorage.setItem(
      "aeroway_current_user",
      JSON.stringify(userData)
    );
    setUser(userData);
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("aeroway_users")) || [];

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem(
      "aeroway_current_user",
      JSON.stringify(foundUser)
    );
    setUser(foundUser);
  };

  const logout = () => {
    localStorage.removeItem("aeroway_current_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
