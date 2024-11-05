
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const username = "new_user-01";
const password = "Krish2309";
const cluster = "cluster0";
const dbname = "ECommerceWebsite";

const uri = `mongodb+srv://${username}:${password}@${cluster}.hotzxyg.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;


mongoose.connect(uri, {
}).then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log(err));

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Product Schema and Model
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: String,
  imageUrl: String,
  category: String,
  quantity: Number
});
const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let filters = {};
    if (search) filters.title = { $regex: search, $options: 'i' };
    if (category) filters.category = category;

    const products = await Product.find(filters);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order Route
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex')
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment Route
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const hash = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                     .digest('hex');
  if (hash === razorpay_signature) {
    res.json({ message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
