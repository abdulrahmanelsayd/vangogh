import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Onboarding from './pages/Onboarding';
import HeroHub from './pages/HeroHub';
import Gallery from './pages/Gallery';
import Biography from './pages/Biography';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Onboarding />} />
      <Route path="/hub" element={<HeroHub />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/biography" element={<Biography />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
