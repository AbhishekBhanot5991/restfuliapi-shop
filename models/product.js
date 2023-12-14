const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required:true },
  imageUrl: { type: String }, // Add a field for storing image paths
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
