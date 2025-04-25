import React from 'react';
import './Navbar.css';

function Navbar({ darkMode, toggleDarkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Twitter Lite</div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><button onClick={toggleDarkMode} className="darkmode-btn">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
