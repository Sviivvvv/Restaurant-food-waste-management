import React, { createContext, useContext, useEffect, useState } from "react";
import { login_request, get_current_user_request } from "../api/auth_api";

const AuthContext = createContext(null);

// makes the logged in user and login and logout actions available to the whole app
export function AuthProvider({ children }) {
  const [current_user, set_current_user] = useState(null);
  const [is_loading, set_is_loading] = useState(true);

  // on first load, checks if a token was saved from a previous session and restores it
  useEffect(() => {
    const saved_token = localStorage.getItem("waste_tracker_token");
    if (!saved_token) {
      set_is_loading(false);
      return;
    }
    get_current_user_request()
      .then((user) => set_current_user(user))
      .catch(() => {
        localStorage.removeItem("waste_tracker_token");
      })
      .finally(() => set_is_loading(false));
  }, []);

  // logs the user in, saves the token, and stores the user in state
  async function login(email, password) {
    const data = await login_request(email, password);
    localStorage.setItem("waste_tracker_token", data.token);
    set_current_user(data.user);
    return data.user;
  }

  // clears the saved session and logs the user out
  function logout() {
    localStorage.removeItem("waste_tracker_token");
    set_current_user(null);
  }

  const value = { current_user, is_loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook used by any component that needs the logged in user
export function useAuth() {
  return useContext(AuthContext);
}
