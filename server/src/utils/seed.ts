import { Event } from "../models/Event";
import { User } from "../models/User";

const cityData = [
  { city: "Mumbai", venues: ["Skyline Arena", "Harbor Convention Hall", "Marine Drive Expo Center"] },
  { city: "Bengaluru", venues: ["Global Convention Center", "Tech Valley Hub", "Garden City Pavilion"] },
  { city: "Delhi", venues: ["Imperial Grounds", "City Heritage Hall", "Capital Event Forum"] },
  { city: "Hyderabad", venues: ["Silicon Convention Plaza", "Charminar Expo Hall", "Lakeview Center"] },
  { city: "Pune", venues: ["Green Gardens Hub", "Western Arena", "Innovation Courtyard"] },
  { city: "Goa", venues: ["Ocean Blue Coast", "Sunset Arena", "Beachside Festival Grounds"] },
  { city: "Jaipur", venues: ["Grand Palace Convention Hall", "Royal Courtyard", "Pink City Expo"] },
  { city: "Chennai", venues: ["Marina Arts Center", "Coastal Hall", "South Bay Pavilion"] },
  { city: "Kolkata", venues: ["Heritage Culture Dome", "Foodie Square", "Riverside Forum"] },
  { city: "Ahmedabad", venues: ["Finance Hub", "Sabarmati Center", "Westside Arena"] },
];

const categories = [
  {
    category: "Concerts",
    titles: ["Neon Dreams", "Pulse Live", "Midnight Echoes", "City Beats", "Electric Horizon"],
    images: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
    ],
    highlights: ["VIP crowd energy", "Live artist showcase", "Stage and lighting drama", "Food and lounge access"],
    priceRange: [899, 3499],
  },
  {
    category: "Workshops",
    titles: ["Design Sprint Lab", "Creator Bootcamp", "Photography Masterclass", "AI Builder Camp", "Wellness Reset"],
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1522202222206-b7501f8c1a10?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    ],
    highlights: ["Hands-on practice booths", "Trainer-led sessions", "Toolkit and resources", "Small group interaction"],
    priceRange: [299, 2499],
  },
  {
    category: "Seminars",
    titles: ["Future of Growth", "Investor Strategy Meet", "Leadership Forum", "Climate Action Talk", "Digital Trust Summit"],
    images: [
      "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1560523159-4a9692d222f9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
    ],
    highlights: ["Keynote speaker lineup", "Industry networking", "Knowledge sessions", "Business insight panels"],
    priceRange: [0, 1499],
  },
  {
    category: "Corporate",
    titles: ["Innovation Summit", "Founder Network Day", "Global AI Summit", "Enterprise Connect", "Product Leaders Forum"],
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
    ],
    highlights: ["Executive networking", "Premium hospitality", "Brand-led experiences", "Presentation-ready venue design"],
    priceRange: [1499, 5999],
  },
  {
    category: "Weddings",
    titles: ["Wedding Luxe Expo", "Bridal Vision Showcase", "Destination Wedding Fair", "Celebration Planner Meet", "Luxury Decor Edit"],
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200",
    ],
    highlights: ["Decor inspiration", "Luxury venue styling", "Bridal fashion moments", "Celebration planning ideas"],
    priceRange: [499, 1999],
  },
];

const monthValues = ["05", "06", "07", "08", "09", "10", "11", "12"];

const generateDemoEvents = () => {
  const events: any[] = [];
  let counter = 0;

  categories.forEach((categoryDef, categoryIndex) => {
    cityData.forEach((city, cityIndex) => {
      for (let i = 0; i < 3; i += 1) {
        const titleBase = categoryDef.titles[(cityIndex + i) % categoryDef.titles.length];
        const title = `${titleBase} ${city.city} ${2026 + (i % 2)}`;
        const month = monthValues[(categoryIndex + cityIndex + i) % monthValues.length];
        const day = String(((cityIndex * 3 + i * 5) % 27) + 1).padStart(2, "0");
        const minPrice = categoryDef.priceRange[0];
        const maxPrice = categoryDef.priceRange[1];
        const price = minPrice + ((counter * 317) % Math.max(1, maxPrice - minPrice + 1));

        const imageSet = categoryDef.images;
        const galleryImages = Array.from({ length: Math.min(6, imageSet.length) }, (_, galleryIndex) => imageSet[(cityIndex + i + categoryIndex + galleryIndex) % imageSet.length]);
        const image = galleryImages[0];

        events.push({
          title,
          description: `${title} is a curated ${categoryDef.category.toLowerCase()} experience designed for audiences in ${city.city}. Expect a polished venue setup, verified ticketing, and premium event operations from EventSphere.`,
          date: `2026-${month}-${day}`,
          time: `${String(9 + ((counter + i) % 10)).padStart(2, "0")}:00`,
          location: `${city.venues[i % city.venues.length]}, ${city.city}`,
          category: categoryDef.category,
          image,
          galleryImages,
          highlightPoints: categoryDef.highlights,
          price,
          ticketsAvailable: 120 + ((counter * 23) % 280),
          isSponsored: counter % 11 === 0,
        });
        counter += 1;
      }
    });
  });

  return events;
};

export const seedDatabase = async () => {
  let organizer = await User.findOne({ email: "organizer@eventsphere.com" }).select("+password");

  if (!organizer) {
    organizer = await User.create({
      name: "Demo Organizer",
      email: "organizer@eventsphere.com",
      password: "password123",
      role: "organizer",
    });
  }

  const adminExists = await User.findOne({ email: "admin@eventsphere.com" });
  if (!adminExists) {
    await User.create({
      name: "Platform Admin",
      email: "admin@eventsphere.com",
      password: "password123",
      role: "admin",
    });
  }

  const demoUserExists = await User.findOne({ email: "user@eventsphere.com" });
  if (!demoUserExists) {
    await User.create({
      name: "Demo User",
      email: "user@eventsphere.com",
      password: "password123",
      role: "user",
    });
  }

  const eventCount = await Event.countDocuments();
  if (eventCount === 0 && organizer) {
    const demoEvents = generateDemoEvents();
    await Event.insertMany(
      demoEvents.map((event) => ({
        ...event,
        organizer: organizer!._id,
        organizerName: organizer!.name,
        status: "approved",
      }))
    );
  }
};
