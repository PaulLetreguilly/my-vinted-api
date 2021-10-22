const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/middleware");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  if (req.fields.title.length <= 50 && req.fields.title.length > 0) {
    /// condition bonus
    if (req.fields.description.length <= 500) {
      /// same
      if (req.fields.price > 0 && req.fields.price < 100000) {
        /// same
        let pictureToUpload = req.files.picture.path;
        const result = await cloudinary.uploader.upload(pictureToUpload, {
          folder: "Vinted / offers",
        });

        const offer = new Offer({
          product_name: req.fields.title,
          product_description: req.fields.description,
          product_price: req.fields.price,
          product_details: {
            MARQUE: req.fields.brand,
            TAILLE: req.fields.size,
            ETAT: req.fields.condition,
            COULEUR: req.fields.color,
            EMPLACEMENT: req.fields.city,
          },
          owner: { account: req.user },
          product_image: result,
        });
        await offer.save();
        res.json(offer);
      } else {
        res.status(400).json({ error: "price can't be more than 100000" });
      }
    } else {
      res.status(400).send("description too long");
    }
  } else {
    res.status(400).send("title too long");
  }
});

router.get("/offers", async (req, res) => {
  const filtre = {};
  if (req.query.priceMin && req.query.priceMax) {
    filtre.product_price = {
      $gte: req.query.priceMin,
      $lte: req.query.priceMax,
    };
  } else if (req.query.priceMin) {
    filtre.product_price = { $gte: req.query.priceMin };
  } else if (req.query.priceMax) {
    filtre.product_price = { $lte: req.query.priceMax };
  }

  if (req.query.title) {
    filtre.product_name = new RegExp(req.query.title, "i");
  }
  if (req.query.page) {
    const pageskip = (Number(req.query.page) - 1) * 2;
    if (req.query.sort) {
      const sort = req.query.sort.replace("price-", "");
      const offer = await Offer.find(filtre)
        .select("product_name product_price")
        .sort({ product_price: sort })
        .limit(7)
        .skip(pageskip);
      const result = { count: offer.length, offers: offer };
      res.json(result);
    } else {
      const offer = await Offer.find({
        product_name: new RegExp(req.query.title, "i"),
        product_price: { $lte: req.query.priceMax, $gte: req.query.priceMin },
      })
        .select("product_name product_price")
        .limit(2)
        .skip(pageskip);
      const result = { count: offer.length, offers: offer };
      res.json(result);
    }
  } else {
    if (req.query.sort) {
      // console.log(req.query.priceMin);
      const sort = req.query.sort.replace("price-", "");
      const offer = await Offer.find(filtre)
        .select("product_name product_price")
        .sort({ product_price: sort });
      const result = { count: offer.length, offers: offer };
      res.json(result);
    } else {
      // console.log(req.query.priceMin);
      const offer = await Offer.find(filtre).select(
        "product_name product_price"
      );

      const result = { count: offer.length, offers: offer };
      res.json(result);
    }
  }
});

router.get("/offer/:id", async (req, res) => {
  const search = await Offer.findById(req.params.id);
  if (search) {
    res.json(search);
  } else {
    res.status(400).json({ message: "Offer not found" });
  }
});

module.exports = router;
