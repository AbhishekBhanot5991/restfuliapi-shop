const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user'); // Import the User model
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
const path = require('path');

// Example route with authentication
router.post(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: 'This route is protected!' });
  }
);
// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Set a unique filename
  },
});

const upload = multer({ storage: storage });

router.use('/uploads', express.static('uploads')); // Serve images from the 'uploads' folder
// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    // Map the products to include image URLs
    const productsWithImages = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category:product.category,
      imageUrl: product.imageUrl ? `https://charming-leotard-pig.cyclic.app/${product.imageUrl}` : null,
    }));

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error Fetching Products' ,error:error.message });
  }
});

router.post('/', upload.single('imageUrl'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      // imageUrl: req.file ? path.join('uploads', req.file.filename).replace(/\\/g, '/') : null,
      imageUrl: req.file ? req.file.path.replace(/\\/g, '/') : null,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});



// Update a product by ID (PUT)
router.put('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Partially update a product by ID (PATCH)
router.patch('/:id',   async (req, res) => {
  const productId = req.params.id;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Get a particular product by ID
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Delete a product by ID (DELETE)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
