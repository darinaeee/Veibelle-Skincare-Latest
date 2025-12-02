// src/pages/Verified.jsx
import React from "react";

const Verified = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-white p-8 rounded-pill shadow-md w-full max-w-md text-center">
      <h2 className="font-['Cinzel'] text-2xl mb-3">Email Verified</h2>
      <p className="font-['Poppins'] text-sm text-gray-600 mb-4">
        Your login has been confirmed. You can now return to the VeiBelle tab
        and continue your skincare quiz.
      </p>
      <p className="text-xs text-gray-400 font-['Poppins']">
        You may safely close this window.
      </p>
    </div>
  </div>
);

export default Verified;
