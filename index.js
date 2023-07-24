const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqdm4bk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const collegeCardsCollection = client
      .db("endgameDb")
      .collection("CollegeCards");
    const admissionCollection = client.db("endgameDb").collection("admission");
    const reviewsCollection = client.db("endgameDb").collection("reviews");

    const indexKeys = { collegeName: 1 };
    const indexOptions = { name: "CollegeName" };
    const result = await collegeCardsCollection.createIndex(
      indexKeys,
      indexOptions
    );
    app.get("/collegeSearchByCollegeName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await collegeCardsCollection
        .find({
          $or: [{ collegeName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/college-cards", async (req, res) => {
      const result = await collegeCardsCollection.find().toArray();
      res.send(result);
    });
    app.get("/college-cards/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCardsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/admission", async (req, res) => {
      const candidateInfo = req.body;
      const result = await admissionCollection.insertOne(candidateInfo);
      res.send(result);
    });
    app.get("/admission", async (req, res) => {
      const email = req.query.email;
      const filter = { candidateEmail: email };
      const result = await admissionCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reviewInfo = req.body;
      const result = await reviewsCollection.insertOne(reviewInfo);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
