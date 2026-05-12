import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";
import Dashboard from "../Dashboard";
import { api } from "../../services/api";

const App = () => {
  const [auth, setAuth] = useState({ checking: true, user: null });

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setAuth({ checking: false, user: null });
        return;
      }

      try {
        const session = await api.getSession();
        setAuth({ checking: false, user: session.user });
      } catch (_error) {
        localStorage.removeItem("auth_token");
        setAuth({ checking: false, user: null });
      }
    };

    bootstrapSession();
  }, []);

  if (auth.checking) {
    return <div className="app-loading">Checking session...</div>;
  }

  return auth.user ? (
    <BrowserRouter>
      <Dashboard user={auth.user} setAuth={setAuth} />
    </BrowserRouter>
  ) : (
    <Login setAuth={setAuth} />
  );
};

export default App;
