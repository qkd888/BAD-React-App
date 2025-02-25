import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure styles are imported
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Bosapie Designs</Link>
        
      </div>
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/customer-orders" onClick={closeNav}>Customer Orders</Link></li>
        <li><Link to="/order-numbers" onClick={closeNav}>Order Numbers</Link></li>
        <li><Link to="/inventory" onClick={closeNav}>Inventory</Link></li>
        <li><Link to="/made-by-us" onClick={closeNav}>Made By Us</Link></li>
      </ul>
      <button className="nav-toggle" onClick={toggleNav}>
          ☰
        </button>
    </nav>
  );
}

export default Navbar;