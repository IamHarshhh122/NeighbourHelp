import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile'; // 1. Profile import karo
import MicroTasks from "./components/Microtask";
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} /> {/* 2. Profile route yahan daalo */}
        <Route path="/micro-tasks" element={<MicroTasks />} />
      </Routes>
    </Router>
  );
} 