const router = require("express").Router();

const {
  listPlaces,
  getPlace,
  myPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../controllers/placeController");

const { protect, requireRole } = require("../middleware/auth");


// Public routes
router.get("/", listPlaces);

// Vendor routes
router.get(
  "/mine",
  protect,
  requireRole("vendor", "admin"),
  myPlaces
);

// Public detail route
router.get("/:id", getPlace);

router.post(
  "/",
  protect,
  requireRole("vendor", "admin"),
  createPlace
);

router.put(
  "/:id",
  protect,
  requireRole("vendor", "admin"),
  updatePlace
);

router.delete(
  "/:id",
  protect,
  requireRole("vendor", "admin"),
  deletePlace
);

module.exports = router;