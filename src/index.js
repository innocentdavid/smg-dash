import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
/* import "./custom.css"; */
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";

/* import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; */
import "./index.css";
import { ThemeProvider } from "@material-tailwind/react";
import './i18n.js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <Suspense fallback="Loading...">
    <BrowserRouter>
      <ThemeProvider>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </ThemeProvider>
    </BrowserRouter>
  </Suspense>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
