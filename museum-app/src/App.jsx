import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GlobalNavigation from './components/GlobalNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const HeroHub = lazy(() => import('./pages/HeroHub'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Biography = lazy(() => import('./pages/Biography'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Onboarding />} />
        <Route path="/hub" element={<HeroHub />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/biography" element={<Biography />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function AppContent() {
  return (
    <>
      <a href="#main-content" className="skip-nav sans">Skip to content</a>
      <GlobalNavigation />
      <main id="main-content">
        <AnimatedRoutes />
      </main>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
