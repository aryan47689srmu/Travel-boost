const Hotel = require("../models/Hotel");
const { nearFilter, attachDistanceAndSort } = require("../utils/geo");
const editableFields = ["name", "description", "destination", "state", "address", "pricePerNight", "images", "amenities", "roomsAvailable", "tags", "location"];
const pickEditable = (body) => Object.fromEntries(editableFields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validLocation = (location) => {
  const coordinates = location?.coordinates;
  return location?.type === "Point" && Array.isArray(coordinates) && coordinates.length === 2
    && Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1]))
    && Number(coordinates[0]) >= -180 && Number(coordinates[0]) <= 180
    && Number(coordinates[1]) >= -90 && Number(coordinates[1]) <= 90;
};

// GET /api/hotels?destination=Goa&minPrice=&maxPrice=&sort=rating
// GET /api/hotels?lat=..&lng=..&radius=25   -> nearest hotels first, within radius (km, default 25)
exports.listHotels = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, search, q, sort, lat, lng, radius } = req.query;
    const filter = {};
    if (destination) filter.destination = new RegExp(destination, "i");
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const hasCoords = lat !== undefined && lng !== undefined;
    if (hasCoords) {
      Object.assign(filter, nearFilter(lat, lng, radius ? Number(radius) : 25));
    } else if (q || search) {
      filter.$text = { $search: q || search };
    }

    let query = Hotel.find(filter);
    if (!hasCoords) {
      if (sort === "price_asc") query = query.sort({ pricePerNight: 1 });
      else if (sort === "price_desc") query = query.sort({ pricePerNight: -1 });
      else query = query.sort({ rating: -1 });
    }

    const hotels = await query.limit(100);
    res.json(hasCoords ? attachDistanceAndSort(hotels, lat, lng) : hotels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hotels", error: err.message });
  }
};

exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hotel", error: err.message });
  }
};

exports.myHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ vendor: req.user.id }).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your hotels", error: err.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    if (!validLocation(req.body.location)) {
      return res.status(400).json({ message: "Valid hotel latitude and longitude are required" });
    }

    const hotel = await Hotel.create({ ...pickEditable(req.body), vendor: req.user.id });
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ message: "Failed to create hotel", error: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    if (req.body.location !== undefined && !validLocation(req.body.location)) {
      return res.status(400).json({ message: "Valid hotel latitude and longitude are required" });
    }

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user.id },
      pickEditable(req.body),
      { new: true, runValidators: true }
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found or not owned by you" });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ message: "Failed to update hotel", error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    if (!hotel) return res.status(404).json({ message: "Hotel not found or not owned by you" });
    res.json({ message: "Hotel removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete hotel", error: err.message });
  }
};