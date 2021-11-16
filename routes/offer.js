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
  try {
    // création d'un objet dans lequel on va sotcker nos différents filtres
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let page = 1;
    if (Number(req.query.page) < 1 || !req.query.page) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    // let limit = 20;
    let limit;
    if (req.query.limit && typeof req.query.limit === "number") {
      limit = Number(req.query.limit);
    } else {
      limit = 20;
    }
    // console.log(Number(page));
    // console.log(limit);

    const offers = await Offer.find(filters)
      .populate("owner.account")
      .sort(sort)
      .skip((page - 1) * limit) // ignorer les x résultats
      .limit(limit); // renvoyer y résultats

    // cette ligne va nous retourner le nombre d'annonces trouvées en fonction des filtres
    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
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
