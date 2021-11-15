const express = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
// const mongoose = require("mongoose");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/user/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      if (req.fields.email && req.fields.password && req.fields.username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);

        const newUser = new User({
          email: req.fields.email,
          token: token,
          hash: hash,
          salt: salt,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
        });

        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const search = await User.findOne({ email: req.fields.email }); //look for account with this email
    if (search) {
      // if this email isn't used yet
      // if (req.fields.email && req.fields.password && req.fields.username) {
      const password1 = req.fields.password;
      const hash1 = SHA256(password1 + search.salt).toString(encBase64);
      const token1 = uid2(16);

      if (search.hash === hash1) {
        const infos = {
          id: search.id,
          token: search.token,
          account: {
            username: search.account.username,
            phone: search.account.phone,
          },
        };
        res.status(200).json(infos);
      } else {
        res.status(400).json({ message: "wrong password" });
      }
      // }
    } else {
      res.status(400).json({ message: "wrong email" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
