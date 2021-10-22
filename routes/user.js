const express = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");

router.post("/user/login", async (req, res) => {
  try {
    const search = await User.findOne({ email: req.fields.email }); //look for account with this email
    if (search !== null) {
      // if this email isn't used yet
      const password1 = req.fields.password;
      const hash1 = SHA256(password1 + search.salt).toString(encBase64);
      const token1 = uid2(16);

      if (search.hash === hash1) {
        const infos = {
          id: search.id,
          token: token1,
          account: {
            username: search.account.username,
            phone: search.account.phone,
          },
        };
        res.status(200).json(infos);
      } else {
        res.status(400).json({ message: "wrong password" });
      }
    } else {
      res.status(400).json({ message: "wrong email" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/signup", async (req, res) => {
  //   console.log(req.fields);
  try {
    const search = await User.findOne({ email: req.fields.email });
    if (search === null) {
      if (req.fields.username !== "") {
        const password = req.fields.password;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        let picToUpload = req.files.picture.path;
        const image = await cloudinary.uploader.upload(picToUpload);

        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: { picture: image.secure_url },
          },
          token: token,
          hash: hash,
          salt: salt,
        });

        await newUser.save();
        const info = {
          id: newUser.id,
          token: token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
          },
        };
        res.status(200).json(info);
      } else {
        res.status(400).json({ message: "please enter a username" });
      }
    } else {
      res.status(400).json({ message: "email already used" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
