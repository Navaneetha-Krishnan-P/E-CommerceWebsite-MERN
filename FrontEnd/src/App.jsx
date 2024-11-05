
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
      try {
        const res = await axios.get('http://localhost:5000/products', { params: { search, category } });
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [search, category]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const initiatePayment = async (product) => {
    try {
      const amount = parseInt(product.price.replace(/,/g, '')); 
      const orderResponse = await axios.post('https://e-commercewebsite-backend-mern.onrender.com/create-order', { amount });
      const { orderId } = orderResponse.data;

      const options = {
        key: "rzp_test_HPtpbhH8zAW0B5",
        amount: amount * 100,
        currency: 'INR',
        name: 'ECommerce Website',
        description: `Purchase of ${product.title}`,
        order_id: orderId,
        handler: async (response) => {
          const verifyResponse = await axios.post('https://e-commercewebsite-backend-mern.onrender.com/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          if (verifyResponse.data.message === 'Payment verified successfully') {
            alert('Payment successful!');
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error in payment:', error);
      alert('Something went wrong with the payment.');
    }
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
            <button onClick={() => openModal(product)}>View Details</button>&nbsp;
            <button onClick={() => initiatePayment(product)}>Buy Now</button>
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
