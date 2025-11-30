import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying login...");

  useEffect(() => {
    const verify = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setMessage("Login failed. Try again.");
        return;
      }

      const user = data.user;

      localStorage.setItem("veibelle_email", user.email);
      localStorage.setItem("veibelle_user_id", user.id);

      setMessage("Login successful! Redirecting...");

      setTimeout(() => navigate("/quiz"), 1200);
    };

    verify();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff5f8]">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md text-center">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
