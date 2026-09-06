const Place = require("../models/Place");

// GET /api/places
// GET /api/places?destination=Varanasi
exports.listPlaces = async (req, res) => {
  try {
    const { destination, search, q } = req.query;

    const filter = {};

    if (destination && destination.trim()) {
      filter.destination = new RegExp(destination.trim(), "i");
    }

    if ((q || search) && !(destination && destination.trim())) {
      filter.$text = {
        $search: q || search,
      };
    }

    let places = await Place.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    // When there is no search, randomize the cards
    if (!destination && !search && !q) {
      places = await Place.aggregate([
        { $sample: { size: 100 } },
      ]);
    }

    res.json(places);
  } catch (error) {
    console.error("Failed to fetch places:", error);

    res.status(500).json({
      message: "Failed to fetch places",
      error: error.message,
    });
  }
};


// GET /api/places/:id
exports.getPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json(place);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch place",
      error: error.message,
    });
  }
};


// GET /api/places/mine
exports.myPlaces = async (req, res) => {
  try {
    const places = await Place.find({
      vendor: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(places);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your places",
      error: error.message,
    });
  }
};


// POST /api/places
exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create({
      ...req.body,
      vendor: req.user.id,
    });

    res.status(201).json(place);
  } catch (error) {
    console.error("Create place error:", error);

    res.status(400).json({
      message: "Failed to create place",
      error: error.message,
    });
  }
};


// PUT /api/places/:id
exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findOneAndUpdate(
      {
        _id: req.params.id,
        vendor: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!place) {
      return res.status(404).json({
        message: "Place not found or you do not own this place",
      });
    }

    res.json(place);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update place",
      error: error.message,
    });
  }
};


// DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user.id,
    });

    if (!place) {
      return res.status(404).json({
        message: "Place not found or you do not own this place",
      });
    }

    res.json({
      message: "Place removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete place",
      error: error.message,
    });
  }
};