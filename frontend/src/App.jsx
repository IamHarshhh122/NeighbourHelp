import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import MicroTasks from "./components/Microtask";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthSuccess from "./components/OAuthSuccess";
import About from "./components/About";

export default function App() {
  return (
    <Router>
      <Toaster />
      <Navbar />          
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/micro-tasks" element={<ProtectedRoute><MicroTasks /></ProtectedRoute>} />
      </Routes>
      <Footer />     
    </Router>
  );
}