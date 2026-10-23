import { createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnimaProvider } from "@animaapp/playground-react-sdk";
import { App } from "./App";

const appRoot = document.getElementById("app");

if (!appRoot) {
  throw new Error("App root element with id 'app' was not found.");
}

createRoot(appRoot).render(
  createElement(
    StrictMode,
    null,
    createElement(AnimaProvider, null, createElement(App)),
  ),
);
