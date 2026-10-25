export const ROLES = {
  BUYER: 'ROLE_BUYER',
  SELLER: 'ROLE_SELLER',
  ADMIN: 'ROLE_ADMIN',
};

export const SELLER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

export const ORDER_STATUS = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', shortName: 'All in One', icon: 'Grid', banner: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80' },
  { id: 'dresses', name: 'Dresses & Fashion', shortName: 'Dresses', icon: 'Shirt', banner: '/dress_150.png' },
  { id: 'shoes', name: 'Shoes & Sneakers', shortName: 'Shoes', icon: 'Footprints', banner: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
  { id: 'slippers', name: 'Slippers & Slides', shortName: 'Slippers', icon: 'Sparkles', banner: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80' },
  { id: 'furniture', name: 'Furniture & Living', shortName: 'Furniture', icon: 'Armchair', banner: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
  { id: 'home-appliances', name: 'Home Appliances', shortName: 'Home Appliances', icon: 'Zap', banner: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80' },
  { id: 'toys', name: 'Toys & Kids', shortName: 'Toys', icon: 'Gamepad2', banner: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80' },
  { id: 'sports', name: 'Sports & Fitness', shortName: 'Sports', icon: 'Trophy', banner: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80' },
  { id: 'electronics', name: 'Electronics & Audio', shortName: 'Electronics', icon: 'Headphones', banner: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
];

export const INITIAL_PRODUCTS = [
  // --- 1. DRESSES & FASHION ---
  {
    id: 'prod-dress-001',
    name: 'Aura Handcrafted Chanderi Silk Anarkali Set',
    tagline: 'Pure Chanderi Silk with Intricate Zari Embroidery & Organza Dupatta',
    category: 'dresses',
    price: 349900, // ₹3,499.00
    originalPrice: 799900, // ₹7,999.00
    discountPercent: 56,
    rating: 4.8,
    reviewsCount: 428,
    stock: 35,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-riwayat',
    sellerName: 'Riwayat Ethnic Studio',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
    ],
    description: 'Impeccably tailored festive Anarkali set woven from pure Chanderi silk. Features detailed hand-stitched gotta patti work and a flowing matching organza dupatta.',
    specs: {
      'Fabric': 'Pure Chanderi Silk with Cotton Mulmul Lining',
      'Set Includes': 'Anarkali Kurta, Churidar & Dupatta',
      'Occasion': 'Festive, Wedding Guest & Celebrations',
      'Care': 'Dry Clean Recommended'
    }
  },
  {
    id: 'prod-dress-002',
    name: 'Flora Meadow Tiered Cotton Summer Maxi Dress',
    tagline: 'Breathable Organic Cotton with Smocked Bodice & Flutter Sleeves',
    category: 'dresses',
    price: 189900, // ₹1,899.00
    originalPrice: 399900,
    discountPercent: 52,
    rating: 4.7,
    reviewsCount: 615,
    stock: 50,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-zaraluxe',
    sellerName: 'Zara Luxe India',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80'
    ],
    description: 'Flowy, ultra-comfortable maxi dress designed for balmy summer afternoons. Features a flattering smocked bust, delicate tiered silhouette, and dual hidden side pockets.',
    specs: {
      'Material': '100% Breathable Organic Voile Cotton',
      'Fit': 'Relaxed Tiered A-Line Fit',
      'Length': 'Ankle Length (Maxi)',
      'Care': 'Gentle Machine Wash'
    }
  },
  {
    id: 'prod-dress-003',
    name: 'Velvet Noir Evening Slit Cocktail Gown',
    tagline: 'Luxe Emerald Stitched Bodycon Drape with Asymmetrical Neckline',
    category: 'dresses',
    price: 429900, // ₹4,299.00
    originalPrice: 899900,
    discountPercent: 52,
    rating: 4.9,
    reviewsCount: 234,
    stock: 20,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-zaraluxe',
    sellerName: 'Zara Luxe India',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80'
    ],
    description: 'Turn heads at galas and cocktail evenings. Tailored from premium stretch velvet with a graceful side slit and structured boning for an impeccable silhouette.',
    specs: {
      'Fabric': 'High-Density Stretch Silk Velvet',
      'Closure': 'Concealed Back Zipper with Hook',
      'Style': 'Bodycon Evening Gown',
      'Care': 'Specialist Dry Clean Only'
    }
  },
  {
    id: 'prod-dress-004',
    name: 'Pure French Linen Relaxed Resort Shirt & Trousers',
    tagline: 'Normcore European Linen Co-ord Set with Mother-of-Pearl Buttons',
    category: 'dresses',
    price: 249900, // ₹2,499.00
    originalPrice: 499900,
    discountPercent: 50,
    rating: 4.6,
    reviewsCount: 310,
    stock: 40,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-urbankicks',
    sellerName: 'Urban Kicks Official',
    sellerRating: 4.7,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'
    ],
    description: 'The definitive resortwear uniform. Sourced from authentic French flax linen, pre-washed for effortless softness that looks even better with age.',
    specs: {
      'Fabric': '100% French Flax Linen (210 GSM)',
      'Fit': 'Oversized Cuban Collar Shirt + Elastic Drawstring Trousers',
      'Pockets': '3 Utility Pockets',
      'Care': 'Machine Wash Cold'
    }
  },

  // --- 2. SHOES & SNEAKERS ---
  {
    id: 'prod-shoe-001',
    name: 'Velocity Hyper-Bounce Pro Running Shoes',
    tagline: 'Air-Mesh Upper with Dynamic Carbon Propulsion Plate',
    category: 'shoes',
    price: 449900, // ₹4,499.00
    originalPrice: 899900,
    discountPercent: 50,
    rating: 4.9,
    reviewsCount: 940,
    stock: 55,
    has3DModel: true,
    modelShape: 'sneaker',
    featured: true,
    sellerId: 'seller-nikestore',
    sellerName: 'Nike Store Authorized',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'
    ],
    description: 'Engineered for elite marathoners and morning runners alike. Features supercritical nitrogen foam cushioning and a curved carbon fiber return shank for responsive propulsion.',
    specs: {
      'Weight': '215g (Single shoe UK 8)',
      'Drop': '8mm Heel-to-Toe Drop',
      'Upper': 'Monofilament Engineered Breathable Mesh',
      'Sole': 'Supercritical Nitrogen Foam + Carbon Plate'
    }
  },
  {
    id: 'prod-shoe-002',
    name: 'Heritage Italian Leather Oxford Formal Shoes',
    tagline: 'Hand-Burnished Full Grain Calfskin with Blake Stitched Leather Sole',
    category: 'shoes',
    price: 599900, // ₹5,999.00
    originalPrice: 1199900,
    discountPercent: 50,
    rating: 4.8,
    reviewsCount: 380,
    stock: 25,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-clarks',
    sellerName: 'Clarks Premium Footwear',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80'
    ],
    description: 'Handcrafted by third-generation Tuscan artisans using genuine full-grain leather. Finished with deep hand-burnishing and a breathable cork-filled insole for all-day boardrooms.',
    specs: {
      'Upper': '100% Full Grain Italian Calf Leather',
      'Sole': 'Traditional Blake-Stitched Hardwood & Rubber Sole',
      'Insole': 'Orthopedic Cork & Memory Cushioning',
      'Origin': 'Handcrafted in Italy'
    }
  },
  {
    id: 'prod-shoe-003',
    name: 'StreetVibe Retro High-Top Canvas Sneakers',
    tagline: 'Vulcanized Gum Rubber Sole with Heavyweight 14oz Canvas',
    category: 'shoes',
    price: 219900, // ₹2,199.00
    originalPrice: 449900,
    discountPercent: 51,
    rating: 4.6,
    reviewsCount: 520,
    stock: 70,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-urbankicks',
    sellerName: 'Urban Kicks Official',
    sellerRating: 4.7,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'
    ],
    description: 'Timeless vintage court sneaker silhouette built with heavy-duty 14oz dyed canvas and diamond-pattern vulcanized rubber for skateboards and street walks.',
    specs: {
      'Upper': '14oz Cotton Duck Canvas',
      'Outsole': 'Diamond Vulcanized Non-Marking Gum Rubber',
      'Insole': 'Cushioned Removable EVA Foam',
      'Laces': 'Double-Weave Cotton Laces'
    }
  },
  {
    id: 'prod-shoe-004',
    name: 'TerraTrack All-Terrain Waterproof Hiking Shoes',
    tagline: 'Vibram MegaGrip Outsole with HydroGuard Breathable Membrane',
    category: 'shoes',
    price: 389900, // ₹3,899.00
    originalPrice: 749900,
    discountPercent: 48,
    rating: 4.8,
    reviewsCount: 290,
    stock: 30,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-decathlon',
    sellerName: 'Decathlon Sports India',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80'
    ],
    description: 'Conquer wet mountain trails, rocky inclines, and city monsoon downpours. Keeps feet 100% dry while shedding sweat moisture through an active HydroGuard lining.',
    specs: {
      'Waterproofing': 'HydroGuard 15,000mm Membrane',
      'Outsole': '5mm Lug Vibram MegaGrip Rubber',
      'Toe Protection': 'Reinforced Thermoplastic Rubber Bumper',
      'Support': 'TPU Torsional Stability Shank'
    }
  },

  // --- 3. SLIPPERS & SLIDES ---
  {
    id: 'prod-slip-001',
    name: 'CloudStep Orthopedic Ultra-Cushion Slides',
    tagline: 'Ergonomic Arch Support with 4cm High-Density EVA Cloud Pillow',
    category: 'slippers',
    price: 89900, // ₹899.00
    originalPrice: 199900,
    discountPercent: 55,
    rating: 4.8,
    reviewsCount: 1420,
    stock: 120,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-doctorsole',
    sellerName: 'Doctor Sole Ortho Care',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80'
    ],
    description: 'Feels like walking on clouds. Recommended by physiotherapists for plantar fasciitis, heel pain, and post-workout muscle recovery. Waterproof and anti-slip.',
    specs: {
      'Sole Thickness': '4.0 cm Cloud Cushioning',
      'Material': 'Medical-Grade High-Elastic EVA Foam',
      'Arch Support': 'Built-In Anatomical Longitudinal Arch',
      'Waterproof': '100% Washable & Quick Dry'
    }
  },
  {
    id: 'prod-slip-002',
    name: 'Heritage Genuine Leather Comfort Thong Slippers',
    tagline: 'Hand-Stitched Broad Comfort Straps with Deep Contoured Footbed',
    category: 'slippers',
    price: 129900, // ₹1,299.00
    originalPrice: 279900,
    discountPercent: 53,
    rating: 4.7,
    reviewsCount: 780,
    stock: 65,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-bata',
    sellerName: 'Bata Lifestyle Hub',
    sellerRating: 4.7,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80'
    ],
    description: 'Classic everyday Indian comfort footwear. Crafted with durable full-grain buff leather straps, soft toe-separator fabric, and anti-slip grooved rubber base.',
    specs: {
      'Strap Material': '100% Genuine Milled Leather',
      'Footbed': 'Dual-Density Foam with Leatherette Lining',
      'Outsole': 'Non-Marking Anti-Skid Rubber',
      'Fit': 'Standard Indian Comfort Fit'
    }
  },
  {
    id: 'prod-slip-003',
    name: 'CozySherpa Breathable Memory Foam House Clogs',
    tagline: 'Warm Plush Fleece Lining with All-Day Indoor/Outdoor Rubber Sole',
    category: 'slippers',
    price: 99900, // ₹999.00
    originalPrice: 229900,
    discountPercent: 56,
    rating: 4.8,
    reviewsCount: 610,
    stock: 80,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-doctorsole',
    sellerName: 'Doctor Sole Ortho Care',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80'
    ],
    description: 'Slide into immediate warmth after a long day. Memory foam molds to the unique contours of your feet while the durable rubber sole lets you step out to fetch mail.',
    specs: {
      'Lining': 'High-Pile Thermal Sherpa Fleece',
      'Insole': '70D High-Density Memory Foam',
      'Outsole': 'Water-Resistant Grippy TPR Sole',
      'Care': 'Machine Washable on Delicate'
    }
  },
  {
    id: 'prod-slip-004',
    name: 'WaveGlide Anti-Skid Beach & Pool Flip-Flops',
    tagline: 'Hydrophobic Quick-Dry Rubber with Diamond Tread Grip',
    category: 'slippers',
    price: 49900, // ₹499.00
    originalPrice: 99900,
    discountPercent: 50,
    rating: 4.5,
    reviewsCount: 890,
    stock: 150,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-urbankicks',
    sellerName: 'Urban Kicks Official',
    sellerRating: 4.7,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'
    ],
    description: 'Lightweight, cheerful, and practically indestructible. Perfect for Goa beach vacations, swimming pools, bathrooms, and casual weekend grocery runs.',
    specs: {
      'Material': '100% Flexible Natural Rubber Compound',
      'Weight': '110 grams per slipper',
      'Color Resistance': 'UV-Resistant Vibrant Dye',
      'Grip': 'Wet-Surface Wave Tread'
    }
  },

  // --- 4. FURNITURE & LIVING ---
  {
    id: 'prod-furn-001',
    name: 'ErgoFit High-Back Mesh Executive Office Chair',
    tagline: 'Adaptive Lumbar Support, 3D Armrests & Heavy-Duty Gas Lift',
    category: 'furniture',
    price: 899900, // ₹8,999.00
    originalPrice: 1899900,
    discountPercent: 52,
    rating: 4.8,
    reviewsCount: 650,
    stock: 25,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-greensoul',
    sellerName: 'Green Soul Ergonomics',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1580481077111-9a7f34c2ee10?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1580481077111-9a7f34c2ee10?w=800&q=80'
    ],
    description: 'Say goodbye to work-from-home spine fatigue. Features breathable German mesh, self-adjusting lumbar curve, 135° recline lock, and BIFMA certified class 4 hydraulics.',
    specs: {
      'Backrest': 'Breathable Tensile Polyester Mesh',
      'Mechanism': 'Any-Angle Multi-Lock Synchro Tilt',
      'Weight Capacity': 'Tested up to 140 kg',
      'Warranty': '3 Years Manufacturer Replacement Warranty'
    }
  },
  {
    id: 'prod-furn-002',
    name: 'Solid Sheesham Wood Minimalist Study & Laptop Desk',
    tagline: 'Warm Teak Finish with Dual Soft-Close Drawers & Cable Channel',
    category: 'furniture',
    price: 1149900, // ₹11,499.00
    originalPrice: 2299900,
    discountPercent: 50,
    rating: 4.9,
    reviewsCount: 310,
    stock: 18,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-urbanliving',
    sellerName: 'Urban Living Woodcrafts',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
    ],
    description: 'Crafted from 100% kiln-dried seasoned Sheesham rosewood. Rich grain texture, chamfered corner edges for wrist comfort, and integrated hidden power cord grommets.',
    specs: {
      'Wood Type': '100% Seasoned Solid Sheesham Rosewood',
      'Dimensions': '48" Length x 24" Width x 30" Height',
      'Drawers': '2 Soft-Close Telescopic Slider Drawers',
      'Assembly': 'Free Carpenter Installation Included'
    }
  },
  {
    id: 'prod-furn-003',
    name: 'Nordic Accent Velvet Lounge Armchair',
    tagline: 'Tapered Solid Beechwood Legs with High-Resilience Foam Tufting',
    category: 'furniture',
    price: 1499900, // ₹14,999.00
    originalPrice: 2899900,
    discountPercent: 48,
    rating: 4.7,
    reviewsCount: 180,
    stock: 12,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-ikea',
    sellerName: 'IKEA Home Official',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ],
    description: 'An architectural statement piece for your living room or reading nook. Covered in jewel-toned stain-resistant velvet with high-density pocket spring cushion.',
    specs: {
      'Upholstery': 'Stain-Resistant High-Martindale Velvet',
      'Legs': 'Solid Natural Beechwood with Brass Ferrules',
      'Cushioning': 'Pocket Springs + 35-Density Foam',
      'Capacity': 'Holds up to 160 kg'
    }
  },
  {
    id: 'prod-furn-004',
    name: 'Modern 5-Tier Industrial Display Bookshelf',
    tagline: 'Matte Black Steel Frame with Water-Resistant Rustic Oak Shelves',
    category: 'furniture',
    price: 449900, // ₹4,499.00
    originalPrice: 899900,
    discountPercent: 50,
    rating: 4.6,
    reviewsCount: 420,
    stock: 35,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-urbanliving',
    sellerName: 'Urban Living Woodcrafts',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80'
    ],
    description: 'Display your favorite books, indoor plants, and collector figures in style. Sturdy X-brace structural back ensures rock-solid stability on all floor surfaces.',
    specs: {
      'Frame': 'Powder-Coated Anti-Rust Steel Tube',
      'Shelves': '5 tiers of 18mm Engineered Oak Board',
      'Dimensions': '65" Height x 32" Width x 12" Depth',
      'Load Per Shelf': 'Up to 25 kg per tier'
    }
  },

  // --- 5. HOME APPLIANCES ---
  {
    id: 'prod-app-001',
    name: 'Barista Touch 20-Bar Professional Espresso Machine',
    tagline: 'Integrated Conical Burr Grinder, Micro-Foam Steam Wand & PID Control',
    category: 'home-appliances',
    price: 1699900, // ₹16,999.00
    originalPrice: 3299900,
    discountPercent: 48,
    rating: 4.9,
    reviewsCount: 510,
    stock: 22,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-philips',
    sellerName: 'Philips Home Appliances',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&q=80'
    ],
    description: 'Transform your kitchen into a Milanese café. 20-bar Italian pump extracts silky golden crema while the stainless steam wand crafts barista-grade latte art foam.',
    specs: {
      'Pump Pressure': '20 Bar High-Precision Italian Pump',
      'Grinder': 'Built-In Stainless Steel Conical Burr (15 Grind Sizes)',
      'Water Tank': '2.2L Detachable Clear Reservoir',
      'Power': '1450 Watts Fast Thermo-Block Heating'
    }
  },
  {
    id: 'prod-app-002',
    name: 'CleanBot X9 LiDAR Smart Robot Vacuum & Mop',
    tagline: '5000Pa Cyclone Suction, Smart Multi-Floor Mapping & Auto-Dock',
    category: 'home-appliances',
    price: 2199900, // ₹21,999.00
    originalPrice: 3999900,
    discountPercent: 45,
    rating: 4.8,
    reviewsCount: 380,
    stock: 16,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-techhub',
    sellerName: 'TechHub Retailers Pvt Ltd',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80'
    ],
    description: 'Automate everyday floor cleaning with 360° laser LiDAR navigation that navigates around toys and chairs without bumping. Vacuum and sonic mop in one single pass.',
    specs: {
      'Suction Power': '5000Pa Hyper-Cyclone Motor',
      'Mopping': 'High-Frequency Sonic Vibration Mop Pad',
      'Battery': '5200mAh (Up to 180 mins runtime / 2500 sq ft)',
      'App Control': 'Alexa, Google Home & Smartphone App'
    }
  },
  {
    id: 'prod-app-003',
    name: 'AeroCrisp 6.5L Digital Vortex Rapid Air Fryer',
    tagline: '12-in-1 One-Touch Smart Presets with 85% Less Cooking Oil',
    category: 'home-appliances',
    price: 499900, // ₹4,999.00
    originalPrice: 999900,
    discountPercent: 50,
    rating: 4.8,
    reviewsCount: 1120,
    stock: 45,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-philips',
    sellerName: 'Philips Home Appliances',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80'
    ],
    description: 'Crispy samosas, golden french fries, and roasted chicken with just one spoon of oil. 360° rapid cyclonic heat delivers crispy exteriors and tender, juicy interiors.',
    specs: {
      'Capacity': '6.5 Liters (Large family size)',
      'Presets': '12 Presets (Fries, Bake, Roast, Dehydrate, Reheat)',
      'Coating': 'Non-Stick BPA/PFOA-Free Ceramic Basket',
      'Dishwasher Safe': 'Yes, basket and tray are removable'
    }
  },
  {
    id: 'prod-app-004',
    name: 'NutriPro 1200W Commercial High-Speed Blender',
    tagline: '6 Aircraft-Grade Titanium Blades with 3 Pulse Modes & 2 Tritan Cups',
    category: 'home-appliances',
    price: 349900, // ₹3,499.00
    originalPrice: 699900,
    discountPercent: 50,
    rating: 4.7,
    reviewsCount: 840,
    stock: 60,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-havells',
    sellerName: 'Havells Kitchenware',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80'
    ],
    description: 'Pulverize tough seeds, frozen fruits, coconut, and ice into silky morning smoothies in under 30 seconds. Includes two on-the-go travel cups with sip lids.',
    specs: {
      'Motor': '1200W Pure Copper High-Torque Motor (24,000 RPM)',
      'Blades': '6 Titanium Nitride Coated Extractor Blades',
      'Cups': '900ml & 600ml Shatterproof BPA-Free Tritan',
      'Warranty': '2 Years Comprehensive Motor Warranty'
    }
  },

  // --- 6. TOYS & KIDS ---
  {
    id: 'prod-toy-001',
    name: 'Galaxy Explorer STEM Space Shuttle Construction Kit',
    tagline: '980 Interlocking Precision Pieces with Cockpit & Satellite',
    category: 'toys',
    price: 279900, // ₹2,799.00
    originalPrice: 549900,
    discountPercent: 49,
    rating: 4.9,
    reviewsCount: 540,
    stock: 40,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-lego',
    sellerName: 'Lego Creations & Fun',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'
    ],
    description: 'Ignite curiosity for aerospace engineering! Detailed space shuttle build featuring openable payload bay doors, robotic Canadarm, deployable solar panel satellite, and astronaut crew.',
    specs: {
      'Pieces': '980 High-Precision ABS Blocks (Compatible with Lego)',
      'Recommended Age': '8+ Years & Adult STEM Builders',
      'Features': 'Working Retractable Landing Gear & Payload Bay',
      'Instruction': 'Full-Color Step-by-Step 120-Page Manual'
    }
  },
  {
    id: 'prod-toy-002',
    name: 'Montessori Wooden Multi-Activity Educational Cube',
    tagline: '5-in-1 Sensory Bead Maze, Shape Sorter & Abacus Clock',
    category: 'toys',
    price: 149900, // ₹1,499.00
    originalPrice: 299900,
    discountPercent: 50,
    rating: 4.8,
    reviewsCount: 820,
    stock: 55,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-littlegenius',
    sellerName: 'Little Genius Toys',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'
    ],
    description: 'Promotes fine motor dexterity, color recognition, hand-eye coordination, and spatial logic. Crafted from sustainably harvested birchwood with non-toxic water-based paints.',
    specs: {
      'Material': 'Natural Birchwood with Smooth Chamfered Edges',
      'Paint': '100% Non-Toxic Lead-Free Child-Safe Paint',
      'Age Group': '1 to 5 Years Old Toddlers',
      'Safety': 'EN71 & ASTM F963 Toy Safety Certified'
    }
  },
  {
    id: 'prod-toy-003',
    name: '4WD High-Speed All-Terrain Desert RC Buggy',
    tagline: '36 km/h Top Speed, 2.4GHz Proportional Control & Dual Batteries',
    category: 'toys',
    price: 299900, // ₹2,999.00
    originalPrice: 599900,
    discountPercent: 50,
    rating: 4.7,
    reviewsCount: 460,
    stock: 30,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-gamersguild',
    sellerName: 'Gamers Guild Apex Stores',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'
    ],
    description: 'Tackle grass, mud, gravel, and sand with independent oil-filled suspension shock absorbers, metal differential gears, and splash-proof electronics.',
    specs: {
      'Top Speed': '36 km/h with High-Torque 390 Carbon Motor',
      'Remote Range': 'Up to 80 meters on 2.4GHz Anti-Interference',
      'Battery': 'Includes 2x 7.4V 1500mAh Li-ion Packs (40 mins play)',
      'Drive': 'Full-Time 4-Wheel Shaft Drive (4WD)'
    }
  },
  {
    id: 'prod-toy-004',
    name: 'Giant 3-Foot Super-Soft Cuddle Companion Bear',
    tagline: 'Hypoallergenic Virgin Cotton Filling with Embroidered Child-Safe Eyes',
    category: 'toys',
    price: 129900, // ₹1,299.00
    originalPrice: 269900,
    discountPercent: 51,
    rating: 4.8,
    reviewsCount: 710,
    stock: 45,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-littlegenius',
    sellerName: 'Little Genius Toys',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'
    ],
    description: 'The ultimate huggable friend for birthdays, baby showers, and cozy bedrooms. Unbelievably soft silky fur that doesn’t shed or cause allergic sneezes.',
    specs: {
      'Height': '92 cm (3 Feet)',
      'Filling': '100% Microfiber Virgin Polyfill',
      'Washing': 'Surface Washable with Mild Detergent',
      'Safety': 'Embroidered Facial Features (No Plastic Choking Hazards)'
    }
  },

  // --- 7. SPORTS & FITNESS ---
  {
    id: 'prod-sport-001',
    name: 'ProAlignment Eco Natural Rubber Yoga Mat (6mm)',
    tagline: 'Laser-Etched Body Alignment Guides with Sweat-Activated Grip',
    category: 'sports',
    price: 189900, // ₹1,899.00
    originalPrice: 399900,
    discountPercent: 52,
    rating: 4.9,
    reviewsCount: 920,
    stock: 65,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-decathlon',
    sellerName: 'Decathlon Sports India',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'
    ],
    description: 'Perfect your poses with precision alignment lines. Made from sustainably tapped biodegradable tree rubber. The wetter your hands get with sweat, the grippier it becomes.',
    specs: {
      'Thickness': '6mm High-Density Joint Cushioning',
      'Material': '100% Natural Tree Rubber Base + Non-Slip PU Surface',
      'Dimensions': '72" Length x 26" Extra-Wide Width',
      'Includes': 'Free Cotton Carrying Strap'
    }
  },
  {
    id: 'prod-sport-002',
    name: 'Quick-Dial Adjustable Smart Dumbbell Pair (2.5kg - 24kg)',
    tagline: '15 Weight Combinations in 1 Compact Stand with Knurled Steel Grip',
    category: 'sports',
    price: 1299900, // ₹12,999.00
    originalPrice: 2499900,
    discountPercent: 48,
    rating: 4.9,
    reviewsCount: 410,
    stock: 20,
    has3DModel: false,
    featured: true,
    sellerId: 'seller-decathlon',
    sellerName: 'Decathlon Sports India',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80'
    ],
    description: 'Replace an entire dumbbell rack taking up precious floor space. Simply turn the dial to select from 2.5 kg up to 24 kg per hand in 1.5 kg increments.',
    specs: {
      'Weight Range': '2.5 kg to 24 kg (5 lbs to 52.5 lbs) per dumbbell',
      'Increments': '15 Selected Weight Settings',
      'Plates': 'Molding-Coated Steel Plates for Clank-Free Silence',
      'Tray': 'Includes 2 Heavy-Duty Storage Trays'
    }
  },
  {
    id: 'prod-sport-003',
    name: 'AeroBlade Pro High-Modulus Carbon Badminton Duo',
    tagline: 'Isometric Head with 30 lbs Max Tension & Thermal Full Cover',
    category: 'sports',
    price: 249900, // ₹2,499.00
    originalPrice: 499900,
    discountPercent: 50,
    rating: 4.8,
    reviewsCount: 630,
    stock: 45,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-decathlon',
    sellerName: 'Decathlon Sports India',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80'
    ],
    description: 'Dominate smash courts with blazing racket swing speed. Toray 30T carbon fiber shaft absorbs vibrations while generating explosive power for smashes.',
    specs: {
      'Weight': '4U (82-84 grams) Even Balance',
      'Tension': 'Pre-strung at 26 lbs (Supported up to 30 lbs)',
      'Frame': 'Box-Frame High-Modulus Graphite',
      'Package': 'Set of 2 Rackets + 3 Feather Shuttles + Full Cover'
    }
  },
  {
    id: 'prod-sport-004',
    name: 'FIFA Quality Pro Thermo-Bonded Match Football',
    tagline: 'Seamless Textured PU Casing with Zero Water Absorption',
    category: 'sports',
    price: 149900, // ₹1,499.00
    originalPrice: 299900,
    discountPercent: 50,
    rating: 4.7,
    reviewsCount: 780,
    stock: 80,
    has3DModel: false,
    featured: false,
    sellerId: 'seller-decathlon',
    sellerName: 'Decathlon Sports India',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&q=80'
    ],
    description: 'Engineered to official FIFA tournament specifications. Seamless thermal bonding ensures perfect spherical trajectory in wind and zero weight gain on waterlogged monsoon turfs.',
    specs: {
      'Size': 'Official Match Size 5',
      'Construction': 'Thermally Bonded 32-Panel Textured PU',
      'Bladder': 'Taiwanese Butyl Bladder with High Air Retention',
      'Surface': 'Grass, Artificial Turf & Hard Grounds'
    }
  },

  // --- 8. ELECTRONICS & AUDIO ---
  {
    id: 'prod-001',
    name: 'Aetheris Pro Spatial Wireless Headphones',
    tagline: 'Lossless Hi-Res Audio with 45dB Active Hybrid Noise Cancellation',
    category: 'electronics',
    price: 1499900, // ₹14,999.00
    originalPrice: 2499900,
    discountPercent: 40,
    rating: 4.8,
    reviewsCount: 342,
    stock: 24,
    has3DModel: true,
    modelShape: 'headphones',
    featured: true,
    sellerId: 'seller-techhub',
    sellerName: 'TechHub Retailers Pvt Ltd',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'
    ],
    description: 'Immerse yourself into pure acoustic bliss with custom titanium drivers, dual spatial audio gyroscopes, and up to 60 hours of continuous playback on a single fast charge.',
    specs: {
      'Driver Size': '40mm Custom Titanium Dynamic Drivers',
      'Battery Life': 'Up to 60 Hours (ANC Off) / 45 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.4, Ultra-Low Latency USB-C Dongle, 3.5mm Aux',
      'Microphones': '6 Quad-Beamforming Mics with AI Denoising'
    }
  },
  {
    id: 'prod-002',
    name: 'CyberPulse Chrono OLED Smartwatch',
    tagline: 'Titanium Grade 5 Case, Dual-Engine GPS & Heart Bio-Tracker',
    category: 'electronics',
    price: 899900, // ₹8,999.00
    originalPrice: 1599900,
    discountPercent: 43,
    rating: 4.7,
    reviewsCount: 512,
    stock: 45,
    has3DModel: true,
    modelShape: 'watch',
    featured: true,
    sellerId: 'seller-techhub',
    sellerName: 'TechHub Retailers Pvt Ltd',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    description: 'Built for high performance athletes and modern executives. Features a sapphire crystal curved AMOLED display with 1500 nits peak outdoor brightness.',
    specs: {
      'Display': '1.43-inch Always-On Sapphire AMOLED (466x466)',
      'Water Resistance': '5 ATM + IP68 Dive Certified (up to 50m)',
      'Sensors': 'Optical HR, SpO2, HRV Stress, Dual-Frequency GPS',
      'Battery': '14-Day Battery Life on normal usage'
    }
  },
  {
    id: 'prod-003',
    name: 'Vortex Phantom 17 AI Gaming Rig',
    tagline: 'Intel Core i9-14900HX, RTX 4090 16GB, 240Hz QHD Mini-LED',
    category: 'electronics',
    price: 24999900, // ₹2,49,999.00
    originalPrice: 29999900,
    discountPercent: 16,
    rating: 4.9,
    reviewsCount: 89,
    stock: 8,
    has3DModel: true,
    modelShape: 'laptop',
    featured: true,
    sellerId: 'seller-gamersguild',
    sellerName: 'Gamers Guild Apex Stores',
    sellerRating: 4.8,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'
    ],
    description: 'The pinnacle of desktop-grade portable gaming power with liquid metal thermal cooling, mechanical per-key RGB keyboard, and Gen 5 NVMe SSD speeds.',
    specs: {
      'Processor': '14th Gen Intel Core i9-14900HX (24 cores, 5.8 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4090 16GB GDDR6 (175W TGP)',
      'RAM & Storage': '32GB DDR5 5600MHz + 2TB PCIe 4.0 NVMe SSD',
      'Display': '17.3-inch QHD+ 240Hz Mini-LED 100% DCI-P3'
    }
  },
  {
    id: 'prod-006',
    name: 'AeroBook Titanium Ultra 14',
    tagline: 'Snapdragon X Elite / 32GB RAM / 3K OLED / 22-Hour Battery',
    category: 'electronics',
    price: 11999900, // ₹1,19,999.00
    originalPrice: 14999900,
    discountPercent: 20,
    rating: 4.9,
    reviewsCount: 310,
    stock: 18,
    has3DModel: true,
    modelShape: 'laptop',
    featured: false,
    sellerId: 'seller-techhub',
    sellerName: 'TechHub Retailers Pvt Ltd',
    sellerRating: 4.9,
    sellerStatus: 'APPROVED',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
    ],
    description: 'Next-gen Copilot+ AI PC crafted in unibody aerospace magnesium. Weighs only 1.08kg while offering unrivaled all-day battery life and silent operation.',
    specs: {
      'Processor': 'Qualcomm Snapdragon X Elite (45 TOPS NPU)',
      'RAM & Storage': '32GB LPDDR5X + 1TB Gen 4 SSD',
      'Screen': '14.2-inch 3K (3120x2080) 120Hz Touch OLED',
      'Weight': '1.08 kg'
    }
  }
];

export const DEMO_USERS = {
  buyer: {
    id: 'usr-buyer-01',
    name: 'Rahul Sharma',
    email: 'buyer@example.com',
    role: 'ROLE_BUYER',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    token: 'jwt_mock_buyer_token_8392183'
  },
  sellerApproved: {
    id: 'usr-seller-01',
    name: 'Vikram Singhania',
    email: 'seller@techhub.com',
    role: 'ROLE_SELLER',
    phone: '+91 98220 11223',
    companyName: 'TechHub Retailers Pvt Ltd',
    gstin: '29ABCDE1234F1Z5',
    sellerStatus: 'APPROVED',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    token: 'jwt_mock_seller_token_4920194'
  },
  sellerPending: {
    id: 'usr-seller-02',
    name: 'Neha Kapoor',
    email: 'pending@gadgets.com',
    role: 'ROLE_SELLER',
    phone: '+91 99112 33445',
    companyName: 'Gadget Galaxy LLP',
    gstin: '27AABCG9876K1Z2',
    sellerStatus: 'PENDING',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    token: 'jwt_mock_pending_token_1938472'
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Pravin (Platform Admin)',
    email: 'pravin007ptk@gmail.com',
    role: 'ROLE_ADMIN',
    phone: '+91 80000 99999',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    token: 'jwt_mock_admin_token_0987654'
  }
};
