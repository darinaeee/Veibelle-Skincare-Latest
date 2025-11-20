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

function App() {
  return (
    <Routes>
      {/* All pages use the same Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/skincare101" element={<Skincare101 />} />
        <Route path="/history" element={<History />} />
<Route path="/history-details" element={<HistoryDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
