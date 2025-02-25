import React, { useState, useEffect, useRef } from 'react';
import '../inventory.css';

const DB_NAME = 'ProductDatabase';
const DB_VERSION = 1;
const STORE_NAME = 'products';

function Inventory() {
  const [db, setDb] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalImage, setModalImage] = useState('');
  const searchTimeout = useRef(null);
  const searchResultsRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    description: '',
    quantity: '',
    amount: ''
  });

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => console.error('Error opening database');
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'sku' });
      }
    };

    request.onsuccess = async (event) => {
      const database = event.target.result;
      setDb(database);
      const loadedProducts = await getAllProducts(database);
      setProducts(loadedProducts);
    };

    // Handle click outside search results
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) && 
          event.target.id !== 'searchInput') {
        searchResultsRef.current.style.display = 'none';
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    // Handle body overflow when modal is open
    document.body.style.overflow = modalImage ? 'hidden' : 'auto';

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [modalImage]); // Added modalImage as dependency

  // Database operations
  const getAllProducts = (database) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addProductToDB = (product) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(product);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const deleteProductFromDB = (sku) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(sku);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Utility functions
  const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        if (searchResultsRef.current) searchResultsRef.current.style.display = 'none';
        return;
      }
      const results = products.filter(product => {
        const searchFields = [
          product.sku.toString(),
          product.description.toString(),
          product.quantity.toString(),
          product.amount.toString()
        ];
        return searchFields.some(field => 
          field.toLowerCase().includes(query.toLowerCase())
        );
      });
      setSearchResults(results);
      if (searchResultsRef.current) searchResultsRef.current.style.display = 'block';
    }, 300);
  };

  const scrollToProduct = (sku) => {
    const row = document.querySelector(`tr[data-sku="${sku}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
      setTimeout(() => {
        row.style.backgroundColor = '';
      }, 2000);
    }
    if (searchResultsRef.current) searchResultsRef.current.style.display = 'none';
  };

  const addProduct = async () => {
    const { sku, description, quantity, amount } = formData;
    const qty = parseInt(quantity);
    const amt = parseFloat(amount);

    if (!sku || !description || isNaN(qty) || isNaN(amt) || !selectedImage) {
      alert('Please fill all fields and upload an image');
      return;
    }
    if (qty < 0 || amt < 0) {
      alert('Quantity and amount must be positive numbers');
      return;
    }

    const product = { sku, description, image: selectedImage, quantity: qty, amount: amt };
    try {
      await addProductToDB(product);
      const updatedProducts = await getAllProducts(db);
      setProducts(updatedProducts);
      setFormData({ sku: '', description: '', quantity: '', amount: '' });
      setSelectedImage(null);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const deleteProduct = async (sku) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductFromDB(sku);
        const updatedProducts = await getAllProducts(db);
        setProducts(updatedProducts);
        if (searchResultsRef.current) searchResultsRef.current.style.display = 'none';
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setModalImage('');
  };

  const handleModalClick = (e) => {
    if (e.target.className === 'modal') {
      setModalImage('');
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = modalImage;
    link.download = `product-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page">
      <div className="products-container">
        <div className="header">
          <h1>Inventory</h1>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-box"
            id="searchInput"
            placeholder="Search products by SKU, description, quantity, or amount..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && searchResultsRef.current && (searchResultsRef.current.style.display = 'block')}
          />
          <div className="search-results" id="searchResults" ref={searchResultsRef}>
            {searchResults.length === 0 && searchQuery ? (
              <div className="search-result-item">No products found</div>
            ) : (
              searchResults.map(product => (
                <div
                  key={product.sku}
                  className="search-result-item"
                  onClick={() => scrollToProduct(product.sku)}
                >
                  <img src={product.image} alt="Product thumbnail" />
                  <div className="search-result-details">
                    <strong>SKU: <span dangerouslySetInnerHTML={{ __html: highlightText(product.sku, searchQuery) }} /></strong>
                    <div dangerouslySetInnerHTML={{ __html: highlightText(product.description, searchQuery) }} />
                    <div>Quantity: {product.quantity} | Amount: {formatZAR(product.amount)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="input-group">
          <input
            type="text"
            id="sku"
            placeholder="SKU"
            value={formData.sku}
            onChange={handleInputChange}
          />
          <input
            type="text"
            id="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <input
            type="number"
            id="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <input
            type="number"
            id="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleInputChange}
          />
          <input
            type="file"
            id="image"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button onClick={() => document.getElementById('image').click()}>
            Upload Image
          </button>
          <button onClick={addProduct}>Add Product</button>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>Image</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="productsBody">
            {products.map(product => (
              <tr key={product.sku} data-sku={product.sku}>
                <td>{product.sku}</td>
                <td>{product.description}</td>
                <td>
                  <img
                    src={product.image}
                    className="thumbnail"
                    onClick={() => openModal(product.image)}
                    alt="Product"
                  />
                </td>
                <td>{product.quantity}</td>
                <td>{formatZAR(product.amount)}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteProduct(product.sku)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalImage && (
        <div
          className="modal"
          onClick={handleModalClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '5px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative'
            }}
          >
            <img
              src={modalImage}
              alt="Product Image"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
            <div
              className="modal-buttons"
              style={{ marginTop: '15px', textAlign: 'right' }}
            >
              <button
                onClick={closeModal}
                style={{ marginRight: '10px', padding: '5px 15px' }}
              >
                Close
              </button>
              <button
                onClick={downloadImage}
                style={{ padding: '5px 15px' }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;