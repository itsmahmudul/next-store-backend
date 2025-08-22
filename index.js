import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gwygwhd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
let db;
client.connect()
    .then(() => {
        db = client.db("nextstore"); // select your database
        console.log("MongoDB connected");
    })
    .catch((err) => console.log(err));

// Root Route
app.get("/", (req, res) => {
    res.send("NextStore Backend is running!");
});


// Get all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await db.collection("products").find().toArray();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await db.collection("products").findOne({ _id: new require("mongodb").ObjectId(req.params.id) });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const result = await db.collection("products").insertOne({
      name,
      description,
      price,
      image,
      category,
      stock,
    });
    res.status(201).json({ message: "Product added", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
