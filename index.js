import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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
    },
});

let db;

// Async function to connect and start server
async function startServer() {
    try {
        await client.connect();
        db = client.db("nextstore");
        console.log("MongoDB connected");

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
                console.error(err);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Get single product by ID
        app.get("/api/products/:id", async (req, res) => {
            try {
                const { id } = req.params;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid ID" });
                }

                const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
                if (!product) return res.status(404).json({ message: "Product not found" });

                res.json(product);
            } catch (err) {
                console.error(err);
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
                console.error(err);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Start server
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

// Start the server
startServer();
