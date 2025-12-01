// src/components/Header.jsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logoutIcon from "../assets/logout.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  // Check login state from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("veibelle_email");
    setEmail(storedEmail);
  }, [location.pathname]); // re-check when route changes

  const handleLogout = () => {
    // Clear login data
    localStorage.removeItem("veibelle_email");
    // optional: also clear quiz data if you want a clean state
    // localStorage.removeItem("quizData");
    // localStorage.removeItem("quizStep");

    setEmail(null);
    navigate("/auth/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#e9d4d4]/95 backdrop-blur-md text-[#1a1a1a] shadow-sm z-50 rounded-b-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          {/* Left Navigation */}
          <nav className="flex gap-8 font-[Poppins] text-[17px] font-medium tracking-wide">
            <NavLink
              to="/ingredients"
              className={({ isActive }) =>
                `no-underline transition-all duration-300 ${
                  isActive
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-gray-700 hover:text-black hover:scale-105"
                }`
              }
            >
              Ingredients
            </NavLink>

            <NavLink
              to="/skincare101"
              className={({ isActive }) =>
                `no-underline transition-all duration-300 ${
                  isActive
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-gray-700 hover:text-black hover:scale-105"
                }`
              }
            >
              Skincare 101
            </NavLink>
          </nav>

          {/* Center Brand */}
          <Link
            to="/"
            className="absolute left-1/2 transform -translate-x-1/2 pinyon-script-regular text-[34px] md:text-[42px] text-black tracking-widest no-underline hover:opacity-80 transition-opacity"
          >
            VeiBelle
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <Link
              to="/history"
              className="text-[17px] font-[Poppins] font-medium text-gray-800 no-underline hover:text-black transition-colors relative group"
            >
              History
              <span className="absolute left-0 bottom-[-2px] w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/quiz"
              className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-[17px] font-[Poppins] font-medium tracking-wide shadow-lg hover:bg-[#333] hover:shadow-xl active:scale-95 transition-all duration-300 no-underline"
            >
              Take the Quiz
            </Link>

            {/* 🔓 Logout button – only when logged in */}
            {email && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-[13px] font-[Poppins] text-gray-700 hover:text-black transition-colors"
                title={`Logout ${email}`}
              >
                <img
                  src={logoutIcon}
                  alt="Logout"
                  className="w-5 h-5 object-contain"
                />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer so content does not hide behind fixed header */}
      <div className="h-[82px]"></div>
    </>
  );
};

export default Header;
