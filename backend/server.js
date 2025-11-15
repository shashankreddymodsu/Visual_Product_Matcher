const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visual-product-matcher';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Basic middleware
app.use(cors({
  origin: ALLOWED_ORIGIN,
}));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// MongoDB / Mongoose setup
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  similarityScore: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

async function connectToMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
  }
}

connectToMongo();

// Utility: compute placeholder similarity scores via MongoDB
async function getSimilarProducts({ topK = 20, minScore = 0 }) {
  const all = await Product.find({ similarityScore: { $gte: minScore } })
    .sort({ similarityScore: -1 })
    .limit(topK)
    .lean();
  return all;
}

// Deterministic pseudo-similarity based on the imageUrl and product id/name.
// Produces a score in [0,1] so different images yield different rankings.
function pseudoHash01(str) {
  const hex = crypto.createHash('sha256').update(str).digest('hex').slice(0, 8);
  const int = parseInt(hex, 16);
  return int / 0xffffffff; // normalize to [0,1]
}

function computeDeterministicScore(imageUrl, product) {
  const h = pseudoHash01(`${imageUrl}|${product.id}|${product.name}`);
  const base = typeof product.similarityScore === 'number' ? product.similarityScore : 0.5;
  // Mix seeded score with hash so results feel stable yet image-dependent
  return 0.6 * base + 0.4 * h;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/products - return full product list from MongoDB
app.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ id: 1 }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/upload - handle image file upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

// POST /api/similarity - compute placeholder similarity based on MongoDB scores
app.post('/api/similarity', async (req, res, next) => {
  try {
    const { imageUrl, topK, minScore } = req.body || {};

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const k = typeof topK === 'number' ? topK : 20;
    const min = typeof minScore === 'number' ? minScore : 0;

    // Fetch all products, compute deterministic per-image scores, filter and rank
    const all = await Product.find({}).lean();
    const ranked = all
      .map((p) => ({ ...p, similarityScore: computeDeterministicScore(imageUrl, p) }))
      .filter((p) => p.similarityScore >= min)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, k);

    res.json({
      queryImageUrl: imageUrl,
      products: ranked,
    });
  } catch (err) {
    next(err);
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
