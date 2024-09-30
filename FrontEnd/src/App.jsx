import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';

Modal.setAppElement('#root');

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get('https://e-commerce-website-backend-mern.vercel.app/products', { params: { search, category } });
      console.log("data", res.data);
      setProducts(res.data);
    };
    fetchProducts();
  }, [search, category]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="container">
      <Header />
      <div>
        <input
          type="text"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filter-container">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
          <option value="">Filter by Category</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="home-appliances">Home Appliances</option>
        </select>
      </div>

      <div className="grid">
        {products.map((product) => (
          <div key={product._id} className="card">
            <img src={product.imageUrl} alt={product.title} />
            <h2>{product.title}</h2>
            <p>₹{product.price}</p>
            <button onClick={() => openModal(product)}>View Details</button>
          </div>
        ))}
      </div>

      <Footer />

      {selectedProduct && (
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
          <div className="modal-content">
            <h2>{selectedProduct.title}</h2><br/>
            <img src={selectedProduct.imageUrl} alt={selectedProduct.title} />
            <p><b>{selectedProduct.description}</b></p>
            <p><b>Price: ₹{selectedProduct.price}</b></p>
            <p><b>Available: {selectedProduct.quantity}</b></p>
            <button className="close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;


