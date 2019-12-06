import React from "react";
import { useLocation } from "./history";
import App from "./App";

const Router = () => {
  const location = useLocation();

  switch (location.pathname) {
    case "":
    case "/":
      return <App />;
  }
};
