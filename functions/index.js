require("dotenv").config();

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// App
const app = express();
app.use(cors({ origin: true }));

// Mongo connection
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("database Connected");
}

// Blog schema
const blogSchema = mongoose.Schema({
  authorName: { type: String, required: true },
  title: { type: String, require: true },
  content: { type: String, required: true },
  publicationDate: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true },
});

// const userCred = mongoose.model("userCred", userSchema);
const blogs = mongoose.model("blogs", blogSchema);

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("Cloud Functions for Blogs");
});

// Create -> post()
app.post("/api/create", async (req, res) => {
  const { title, content, authorName, publicationDate, email } = req.body;
  try {
    // console.log("post user created", req.body);
    // const usermail = req.body.email;

    const data = await blogs.create({
      title,
      content,
      authorName,
      publicationDate,
      email,
    });
    res.status(200).json({ data, alert: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get -> get()
app.get("/api/get/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    const reqDoc = await blogs.findById(req.params.id);
    // console.log("got the data alreaady in database", reqDoc);
    res.status(200).json({ reqDoc, alert: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// getALL -> get All Data
app.get("/api/getall", async (req, res) => {
  try {
    const reqDocs = await blogs.find();
    // console.log("All docs of database", reqDocs);
    res.status(200).json({ reqDocs, alert: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Update -> put()
app.put("/api/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log("id to be update", id);
    const userUpdate = await blogs.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    // console.log("updated User", userUpdate);
    res.status(200).json(userUpdate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete -> delete()
app.delete("/api/del/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id to be del", id);
    const userDel = await blogs.findOneAndDelete({ _id: id });
    console.log("updated User", userDel);
    res.status(200).json({ userDel, msg: "User Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// exports the api to firebase cloud functions
exports.app = functions.https.onRequest(app);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
