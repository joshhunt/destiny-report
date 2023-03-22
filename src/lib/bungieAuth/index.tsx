import React, { useState, useEffect, useMemo, useContext } from "react";
import destinyAuth from "./auth";

const log = (...args: any[]) => console.log("[AUTH PROVIDER]", ...args);

const bungieAuthContext = React.createContext({
  authLoaded: false,
  isAuthenticated: false,
});

export const BungieAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    destinyAuth((err, { isAuthenticated, isFinal }) => {
      log("Auth state update", { err, isAuthenticated, isFinal });

      if (err) {
        throw err;
      }

      setIsAuthenticated(isAuthenticated);
      setAuthLoaded(isFinal);
    });
  }, []);

  const contextValue = useMemo(() => {
    return { authLoaded, isAuthenticated };
  }, [authLoaded, isAuthenticated]);

  return (
    <bungieAuthContext.Provider value={contextValue}>
      {children}
    </bungieAuthContext.Provider>
  );
};

export const useBungieAuth = () => useContext(bungieAuthContext);
