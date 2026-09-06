import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyHotel = { name: "", destination: "", state: "", pricePerNight: "", roomsAvailable: 5, amenities: "", latitude: "", longitude: "" };
const emptyExperience = { title: "", destination: "", category: "Adventure", price: "", durationHours: 2, description: "" };
const emptyService = { title: "", destination: "", type: "Taxi", price: "", capacity: 4, durationHours: 2 };
const emptyPlace = { name: "", destination: "", state: "", category: "Tourist Attraction", description: "", address: "", tags: "", latitude: "", longitude: "", };

export default function VendorDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [services, setServices] = useState([]);
  const [places, setPlaces] = useState([]);
  const [hotelForm, setHotelForm] = useState(emptyHotel);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [placeForm, setPlaceForm] = useState(emptyPlace);
  const [placeImages, setPlaceImages] = useState([]);
  const [hotelImages, setHotelImages] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [
      hotelResult,
      experienceResult,
      serviceResult,
      placeResult
    ] = await Promise.all([
      api.get("/hotels/mine"),
      api.get("/experiences/mine"),
      api.get("/travel-services/mine"),
      api.get("/places/mine")
    ]);
    setHotels(hotelResult.data);
    setExperiences(experienceResult.data);
    setServices(serviceResult.data);
    setPlaces(placeResult.data);
  }

  useEffect(() => {
    if (user?.role === "vendor" || user?.role === "admin") load().catch(() => setMessage("Could not load your listings."));
  }, [user]);

  if (!user) return <p>Please <Link className="text-brand-600" to="/login">sign in</Link> as a vendor to manage listings.</p>;
  if (!["vendor", "admin"].includes(user.role)) return <p className="text-sm">This area is for tourism businesses. Register a vendor account to list your hotel or experience.</p>;

  async function submitHotel(e) {
    e.preventDefault(); setMessage("");
    try {
      await api.post("/hotels", {
        ...hotelForm,
        pricePerNight: Number(hotelForm.pricePerNight),
        roomsAvailable: Number(hotelForm.roomsAvailable),
        amenities: hotelForm.amenities.split(",").map(x => x.trim()).filter(Boolean),
        images: hotelImages,
        location: {
          type: "Point",
          coordinates: [Number(hotelForm.longitude), Number(hotelForm.latitude)],
        },
      });
      setHotelForm(emptyHotel); setHotelImages([]); setMessage("Hotel listed successfully."); load();
    } catch (err) { setMessage(err.response?.data?.message || "Could not list hotel."); }
  }

  function readHotelImages(event) {
    const files = Array.from(event.target.files || []);
    Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(setHotelImages).catch(() => setMessage("Could not read the selected files."));
  }

  function readPlaceImages(event) {
    const files = Array.from(event.target.files || []);

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);

            reader.onerror = reject;

            reader.readAsDataURL(file);
          })
      )
    )
      .then(setPlaceImages)
      .catch(() =>
        setMessage("Could not read the selected place images.")
      );
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Location tracking is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setHotelForm((current) => ({
        ...current,
        latitude: coords.latitude.toFixed(6),
        longitude: coords.longitude.toFixed(6),
      })),
      () => setMessage("Could not get your location. Enter the coordinates manually."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }

  async function submitPlace(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/places", {
        name: placeForm.name,
        destination: placeForm.destination,
        state: placeForm.state,
        category: placeForm.category,
        description: placeForm.description,
        address: placeForm.address,

        tags: placeForm.tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        images: placeImages,

        latitude: placeForm.latitude
          ? Number(placeForm.latitude)
          : null,

        longitude: placeForm.longitude
          ? Number(placeForm.longitude)
          : null,
      });

      setPlaceForm(emptyPlace);
      setPlaceImages([]);

      setMessage("Place listed successfully.");

      load();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Could not list place."
      );
    }
  }

  async function submitExperience(e) {
    e.preventDefault(); setMessage("");
    try {
      await api.post("/experiences", { ...experienceForm, price: Number(experienceForm.price), durationHours: Number(experienceForm.durationHours) });
      setExperienceForm(emptyExperience); setMessage("Experience listed successfully."); load();
    } catch (err) { setMessage(err.response?.data?.message || "Could not list experience."); }
  }

  async function submitService(e) {
    e.preventDefault(); setMessage("");
    try {
      await api.post("/travel-services", { ...serviceForm, price: Number(serviceForm.price), capacity: Number(serviceForm.capacity), durationHours: Number(serviceForm.durationHours) });
      setServiceForm(emptyService); setMessage("Travel service listed successfully."); load();
    } catch (err) { setMessage(err.response?.data?.message || "Could not list travel service."); }
  }

  async function remove(kind, id) {
    if (!window.confirm("Remove this listing?")) return;

    try {
      await api.delete(`/${kind}/${id}`);
      await load();
      setMessage("Listing removed successfully.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Could not remove listing."
      );
    }
  }

  const field = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm";
  return <div className="space-y-6">
    <div><h1 className="text-xl font-bold">Vendor dashboard</h1><p className="text-sm text-gray-500">Add and manage your tourism offerings.</p></div>
    {message && <p className="text-sm text-brand-700">{message}</p>}
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submitHotel} className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">List a hotel or homestay</h2>
        {[['name', 'Property name'], ['destination', 'Destination'], ['state', 'State']].map(([key, label]) => <input key={key} required className={field} placeholder={label} value={hotelForm[key]} onChange={e => setHotelForm({ ...hotelForm, [key]: e.target.value })} />)}
        <div className="grid grid-cols-2 gap-3"><input required min="1" type="number" className={field} placeholder="Price per night" value={hotelForm.pricePerNight} onChange={e => setHotelForm({ ...hotelForm, pricePerNight: e.target.value })} /><input required min="0" type="number" className={field} placeholder="Rooms available" value={hotelForm.roomsAvailable} onChange={e => setHotelForm({ ...hotelForm, roomsAvailable: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <input required min="-90" max="90" step="any" type="number" className={field} placeholder="Latitude" value={hotelForm.latitude} onChange={e => setHotelForm({ ...hotelForm, latitude: e.target.value })} />
          <input required min="-180" max="180" step="any" type="number" className={field} placeholder="Longitude" value={hotelForm.longitude} onChange={e => setHotelForm({ ...hotelForm, longitude: e.target.value })} />
        </div>
        <button type="button" onClick={useCurrentLocation} className="text-left text-xs font-semibold text-brand-700 hover:underline">📍 Use my current location for this hotel</button>
        <label className="block text-xs font-medium text-gray-600">Hotel files (JPG, SVG, or PDF)
          <input type="file" accept=".jpg,.jpeg,.svg,.pdf,image/jpeg,image/svg+xml,application/pdf" multiple onChange={readHotelImages} className={`${field} mt-1 bg-white`} />
        </label>
        {hotelImages.length > 0 && <p className="text-xs text-gray-500">{hotelImages.length} file{hotelImages.length === 1 ? "" : "s"} selected.</p>}
        <input className={field} placeholder="Amenities, comma separated" value={hotelForm.amenities} onChange={e => setHotelForm({ ...hotelForm, amenities: e.target.value })} />
        <button className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">Publish hotel</button>
      </form>


      <section className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Add Tourist Place
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Add a destination or tourist attraction that visitors
            can discover on the Explore page.
          </p>
        </div>

        <form
          onSubmit={submitPlace}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            value={placeForm.name}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                name: e.target.value,
              })
            }
            placeholder="Place name"
            required
            className="px-3 py-2 border rounded-lg"
          />

          <input
            value={placeForm.destination}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                destination: e.target.value,
              })
            }
            placeholder="Destination e.g. Varanasi"
            required
            className="px-3 py-2 border rounded-lg"
          />

          <input
            value={placeForm.state}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                state: e.target.value,
              })
            }
            placeholder="State e.g. Uttar Pradesh"
            className="px-3 py-2 border rounded-lg"
          />

          <select
            value={placeForm.category}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                category: e.target.value,
              })
            }
            className="px-3 py-2 border rounded-lg"
          >
            <option>Tourist Attraction</option>
            <option>Temple</option>
            <option>Historical</option>
            <option>Nature</option>
            <option>Beach</option>
            <option>Fort</option>
            <option>Museum</option>
            <option>Adventure</option>
            <option>Other</option>
          </select>

          <input
            value={placeForm.address}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                address: e.target.value,
              })
            }
            placeholder="Address"
            className="px-3 py-2 border rounded-lg md:col-span-2"
          />

          <textarea
            value={placeForm.description}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                description: e.target.value,
              })
            }
            placeholder="Describe this place..."
            rows={4}
            className="px-3 py-2 border rounded-lg md:col-span-2"
          />

          <input
            value={placeForm.tags}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                tags: e.target.value,
              })
            }
            placeholder="Tags: temple, spiritual, history"
            className="px-3 py-2 border rounded-lg md:col-span-2"
          />

          <input
            value={placeForm.latitude}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                latitude: e.target.value,
              })
            }
            placeholder="Latitude"
            type="number"
            step="any"
            className="px-3 py-2 border rounded-lg"
          />

          <input
            value={placeForm.longitude}
            onChange={(e) =>
              setPlaceForm({
                ...placeForm,
                longitude: e.target.value,
              })
            }
            placeholder="Longitude"
            type="number"
            step="any"
            className="px-3 py-2 border rounded-lg"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place Images
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={readPlaceImages}
              className="block w-full text-sm"
            />
          </div>

          <button
            type="submit"
            className="md:col-span-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-semibold"
          >
            Add Place
          </button>
        </form>
      </section>

      <form onSubmit={submitExperience} className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">List an experience</h2>
        {[['title', 'Experience title'], ['destination', 'Destination']].map(([key, label]) => <input key={key} required className={field} placeholder={label} value={experienceForm[key]} onChange={e => setExperienceForm({ ...experienceForm, [key]: e.target.value })} />)}
        <select className={field} value={experienceForm.category} onChange={e => setExperienceForm({ ...experienceForm, category: e.target.value })}>{["Adventure", "Cultural", "Food & Dining", "Nature", "Wellness"].map(x => <option key={x}>{x}</option>)}</select>
        <div className="grid grid-cols-2 gap-3"><input required min="1" type="number" className={field} placeholder="Price" value={experienceForm.price} onChange={e => setExperienceForm({ ...experienceForm, price: e.target.value })} /><input required min="1" type="number" className={field} placeholder="Hours" value={experienceForm.durationHours} onChange={e => setExperienceForm({ ...experienceForm, durationHours: e.target.value })} /></div>
        <button className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">Publish experience</button>
      </form>
    </div>
    <form onSubmit={submitService} className="bg-white border rounded-xl p-5 space-y-3">
      <h2 className="font-semibold">List local travel support</h2>
      <div className="grid md:grid-cols-3 gap-3"><input required className={field} placeholder="Service name" value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} /><input required className={field} placeholder="Destination" value={serviceForm.destination} onChange={e => setServiceForm({ ...serviceForm, destination: e.target.value })} /><select className={field} value={serviceForm.type} onChange={e => setServiceForm({ ...serviceForm, type: e.target.value })}>{["Taxi", "Airport Transfer", "Local Guide", "Bus", "Car Rental"].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="grid md:grid-cols-3 gap-3"><input required min="1" type="number" className={field} placeholder="Price" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} /><input required min="1" type="number" className={field} placeholder="Capacity" value={serviceForm.capacity} onChange={e => setServiceForm({ ...serviceForm, capacity: e.target.value })} /><input required min="1" type="number" className={field} placeholder="Hours" value={serviceForm.durationHours} onChange={e => setServiceForm({ ...serviceForm, durationHours: e.target.value })} /></div>
      <button className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">Publish travel service</button>
    </form>
    <div className="grid lg:grid-cols-3 gap-6"><Listing title="Your hotels" entries={hotels} kind="hotels" onRemove={remove} render={h => `${h.name} · ${h.destination} · ₹${h.pricePerNight}/night`} /><Listing title="Your experiences" entries={experiences} kind="experiences" onRemove={remove} render={e => `${e.title} · ${e.destination} · ₹${e.price}`} /><Listing title="Your travel services" entries={services} kind="travel-services" onRemove={remove} render={s => `${s.title} · ${s.destination} · ₹${s.price}`} /></div>
  </div>;
}

function Listing({ title, entries, kind, onRemove, render }) {
  return <section className="bg-white border rounded-xl p-5"><h2 className="font-semibold mb-3">{title}</h2>{entries.length ? <div className="space-y-2">{entries.map(entry => <div className="flex justify-between gap-3 text-sm border-b pb-2" key={entry._id}><span>{render(entry)}</span><button onClick={() => onRemove(kind, entry._id)} className="text-red-600">Remove</button></div>)}</div> : <p className="text-sm text-gray-400">No listings yet.</p>}</section>;
}
