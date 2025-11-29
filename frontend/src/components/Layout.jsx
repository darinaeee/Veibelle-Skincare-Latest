// src/components/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    // ❗ letak bg kat root sekali supaya full width warna sama
    <div className="min-h-screen flex flex-col bg-[#f1eaea]">
      <Header />

      <main
        className={
          isHome
            ? "flex-grow p-0 m-0" // Home: hero full-bleed, tiada padding
            : "flex-grow w-full bg-[#f1eaea] px-0 py-8" // Pages lain: full width, kurang padding & tiada container
        }
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
