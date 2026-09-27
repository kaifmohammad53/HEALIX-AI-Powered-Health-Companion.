import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from './Homepage/Hero'
import Hero_TrustBanner from './Homepage/Hero_TrustBanner';
import Hero_stats from './Homepage/Hero_stats';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/register" element={<div>Register Page</div>} />

          <Route path="/login" element={<div>Login Page</div>} />

          <Route path="/get-started" element={<div>Get Started Page</div>} />

          <Route path="/how-it-works" element={<div>How It Works Page</div>} />
        </Routes>
      </BrowserRouter>
      <Hero_TrustBanner />
      <Hero_stats />
    </>
  );
}

export default App
