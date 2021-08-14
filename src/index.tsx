import React from "react";
import { hydrate, render } from "react-dom";
import "./index.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const Site = () => {
  return <App />;
};

const rootElement = document.getElementById("root");

if (rootElement && window.location.pathname !== "/") {
  rootElement.innerHTML = "";
}

if (
  rootElement &&
  rootElement.hasChildNodes() &&
  window.location.pathname === "/"
) {
  hydrate(<Site />, rootElement);
} else {
  render(<Site />, rootElement);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
