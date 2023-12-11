const express = require('express');
const router = express.Router();
const Product = require('../models/product');
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
      imageUrl: product.imageUrl ? `https://charming-leotard-pig.cyclic.app/${product.imageUrl}` : null,
    }));

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error Fetching Products' ,error:error.message });
  }
});

// Create a new product
// router.post('/', async (req, res) => {
//   const product = new Product({
//     name: req.body.name,
//     price: req.body.price,
//     description: req.body.description,
//   });

//   try {
//     const newProduct = await product.save();
//     res.status(201).json(newProduct);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// router.post('/', async (req, res) => {
//   const product = new Product({
//     name: req.body.name,
//     price: req.body.price,
//     description: req.body.description,
//   });

//   try {
//     const newProduct = await product.save();
//     res.status(201).json(newProduct);
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: 'Error creating product', error: error.message });
//   }
// });

// Get a particular product by ID

router.post('/', upload.single('imageUrl'), async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl: req.file ? path.join('uploads', req.file.filename) : null,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

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
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
