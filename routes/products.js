const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user'); // Import the User model
const jwt = require('jsonwebtoken');
// const passport = require('passport');
const multer = require('multer');
const path = require('path');

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

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.userId = decoded.sub;
    next();
  });
};

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
      imageUrl: product.imageUrl ? `http://localhost:3000/${product.imageUrl}` : null,
    }));

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error Fetching Products' ,error:error.message });
  }
});

router.post('/',verifyToken, upload.single('imageUrl'), async (req, res) => {
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
router.put('/:id',verifyToken, async (req, res) => {
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
router.patch('/:id', verifyToken, async (req, res) => {
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

// Delete a product by ID (DELETE)
router.delete('/:id',verifyToken, async (req, res) => {
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

// Get a particular product by ID
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Format the imageUrl similar to how it's done in the list of products
    const productWithImage = {
      _id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl ? `https://charming-leotard-pig.cyclic.app/${product.imageUrl}` : null,
    };

    res.json(productWithImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

module.exports = router;
