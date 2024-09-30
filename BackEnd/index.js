const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Product model
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: String,
  imageUrl: String,
  category: String,
  quantity: Number
});

const Product = mongoose.model('Product', productSchema);
  

app.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    console.log('category: ', category);
    console.log('search: ', search);
    let filters = {};
    if (search) {
      filters.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      filters.category = category;
    }
    const allproducts = await Product.find();
    console.log('allproducts: ', allproducts);
    const products = await Product.find(filters);
    console.log('products: ', products);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const productid = await Product.findById(req.params.id);
    res.json(productid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
