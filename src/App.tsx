// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Portfolio from './components/Portfolio';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/portfolios" element={<Portfolio />} />
            <Route
              path="/experimentals"
              element={
                <div className="page-content">
                  <h1>Experimentals</h1>
                  <p>Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/slack"
              element={
                <div className="page-content">
                  <h1>Slack Archives</h1>
                  <p>Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/refer"
              element={
                <div className="page-content">
                  <h1>Refer a Friend</h1>
                  <p>Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/gift"
              element={
                <div className="page-content">
                  <h1>Gift a Subscription</h1>
                  <p>Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/account"
              element={
                <div className="page-content">
                  <h1>Account</h1>
                  <p>Coming soon...</p>
                </div>
              }
            />
            {/* Fallback: redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
