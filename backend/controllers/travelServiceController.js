const TravelService = require("../models/TravelService");
const { nearFilter, attachDistanceAndSort } = require("../utils/geo");
const editableFields = ["title", "type", "destination", "description", "price", "capacity", "durationHours"];
const pickEditable = (body) => Object.fromEntries(editableFields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

// GET /api/travel-services?destination=Goa&type=Taxi
// GET /api/travel-services?type=Taxi,Bus,Car Rental        -> multiple types (comma-separated)
// GET /api/travel-services?lat=..&lng=..&radius=25          -> nearest services first, within radius (km, default 25)
exports.listServices = async (req, res) => {
  try {
    const { destination, type, lat, lng, radius } = req.query;
    const filter = {};
    if (destination) filter.destination = new RegExp(destination, "i");
    if (type) {
      const types = type.split(",").map((t) => t.trim()).filter(Boolean);
      filter.type = types.length > 1 ? { $in: types } : types[0];
    }

    const hasCoords = lat !== undefined && lng !== undefined;
    if (hasCoords) Object.assign(filter, nearFilter(lat, lng, radius ? Number(radius) : 25));

    let query = TravelService.find(filter);
    if (!hasCoords) query = query.sort({ rating: -1, createdAt: -1 });

    const services = await query.limit(100);
    res.json(hasCoords ? attachDistanceAndSort(services, lat, lng) : services);
  } catch (err) { res.status(500).json({ message: "Failed to fetch travel services", error: err.message }); }
};

exports.myServices = async (req, res) => {
  try { res.json(await TravelService.find({ vendor: req.user.id }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: "Failed to fetch your travel services", error: err.message }); }
};

exports.createService = async (req, res) => {
  try { res.status(201).json(await TravelService.create({ ...pickEditable(req.body), vendor: req.user.id })); }
  catch (err) { res.status(400).json({ message: "Failed to create travel service", error: err.message }); }
};

exports.updateService = async (req, res) => {
  try {
    const service = await TravelService.findOneAndUpdate({ _id: req.params.id, vendor: req.user.id }, pickEditable(req.body), { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: "Travel service not found or not owned by you" });
    res.json(service);
  } catch (err) { res.status(400).json({ message: "Failed to update travel service", error: err.message }); }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await TravelService.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    if (!service) return res.status(404).json({ message: "Travel service not found or not owned by you" });
    res.json({ message: "Travel service removed" });
  } catch (err) { res.status(500).json({ message: "Failed to delete travel service", error: err.message }); }
};