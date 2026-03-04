import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GlobalNavigation from './components/GlobalNavigation';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const HeroHub = lazy(() => import('./pages/HeroHub'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Biography = lazy(() => import('./pages/Biography'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div style={{ backgroundColor: '#000', width: '100vw', height: '100vh', position: 'fixed', zIndex: 99999 }} />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Onboarding />} />
        <Route path="/hub" element={<HeroHub />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/biography" element={<Biography />} />
      </Routes>
    </Suspense>
  );
}

function AppContent() {
  return (
    <>
      <GlobalNavigation />
      <AnimatedRoutes />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
