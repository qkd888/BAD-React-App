import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CustomerOrders from './pages/CustomerOrders';
import OrderNumbers from './pages/OrderNumbers';
import Inventory from './pages/Inventory';
import MadeByUs from './pages/MadeByUs';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer-orders" element={<CustomerOrders />} />
          <Route path="/order-numbers" element={<OrderNumbers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/made-by-us" element={<MadeByUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
