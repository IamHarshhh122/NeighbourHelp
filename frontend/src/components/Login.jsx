import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  // Step 1: Send OTP to real Gmail via Backend
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/send-otp", { email });
      if (res.data.success) {
        toast.success("OTP sent to your real Gmail inbox!");
        setStep(2); // Move to OTP input screen
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Make sure the email exists!");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", { email, otp });
      if (res.data.success) {
        toast.success("Login Successful! 🎉");
        navigate("/success");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', backgroundColor: '#0f172a', margin: '0', padding: '0', boxSizing: 'border-box' }}>
      
      <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #334155' }}>
        
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
          {step === 1 ? "Sign in to continue to NeighbourHelp" : "Enter the 6-digit OTP sent to your email"}
        </p>

        {/* Google Login Button (Sirf Step 1 par dikhega) */}
        {step === 1 && (
          <>
            <button
              onClick={handleGoogleLogin}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#fff', color: '#334155', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}
            >
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', margin: '15px 0' }}>or continue with email</div>
          </>
        )}

        {/* Step 1 Form: Email Input */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your real Gmail"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />

            <button
              type="submit"
              style={{ width: '100%', backgroundColor: '#db2777', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
            >
              {isLoading ? "Sending OTP..." : "Get OTP"}
            </button>
          </form>
        ) : (
          /* Step 2 Form: OTP Input */
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              maxLength={6}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none', textAlign: 'center', letterSpacing: '4px', fontSize: '18px', boxSizing: 'border-box' }}
            />

            <button
              type="submit"
              style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#db2777', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;