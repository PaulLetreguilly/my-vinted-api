const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: {
    MARQUE: String,
    TAILLE: String,
    ETAT: String,
    COULEUR: String,
    EMPLACEMENT: String,
  },
  product_image: Object,
  owner: {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
});

module.exports = Offer;
