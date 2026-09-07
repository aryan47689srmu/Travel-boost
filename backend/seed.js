require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Hotel = require("./models/Hotel");
const Experience = require("./models/Experience");
const TravelService = require("./models/TravelService");

// GeoJSON requires coordinates as [longitude, latitude] — NOT [latitude, longitude].
const point = (lng, lat) => ({ type: "Point", coordinates: [lng, lat] });

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Hotel.deleteMany({}), Experience.deleteMany({}), TravelService.deleteMany({})]);

  const vendor = await User.create({
    name: "Demo Vendor",
    email: "vendor@travelboost.com",
    password: "password123",
    role: "vendor",
  });

  await User.create({
    name: "Abhay",
    email: "traveler@travelboost.com",
    password: "password123",
    role: "traveler",
  });

  const hotels = await Hotel.insertMany([
    {
      name: "The Himalayan Resort",
      destination: "Manali",
      state: "Himachal Pradesh",
      pricePerNight: 4500,
      rating: 4.8,
      reviewCount: 1200,
      images: ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80"],
      amenities: ["WiFi", "Mountain View", "Breakfast"],
      tags: ["adventure", "nature"],
      vendor: vendor._id,
      location: point(77.1892, 32.2432),  // Manali town center, HP
      verificationStatus: "verified",
    },
    {
      name: "Goa Beach Resort",
      destination: "Goa",
      state: "Goa",
      pricePerNight: 3800,
      rating: 4.7,
      reviewCount: 2100,
      images: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80"],
      amenities: ["Pool", "Beach Access", "Bar"],
      tags: ["beach", "nightlife"],
      vendor: vendor._id,
      location: point(73.7623, 15.5449),  // Calangute Beach, Goa
      verificationStatus: "verified",
    },
    {
      name: "Lake Palace View",
      destination: "Udaipur",
      state: "Rajasthan",
      pricePerNight: 5200,
      rating: 4.6,
      reviewCount: 1100,
      images: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80"],
      amenities: ["Lake View", "Heritage", "Spa"],
      tags: ["cultural", "heritage"],
      vendor: vendor._id,
      location: point(73.6833, 24.5764),  // Lake Pichola, Udaipur
      verificationStatus: "verified",
    },
    {
      name: "Coral Bay Villas",
      destination: "Andaman",
      state: "Andaman & Nicobar",
      pricePerNight: 6000,
      rating: 4.9,
      reviewCount: 1300,
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"],
      amenities: ["Scuba Diving", "Private Beach"],
      tags: ["beach", "adventure"],
      vendor: vendor._id,
      location: point(92.7265, 11.6234),  // Port Blair, Andaman
      verificationStatus: "verified",
    },
    
  ]);

  await Experience.insertMany([
    {
      title: "Paragliding in Manali",
      category: "Adventure",
      destination: "Manali",
      price: 2500,
      durationHours: 2,
      images: ["https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80"],
      rating: 4.7,
      vendor: vendor._id,
      location: point(77.1522, 32.3172),  // Solang Valley, near Manali
      verificationStatus: "verified",
    },
    {
      title: "Scuba Diving Andaman",
      category: "Adventure",
      destination: "Andaman",
      price: 3500,
      durationHours: 3,
      images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80"],
      rating: 4.9,
      vendor: vendor._id,
      location: point(92.6586, 11.596),  // Havelock-side dive point, Andaman
      verificationStatus: "verified",
    },
    {
      title: "Udaipur Heritage Walk",
      category: "Cultural",
      destination: "Udaipur",
      price: 800,
      durationHours: 2,
      images: ["https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80"],
      rating: 4.6,
      vendor: vendor._id,
      location: point(73.6832, 24.5764),  // City Palace, Udaipur
      verificationStatus: "verified",
    },
    {
      title: "Goan Seafood Trail",
      category: "Food & Dining",
      destination: "Goa",
      price: 1200,
      durationHours: 3,
      images: ["https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80"],
      rating: 4.8,
      vendor: vendor._id,
      location: point(73.7898, 15.4909),  // Panaji riverside, Goa
      verificationStatus: "verified",
    },
    {
      title: "Darjeeling Tea Tasting",
      category: "Cultural",
      destination: "Darjeeling",
      price: 600,
      durationHours: 1,
      images: ["https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=900&q=80"],
      rating: 4.5,
      vendor: vendor._id,
      location: point(88.2467, 27.0167),  // Happy Valley Tea Estate, Darjeeling
      verificationStatus: "verified",
    },
    {
      title: "Himalayan Yoga Retreat",
      category: "Wellness",
      destination: "Manali",
      price: 1500,
      durationHours: 2,
      images: ["https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=900&q=80"],
      rating: 4.6,
      vendor: vendor._id,
      location: point(77.1892, 32.2432),  // Manali town center
      verificationStatus: "verified",
    },
    {
      title: "Lucknow Old City Food Walk",
      category: "Food & Dining",
      destination: "Lucknow",
      price: 950,
      durationHours: 3,
      images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"],
      rating: 4.8,
      vendor: vendor._id,
      location: point(80.9269, 26.87),  // Chowk, Old Lucknow
      verificationStatus: "verified",
    },
  ]);

  await TravelService.insertMany([
    { title: "Manali Mountain Taxi", type: "Taxi", destination: "Manali", price: 1800, capacity: 4, durationHours: 8, rating: 4.7, vendor: vendor._id, verificationStatus: "verified", location: point(77.1892, 32.2432) },
    { title: "Goa Airport Beach Transfer", type: "Airport Transfer", destination: "Goa", price: 1200, capacity: 4, durationHours: 2, rating: 4.8, vendor: vendor._id, verificationStatus: "verified", location: point(73.8314, 15.3808) },
    { title: "Udaipur Heritage Guide", type: "Local Guide", destination: "Udaipur", price: 1500, capacity: 8, durationHours: 4, rating: 4.9, vendor: vendor._id, verificationStatus: "verified", location: point(73.6833, 24.5764) },
    { title: "Darjeeling Hill Car Rental", type: "Car Rental", destination: "Darjeeling", price: 2400, capacity: 4, durationHours: 10, rating: 4.6, vendor: vendor._id, verificationStatus: "verified", location: point(88.2663, 27.041) },
    { title: "Lucknow Heritage Taxi", type: "Taxi", destination: "Lucknow", price: 1400, capacity: 4, durationHours: 6, rating: 4.7, vendor: vendor._id, verificationStatus: "verified", location: point(80.9462, 26.8467) },
  ]);

  console.log("Seed complete: 2 users, 6 hotels, 7 experiences, 5 travel services created.");
  console.log("Login with traveler@travelboost.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});