const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visual-product-matcher';

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  similarityScore: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: undefined });
    console.log('Connected to MongoDB');

    const productsPath = path.join(__dirname, 'products.json');
    const raw = fs.readFileSync(productsPath, 'utf-8');
    const products = JSON.parse(raw);

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products into MongoDB.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

runSeed();
