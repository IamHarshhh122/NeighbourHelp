import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';

// Success Page Component
function SuccessPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', color: '#db2777', marginBottom: '10px' }}>Login Successful! 🎉</h1>
      <p style={{ fontSize: '18px', color: '#94a3b8' }}>Kaam ho gaya, bro!</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Root path par Login component chalega */}
        <Route path="/" element={<Login />} />
        
        {/* Success page route */}
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}