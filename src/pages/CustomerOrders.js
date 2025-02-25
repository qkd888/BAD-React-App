import React, { useState, useEffect } from 'react';
import '../index.css';
import '../customer-orders.css';


function CustomerOrders() {
  // State management
  const [orders, setOrders] = useState([]);
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    contactNumber: '',
    sku: '',
    description: '',
    quantity: '',
    amount: '',
    total: ''
  });

  // Load jsPDF dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Load saved data from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('savedOrders')) || [];
    const savedOrderNumber = parseInt(localStorage.getItem('currentOrderNumber')) || 1;
    setOrders(savedOrders);
    setCurrentOrderNumber(savedOrderNumber);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Format order number
  const formatOrderNumber = (num) => `BA-${num.toString().padStart(4, '0')}`;

  // Format currency in ZAR
  const formatZAR = (number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(number);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      // Calculate total when quantity or amount changes
      if (id === 'quantity' || id === 'amount') {
        const quantity = parseFloat(newData.quantity) || 0;
        const amount = parseFloat(newData.amount) || 0;
        newData.total = (quantity * amount).toFixed(2);
      }
      return newData;
    });
  };

  // Add order
  const addOrder = (e) => {
    e.preventDefault();
    if (!Object.values(formData).every(val => val.trim() !== '')) {
      alert('Please fill in all fields');
      return;
    }

    const newOrder = {
      orderNumber: formatOrderNumber(currentOrderNumber),
      ...formData,
      quantity: parseFloat(formData.quantity),
      amount: parseFloat(formData.amount),
      total: parseFloat(formData.total),
      date: new Date().toISOString()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    setCurrentOrderNumber(prev => {
      const newNumber = prev + 1;
      localStorage.setItem('currentOrderNumber', newNumber);
      return newNumber;
    });
    setFormData({
      clientName: '',
      contactNumber: '',
      sku: '',
      description: '',
      quantity: '',
      amount: '',
      total: ''
    });
  };

  // Delete order
  const deleteOrder = (index) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = orders.filter((_, i) => i !== index);
      setOrders(updatedOrders);
      localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    }
  };

  // Generate PDF
  const generatePDF = (order) => {
    if (!window.jspdf) {
      alert('PDF library not loaded yet. Please try again in a moment.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont('helvetica');
    doc.setFontSize(24);
    doc.text('Bosapie Designs', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('INVOICE', 105, 35, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Order Number: ${order.orderNumber}`, 20, 50);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 60);
    doc.text('Bill To:', 20, 80);
    doc.setFontSize(11);
    doc.text(`${order.clientName}`, 20, 90);
    doc.text(`Contact: ${order.contactNumber}`, 20, 100);

    const tableStart = 120;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SKU', 20, tableStart);
    doc.text('Description', 40, tableStart);
    doc.text('Quantity', 110, tableStart);
    doc.text('Amount', 140, tableStart);
    doc.text('Total', 170, tableStart);
    doc.line(20, tableStart + 2, 200, tableStart + 2);
    
    doc.setFont('helvetica', 'normal');
    const contentStart = tableStart + 10;
    doc.text(order.sku, 20, contentStart);
    doc.text(order.description, 40, contentStart);
    doc.text(order.quantity.toString(), 110, contentStart);
    doc.text(formatZAR(order.amount), 140, contentStart);
    doc.text(formatZAR(order.total), 170, contentStart);
    
    doc.line(20, contentStart + 5, 200, contentStart + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 160, contentStart + 15);
    doc.text(formatZAR(order.total), 170, contentStart + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 105, 250, { align: 'center' });
    
    doc.save(`${order.orderNumber}-${order.clientName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="page" id="customer-orders-main">
      <h2>Bosapie Designs Client Orders</h2>
      <form id="order-form" onSubmit={addOrder}>
        <table id="order-table">
          <thead id='coth'>
            <tr>
              <th>Order Number</th>
              <th>Client Name</th>
              <th>Contact Number</th>
              <th>SKU</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="order-table-body">
            <tr id="order-input-row">
              <td>
                <input
                  type="text"
                  id="order-number"
                  value={formatOrderNumber(currentOrderNumber)}
                  readOnly
                />
              </td>
              <td>
                <input
                  type="text"
                  id="clientName"
                  placeholder="Client Name"
                  value={formData.clientName}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  id="contactNumber"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  id="sku"
                  placeholder="SKU"
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  id="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="number"
                  id="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <input
                  type="number"
                  id="total"
                  value={formData.total}
                  readOnly
                />
              </td>
              <td>
                <button type="submit" id="add-order-btn">
                  Add Order
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div id="orders-container">
        {orders.map((order, index) => (
          <div key={index} className="order-item glass">
            <div className="order-details">
              <h3>Order {order.orderNumber}</h3>
              <p><strong>Client:</strong> {order.clientName}</p>
              <p><strong>Contact:</strong> {order.contactNumber}</p>
              <p><strong>SKU:</strong> {order.sku}</p>
              <p><strong>Description:</strong> {order.description}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Amount:</strong> {formatZAR(order.amount)}</p>
              <p><strong>Total:</strong> {formatZAR(order.total)}</p>
            </div>
            <div className="order-actions">
              <button
                className="btn-generate"
                onClick={() => generatePDF(order)}
              >
                Generate PDF
              </button>
              <button
                className="btn-delete"
                onClick={() => deleteOrder(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerOrders;