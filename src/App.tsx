// Force rebuild: 2025-07-24 03:59 AM // Updated timestamp
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/index.tsx'; // *** FIXED: Added .tsx extension ***
import NotFound from './pages/NotFound'; // Keep NotFound for any unhandled routes

function App() {
  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          {/* Your main application logic is handled by the Index component */}
          <Route path="/" element={<Index />} />
          {/* Keep NotFound for any other direct routes that might be attempted */}
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
