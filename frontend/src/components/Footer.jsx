// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#ffffff] text-[#000000] py-4 shadow-inner rounded-t-xl">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left side: brand + tagline */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl pinyon-script-regular text-[#000000] leading-none ">
            VeiBelle
          </h2>
          <p className="text-[#555] text-sm font-[Poppins] mt-1">
            Your Glow Up Starts Here
          </p>
        </div>

        {/* Right side: copyright */}
        <p className="text-gray-400 text-xs font-[Poppins] mt-2 md:mt-0 text-center md:text-right">
          © 2025 VeiBelle. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
