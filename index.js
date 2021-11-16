require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const corsOptions = {
  origin: `http://localhost:${process.env.PORT}`,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();
app.use(formidable());
app.use(cors(corsOptions));
mongoose.connect(process.env.MONGO_DB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Welcome to my vinted api");
});

const user = require("./routes/user");
app.use(user);
const offer = require("./routes/offer");
app.use(offer);
const payment = require("./routes/payment");
app.use(payment);

app.all("*", (req, res) => {
  res.json({ message: "mauvaise URL" }); // send a message when client send wrong URL
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
