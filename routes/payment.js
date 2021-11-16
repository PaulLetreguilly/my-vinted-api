const express = require("express");
const Offer = require("../models/Offer");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET_KEY);

router.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement my Vinted pour : ${req.fields.name}`,
      source: req.fields.token,
    });

    if (response.status === "succeeded") {
      res.status(200).json({ message: "Paiement effectué" });
    } else {
      res.status(400).json({ message: "An error occured" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
