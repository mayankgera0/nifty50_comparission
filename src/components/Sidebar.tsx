// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

type Scheme = 'light' | 'dark';
const STORAGE_KEY = 'color-scheme';

function getSystemScheme(): Scheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const Sidebar: React.FC = () => {
  const [scheme, setScheme] = useState<Scheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Scheme) || getSystemScheme();
    } catch {
      return getSystemScheme();
    }
  });

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-color-scheme', scheme);
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch {}
  }, [scheme]);

  const toggle = () => setScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <nav className="sidebar">
      <div className="sidebar__header">
        <div className="logo">
          <div className="logo__icon">CM</div>
          <div className="logo__text">
            <h3>CapitalMind</h3>
            <span>Premium</span>
          </div>
        </div>

        {/* Simple theme button */}
        <button type="button" className="sidebar__theme-btn btn btn--secondary" onClick={toggle}>
          {scheme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      <div className="sidebar__nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/home" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">🏠</span>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/portfolios" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">📊</span>
              Portfolios
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/experimentals" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">🧪</span>
              Experimentals
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/slack" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">💬</span>
              Slack Archives
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/refer" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">👥</span>
              Refer a friend
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/gift" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">🎁</span>
              Gift a subscription
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/account" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">👤</span>
              Account
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
