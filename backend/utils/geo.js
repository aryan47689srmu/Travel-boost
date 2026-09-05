// Haversine distance between two [lng, lat] points, in kilometers.
function distanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Builds a $geoWithin/$centerSphere filter for the given lat/lng/radius (km).
// Using $geoWithin (not $near) so it can be combined with $text search filters
// without MongoDB's "$text and $near not allowed in same query" restriction.
function nearFilter(lat, lng, radiusKm) {
  const radiusRadians = radiusKm / 6378.1; // Earth radius in km

  return {
    location: {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], radiusRadians],
      },
    },
  };
}

// Attaches distanceKm to each doc and sorts nearest-first.
function attachDistanceAndSort(docs, lat, lng) {
  const origin = [Number(lng), Number(lat)];

  return docs
    .map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      const coords = obj.location?.coordinates;

      const hasCoords =
        Array.isArray(coords) && (coords[0] !== 0 || coords[1] !== 0);

      return {
        ...obj,
        distanceKm: hasCoords
          ? Math.round(distanceKm(origin, coords) * 10) / 10
          : null,
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}

module.exports = { distanceKm, nearFilter, attachDistanceAndSort };