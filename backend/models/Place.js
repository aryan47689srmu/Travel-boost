const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "Tourist Attraction",
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    images: [{ type: String }],

    tags: [{ type: String }],

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

placeSchema.index({
  name: "text",
  destination: "text",
  description: "text",
  tags: "text",
});

module.exports = mongoose.model("Place", placeSchema);