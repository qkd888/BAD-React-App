import React, { useState, useEffect } from 'react';
import '../made-by-us.css';

const productsData = [
  {
    id: 1,
    title: "Handcrafted Ceramic Vase",
    description: "Elegantly designed ceramic vase with unique patterns. Each piece is carefully crafted by hand using traditional techniques combined with modern design elements.",
    image: "images/FB_IMG_1737093122377.jpg",
    stock: 5
  },
  {
    id: 2,
    title: "Woven Wall Hanging",
    description: "Beautiful wall hanging made with natural fibers and intricate weaving patterns. Perfect for adding texture and warmth to any room.",
    image: "images/codioful-formerly-gradienta-26WixHTutxc-unsplash.jpg",
    stock: 3
  },
  {
    id: 3,
    title: "Wooden Serving Board",
    description: "Hand-carved serving board made from sustainable hardwood. Features natural wood grain patterns and food-safe finish.",
    image: "images/boliviainteligente-gDiEgRhjCOo-unsplash.jpg",
    stock: 8
  },
  {
    id: 4,
    title: "Woven Rugs",
    description: "Some KickAss woven and HandPrinted Rugs",
    image: "images/codioful-formerly-gradienta-26WixHTutxc-unsplash.jpg",
    stock: 3
  },
  {
    id: 5,
    title: "Customised Key Rings",
    description: "Customised key rings are small, practical accessories designed to hold keys while reflecting personal style or branding. They come in various shapes, sizes, and materials, including metal, plastic, and leather. What sets customised key rings apart is the ability to add unique elements such as names, logos, images, or messages. These key rings are popular for promotional purposes, corporate gifts, special occasions, and personal keepsakes. They add a personal touch to an everyday item, making them memorable and unique. Customisation options can include engraving, printing, embossing, or even attaching small charms or decorative elements.",
    image: "images/codioful-formerly-gradienta-26WixHTutxc-unsplash.jpg",
    stock: 3
  },
  {
    id: 6,
    title: "Printed Ceramic Mugs",
    description: "Printed ceramic mugs are a popular choice for both personal use and gifting. They are crafted from durable ceramic material and feature a variety of designs, images, or text that are printed onto the surface. These mugs come in different shapes and sizes, making them suitable for coffee, tea, or any other beverage. The printing can range from simple logos and patterns to intricate artwork and personalized messages. They are often used as promotional items, souvenirs, or personalized gifts, adding a touch of creativity and customization to an everyday item. Plus, they're dishwasher and microwave safe, making them practical and convenient for daily use.",
    image: "images/codioful-formerly-gradienta-26WixHTutxc-unsplash.jpg",
    stock: 3
  }
];

function MadeByUs() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle Escape key and body overflow
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    document.body.style.overflow = selectedProduct ? 'hidden' : 'auto';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [selectedProduct]);

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedProduct(null);
  };

  const handleModalClick = (e) => {
    // Only close if clicking the modal background, not the content
    if (e.target.className === 'modal') {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Made by Us</h1>
        <div className="products-grid" id="productsGrid">
          {productsData.map(product => (
            <div 
              key={product.id}
              className="product-card"
              onClick={() => openModal(product)}
            >
              <img 
                src={product.image} 
                alt={product.title} 
                className="product-image"
              />
              <h3 className="product-title">{product.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <div 
          className="modal" 
          onClick={handleModalClick}
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
            style={{
              position: 'relative',
              margin: '50px auto',
              padding: '20px',
              background: 'white',
              borderRadius: '5px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <button 
              className="close-button" 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'transparent',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.title} 
              className="modal-image"
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
            />
            <h2 className="modal-title">{selectedProduct.title}</h2>
            <p className="modal-description">{selectedProduct.description}</p>
            <p className="modal-stock">Stock: {selectedProduct.stock}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MadeByUs;