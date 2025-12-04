import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
import Ingredients from "./pages/Ingredients";
import Dashboard from "./pages/Dashboard";
import Skincare101 from "./pages/Skincare101";
import History from "./pages/History";
import HistoryDetails from "./pages/HistoryDetails";
import EmailLogin from "./pages/EmailLogin";
{/*import Verified from "./pages/Verified";*/}
import AuthCallback from "./pages/AuthCallback";
import MfaSetup from "./pages/MfaSetup";
import MfaVerify from "./pages/MfaVerify";

function App() {
  return (
    <Routes>
      {/* Layout wrapper for all pages */}
      <Route path="/" element={<Layout />}>
        
        {/* Pages */}
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="skincare101" element={<Skincare101 />} />
        <Route path="history" element={<History />} />
        <Route path="history-details" element={<HistoryDetails />} />
        <Route path="/auth/login" element={<EmailLogin />} />
        {/*<Route path="/auth/verified" element={<Verified />} />*/}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/mfa/setup" element={<MfaSetup />} />
        <Route path="/mfa/verify" element={<MfaVerify />} />


      </Route>
    </Routes>
  );
}

export default App;
