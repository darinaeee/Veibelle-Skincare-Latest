import { useState } from "react";
import { supabase } from "../supabaseClient";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setStatus("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:5173/auth/callback",
        // For production:
        // emailRedirectTo: "https://veibelleskin-darlinas-projects.vercel.app/auth/callback",
      },
    });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("✨ Magic link sent! Check your email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff5f8]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign in to VeiBelle</h2>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border rounded-lg p-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition"
          >
            Send Magic Link
          </button>
        </form>

        {status && <p className="mt-3 text-center text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default EmailLogin;
