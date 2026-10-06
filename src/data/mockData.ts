import { Category, Product, Coupon, Order } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-mens-fashion',
    name: "Men's Fashion & Panjabi",
    nameBn: 'পুরুষদের ফ্যাশন ও প্রিমিয়াম পাঞ্জাবি',
    slug: 'mens-fashion',
    icon: 'Shirt',
    itemCount: 48,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat-womens-wear',
    name: "Women's Ethnic & Sarees",
    nameBn: 'মেয়েদের ঐতিহ্যবাহী পোশাক ও শাড়ি',
    slug: 'womens-wear',
    icon: 'Sparkles',
    itemCount: 64,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat-gadgets',
    name: 'Tech & Smart Gadgets',
    nameBn: 'স্মার্ট ইলেকট্রনিক্স ও গ্যাজেটস',
    slug: 'tech-gadgets',
    icon: 'Watch',
    itemCount: 32,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat-leather-footwear',
    name: 'Genuine Leather & Footwear',
    nameBn: 'আসল লেদার পণ্য ও জুতো',
    slug: 'leather-footwear',
    icon: 'Footprints',
    itemCount: 29,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat-organic-groceries',
    name: 'Organic Honey & Ghee',
    nameBn: 'খাঁটি সুন্দরবন মধু ও গাওয়া ঘি',
    slug: 'organic-groceries',
    icon: 'Coffee',
    itemCount: 19,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cat-accessories',
    name: 'Bags & Travel Gear',
    nameBn: 'ট্রাভেল ব্যাকপ্যাক ও ওয়ালেট',
    slug: 'bags-accessories',
    icon: 'Briefcase',
    itemCount: 22,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-001',
    title: 'Heritage Embroidered Silk Panjabi - Royal Navy',
    titleBn: 'হেরিটেজ এমব্রয়ডারি সিল্ক পাঞ্জাবি - রয়্যাল নেভি',
    slug: 'heritage-embroidered-silk-panjabi-royal-navy',
    sku: 'PAN-HER-01',
    category: "Men's Fashion & Panjabi",
    categoryBn: 'পুরুষদের ফ্যাশন ও প্রিমিয়াম পাঞ্জাবি',
    price: 3850,
    discountPrice: 2950,
    isFlashDeal: true,
    flashDealEnd: '2026-10-06T23:59:59',
    stock: 14,
    rating: 4.9,
    reviewCount: 42,
    description: 'Crafted from pure handloom silk with intricate collar and placket geometric embroidery. Lightweight, breathable, and designed for festive Eid, weddings, and cultural celebrations in Bangladesh.',
    descriptionBn: 'প্রিমিয়াম হ্যান্ডলুম সিল্কের তৈরি দৃষ্টিনন্দন জ্যামিতিক কারুকাজ করা কলার ও প্ল্যাকেট। উৎসব, বিয়ে বা ঈদের জন্য বিশেষ মানানসই ও অত্যন্ত আরামদায়ক।',
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-001-38', sku: 'PAN-HER-01-38', size: '38 (M)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 0, stock: 4 },
      { id: 'v-001-40', sku: 'PAN-HER-01-40', size: '40 (L)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 0, stock: 6 },
      { id: 'v-001-42', sku: 'PAN-HER-01-42', size: '42 (XL)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 100, stock: 3 },
      { id: 'v-001-44', sku: 'PAN-HER-01-44', size: '44 (XXL)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 100, stock: 1 }
    ],
    tags: ['eid-special', 'panjabi', 'silk', 'traditional'],
    features: ['100% Handloom Blended Silk', 'Intricate Resham Thread Embroidery', 'Snap-button placket with engraved metallic rivets', 'Includes matching tailored pyjama recommendation'],
    featuresBn: ['১০০% হ্যান্ডলুম সিল্ক ফেব্রিক', 'রেশম সুতোর সূক্ষ্ম নিখুঁত এমব্রয়ডারি', 'মেটালিক স্ন্যাপ বাটন ফিনিশিং', 'পায়জামা সহ ম্যাচিং সেট উপলব্ধ'],
    specifications: {
      Fabric: 'Blended Silk Handloom',
      Fit: 'Slim / Regular Tailored',
      Care: 'Dry Clean Recommended / Gentle Hand Wash',
      Origin: 'Pabna Heritage Handloom, Bangladesh'
    },
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'prod-002',
    title: 'AcousticPulse Pro Active Noise Cancelling Earbuds',
    titleBn: 'অ্যাকোস্টিকপালস প্রো এএনসি ওয়্যারলেস এয়ারবাডস',
    slug: 'acousticpulse-pro-anc-earbuds',
    sku: 'TECH-ANC-02',
    category: 'Tech & Smart Gadgets',
    categoryBn: 'স্মার্ট ইলেকট্রনিক্স ও গ্যাজেটস',
    price: 4500,
    discountPrice: 3499,
    isFlashDeal: true,
    flashDealEnd: '2026-10-06T23:59:59',
    stock: 28,
    rating: 4.8,
    reviewCount: 89,
    description: '35dB Hybrid Active Noise Cancellation, Bluetooth 5.4 with low-latency gaming mode, 38-hour playback with rapid USB-C case charging, and IPX5 sweat resistance.',
    descriptionBn: '৩৫ ডেসিবেল হাইব্রিড অ্যাক্টিভ নয়েজ ক্যান্সেলেশন, ব্লুটুথ ৫.৪, লো-ল্যাটেন্সি গেমিং মোড এবং ৩৮ ঘণ্টার বিশাল ব্যাটারি ব্যাকআপ।',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-002-blk', sku: 'TECH-ANC-02-BLK', color: 'Midnight Black', colorHex: '#0f172a', additionalPrice: 0, stock: 18 },
      { id: 'v-002-wht', sku: 'TECH-ANC-02-WHT', color: 'Pearl White', colorHex: '#f8fafc', additionalPrice: 0, stock: 10 }
    ],
    tags: ['anc', 'wireless', 'earbuds', 'gadgets'],
    features: ['Hybrid ANC up to 35dB depth', 'Quad Mic ENC for crystal-clear calls', 'Transparency Audio pass-through', 'Fast charge: 10 mins = 2 hours playtime'],
    featuresBn: ['৩৫ ডেসিবেল পর্যন্ত হাইব্রিড এএনসি', 'কলের জন্য কোয়াড মাইক ইএনসি প্রযুক্তি', 'ট্রান্সপারেন্সি অডিও মোড', '১০ মিনিট চার্জে ২ ঘণ্টা প্লেটাইম'],
    specifications: {
      Bluetooth: 'Version 5.4 + EDR',
      Battery: '400mAh Case, 45mAh per bud',
      Waterproof: 'IPX5 Sweat & Splash Resistant',
      Warranty: '12 Months Official Replacement'
    },
    createdAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'prod-003',
    title: 'Handcrafted Jamdani Saree - Crimson Gold Weave',
    titleBn: 'ঐতিহ্যবাহী জামদানি শাড়ি - লাল ও সোনালী জরি নকশা',
    slug: 'handcrafted-jamdani-saree-crimson-gold',
    sku: 'SAR-JAM-03',
    category: "Women's Ethnic & Sarees",
    categoryBn: 'মেয়েদের ঐতিহ্যবাহী পোশাক ও শাড়ি',
    price: 8500,
    discountPrice: 6990,
    isFlashDeal: false,
    stock: 5,
    rating: 5.0,
    reviewCount: 31,
    description: 'Authentic 84-count pure cotton Jamdani handwoven by master artisans of Rupganj, Narayanganj. Features traditional floral motifs in rich gold zari threads across a deep crimson red body.',
    descriptionBn: 'নারায়ণগঞ্জের রূপগঞ্জের দক্ষ তাঁতিদের হাতে বোনা খাঁটি ৮৪ কাউন্ট সুতি জামদানি। লাল জমিনে নিখুঁত সোনালী জরি সুতোর নান্দনিক ফুলের কাজ।',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-003-std', sku: 'SAR-JAM-03-STD', color: 'Crimson Red & Gold', colorHex: '#991b1b', additionalPrice: 0, stock: 5 }
    ],
    tags: ['jamdani', 'saree', 'handloom', 'rupganj'],
    features: ['100% Traditional Handloom Jamdani', '84-count fine Egyptian cotton warp & weft', 'Includes unstitched blouse piece (80cm)', 'GI certified artisan seal'],
    featuresBn: ['১০০% খাঁটি ঐতিহ্যবাহী হ্যান্ডলুম জামদানি', '৮৪ কাউন্ট ফাইন সুতি জরি মিশ্রিত', 'ম্যাচিং ব্লাউজ পিস সহ', 'জিআই প্রত্যয়িত কারিগর কর্তৃক প্রস্তুত'],
    specifications: {
      Material: '84-Count Fine Cotton & Zari',
      Length: '5.5 Meters Saree + 0.8 Meter Blouse',
      Weave: 'Narayanganj Rupganj Traditional'
    },
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'prod-004',
    title: 'Full-Grain Artisan Leather Oxford Formal Shoes',
    titleBn: 'আসল ফুল-গ্রেইন লেদার অক্সফোর্ড ফরমাল শু',
    slug: 'artisan-leather-oxford-shoes',
    sku: 'LEA-OXF-04',
    category: 'Genuine Leather & Footwear',
    categoryBn: 'আসল লেদার পণ্য ও জুতো',
    price: 5200,
    discountPrice: 4250,
    isFlashDeal: true,
    flashDealEnd: '2026-10-06T23:59:59',
    stock: 9,
    rating: 4.7,
    reviewCount: 23,
    description: 'Crafted from vegetable-tanned Bangladeshi full-grain cowhide leather with Goodyear welted rubber anti-skid outsole. Memory foam inner lining ensures unmatched all-day boardroom comfort.',
    descriptionBn: 'ভেজিটেবল-ট্যানড আসল গরুর চামড়া দিয়ে তৈরি প্রিমিয়াম অক্সফোর্ড সু। আরামদায়ক মেমোরি ফোম ইনসোল ও অ্যান্টি-স্লিপ রাবার সোল।',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-004-39', sku: 'LEA-OXF-04-39', size: 'EU 39', color: 'Burnished Tan', colorHex: '#78350f', additionalPrice: 0, stock: 2 },
      { id: 'v-004-40', sku: 'LEA-OXF-04-40', size: 'EU 40', color: 'Burnished Tan', colorHex: '#78350f', additionalPrice: 0, stock: 3 },
      { id: 'v-004-41', sku: 'LEA-OXF-04-41', size: 'EU 41', color: 'Burnished Tan', colorHex: '#78350f', additionalPrice: 0, stock: 3 },
      { id: 'v-004-42', sku: 'LEA-OXF-04-42', size: 'EU 42', color: 'Burnished Tan', colorHex: '#78350f', additionalPrice: 0, stock: 1 }
    ],
    tags: ['leather', 'shoes', 'oxford', 'formal'],
    features: ['100% Genuine Full Grain Cow Leather', 'Orthopedic Dual-Density Insole', 'Hand-burnished gradient finish', 'Reinforced heel cap for durability'],
    featuresBn: ['১০০% অরিজিনাল ফুল গ্রেইন গরুর চামড়া', 'অর্থোপেডিক ডুয়েল ডেনসিটি ইনসোল', 'হাতে পলিশ করা তান কালার ফিনিশ', 'টেকসই গ্রিপ রাবার আউটসোল'],
    specifications: {
      Upper: 'Full Grain Cowhide Leather',
      Sole: 'Slip-Resistant Vulcanized Rubber',
      Closure: 'Waxed Cotton Lace-up'
    },
    createdAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'prod-005',
    title: 'Pure Sundarbans Wild Honey & Organic Village Ghee Combo',
    titleBn: 'সুন্দরবনের প্রাকৃতিক মধু ও গাওয়া ঘি কম্বো প্যাক',
    slug: 'sundarbans-honey-village-ghee-combo',
    sku: 'ORG-HON-05',
    category: 'Organic Honey & Ghee',
    categoryBn: 'খাঁটি সুন্দরবন মধু ও গাওয়া ঘি',
    price: 1800,
    discountPrice: 1550,
    isFlashDeal: false,
    stock: 45,
    rating: 4.9,
    reviewCount: 67,
    description: 'Raw, unpasteurized honey collected deep inside the Sundarbans mangrove forest by traditional Mawalis, paired with aromatic, slow-simmered pure cow milk Ghee from Pabna villages.',
    descriptionBn: 'সুন্দরবনের গহীন বন থেকে সংগৃহীত কাঁচা প্রাকৃতিক খলিসা ফুলের মধু এবং পাবনার ঐতিহ্যবাহী গাওয়া ঘি এর স্বাস্থ্যকর কম্বো প্যাক।',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-005-1kg', sku: 'ORG-HON-05-1KG', weight: '500g Honey + 400g Ghee', additionalPrice: 0, stock: 30 },
      { id: 'v-005-2kg', sku: 'ORG-HON-05-2KG', weight: '1kg Honey + 800g Ghee', additionalPrice: 1200, stock: 15 }
    ],
    tags: ['honey', 'ghee', 'organic', 'sundarbans'],
    features: ['100% Chemical & Preservative Free', 'Lab tested BSTI verified purity', 'Collected from Sundarbans Khalisha flower blossoms', 'Rich aroma and golden texture'],
    featuresBn: ['রাসায়নিক ও প্রিজারভেটিভ সম্পূর্ণ মুক্ত', 'বিএসটিআই মান যাচাইকৃত খাঁটি গুণগত মান', 'সুন্দরবনের খলিসা ফুলের মধু', 'চমৎকার সুঘ্রাণ ও সোনালী দানাদার ঘি'],
    specifications: {
      Purity: '100% Raw Unpasteurized',
      Packaging: 'Food-grade Sealed Glass Jars',
      Storage: 'Store at cool dry room temperature'
    },
    createdAt: '2026-09-24T10:00:00Z'
  },
  {
    id: 'prod-006',
    title: 'Smart AMOLED GPS Fitness Tracker & Heart Rate Watch',
    titleBn: 'অ্যামোলেড ডিসপ্লে জিপিএস স্মার্ট ফিটনেস ওয়াচ',
    slug: 'smart-amoled-gps-fitness-watch',
    sku: 'TECH-WAT-06',
    category: 'Tech & Smart Gadgets',
    categoryBn: 'স্মার্ট ইলেকট্রনিক্স ও গ্যাজেটস',
    price: 3600,
    discountPrice: 2850,
    isFlashDeal: true,
    flashDealEnd: '2026-10-06T23:59:59',
    stock: 19,
    rating: 4.6,
    reviewCount: 54,
    description: '1.43-inch Always-on AMOLED display with 466x466 resolution, built-in GPS for accurate distance tracking, Bluetooth calling with speaker/mic, 120+ sports modes, and 10-day battery life.',
    descriptionBn: '১.৪৩ ইঞ্চি অ্যামোলেড অলওয়েজ-অন ডিসপ্লে, ব্লুটুথ কলিং, হার্ট রেট ও ব্লাড অক্সিজেন সেন্সর সহ ১০ দিনের শক্তিশালী ব্যাটারি ব্যাকআপ।',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-006-blk', sku: 'TECH-WAT-06-BLK', color: 'Obsidian Black', colorHex: '#09090b', additionalPrice: 0, stock: 12 },
      { id: 'v-006-slv', sku: 'TECH-WAT-06-SLV', color: 'Titanium Silver', colorHex: '#94a3b8', additionalPrice: 150, stock: 7 }
    ],
    tags: ['smartwatch', 'amoled', 'fitness', 'gadgets'],
    features: ['1.43" 60Hz AMOLED Retina Display', 'SpO2, 24/7 Heart Rate & Sleep Monitoring', 'IP68 50m Water Resistance', 'Instant Bengali notifications & Bengali UI support'],
    featuresBn: ['১.৪৩ ইঞ্চি ৬০হার্জ অ্যামোলেড রেটিনা স্ক্রিন', 'রক্তের অক্সিজেন ও স্লিপ ট্র্যাকিং', 'আইপি৬৮ ওয়াটারপ্রুফ রেটিং', 'বাংলা ফন্ট ও মেসেজ সাপোর্ট'],
    specifications: {
      Screen: '1.43" AMOLED 466x466 1000 nits',
      Battery: '380mAh Lithium-Polymer (7-10 Days)',
      Sensors: 'Biometric PPG, 3-Axis Gyro, Barometer'
    },
    createdAt: '2026-09-25T10:00:00Z'
  },
  {
    id: 'prod-007',
    title: 'Waterproof Commuter Urban Laptop Backpack (28L)',
    titleBn: 'ওয়াটারপ্রুফ আরবান ল্যাপটপ ট্রাভেল ব্যাকপ্যাক (২৮ লিটার)',
    slug: 'waterproof-commuter-laptop-backpack',
    sku: 'BAG-URB-07',
    category: 'Bags & Travel Gear',
    categoryBn: 'ট্রাভেল ব্যাকপ্যাক ও ওয়ালেট',
    price: 2450,
    discountPrice: 1890,
    isFlashDeal: false,
    stock: 22,
    rating: 4.8,
    reviewCount: 38,
    description: 'Constructed from ballistic Oxford nylon with TPU waterproof coating. Accommodates up to 16-inch laptops with shockproof air-cushioned compartment, hidden anti-theft pocket, and external USB charging port.',
    descriptionBn: 'বৃষ্টির পানি প্রতিরোধক প্রিমিয়াম অক্সফোর্ড নাইলন ফ্যাব্রিক, ১৬ ইঞ্চি ল্যাপটপ রাখার সুরক্ষিত চেম্বার এবং অ্যান্টি-থেফট জিপার ডিজাইন।',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-007-blk', sku: 'BAG-URB-07-BLK', color: 'Stealth Black', colorHex: '#18181b', additionalPrice: 0, stock: 14 },
      { id: 'v-007-gry', sku: 'BAG-URB-07-GRY', color: 'Heather Grey', colorHex: '#64748b', additionalPrice: 0, stock: 8 }
    ],
    tags: ['backpack', 'laptop', 'waterproof', 'travel'],
    features: ['16" Padded Shock-absorbent Laptop sleeve', 'Ergonomic breathable S-curve shoulder straps', 'Luggage strap for suitcase attachment', 'YKK water-resistant zippers'],
    featuresBn: ['১৬ ইঞ্চি ল্যাপটপ চেম্বার', 'শ্বাসপ্রশ্বাস যোগ্য আরামদায়ক শোল্ডার প্যাডিং', 'ট্রাভেল স্যুটকেস স্ট্র্যাপ সংযুক্ত', 'টেকসই ওয়াটারপ্রুফ জিপার'],
    specifications: {
      Capacity: '28 Liters',
      Dimensions: '48 x 32 x 18 cm',
      Material: '1680D Water-Repellent Ballistic Nylon'
    },
    createdAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'prod-008',
    title: 'Premium Linen Mandarin Collar Casual Shirt',
    titleBn: 'প্রিমিয়াম খাঁটি লিনেন চাইনিজ কলার ক্যাজুয়াল শার্ট',
    slug: 'premium-linen-mandarin-collar-shirt',
    sku: 'SHT-LIN-08',
    category: "Men's Fashion & Panjabi",
    categoryBn: 'পুরুষদের ফ্যাশন ও প্রিমিয়াম পাঞ্জাবি',
    price: 1950,
    discountPrice: 1590,
    isFlashDeal: true,
    flashDealEnd: '2026-10-06T23:59:59',
    stock: 16,
    rating: 4.7,
    reviewCount: 45,
    description: 'Pre-washed 100% natural European flax linen shirt with tailored Mandarin collar. Ultimate summer breathability with wooden button accents and chest welt pocket.',
    descriptionBn: '১০০% খাঁটি প্রি-ওয়াশড ইউরোপীয় ফ্ল্যাক্স লিনেন শার্ট। গরমের দিনে পরার জন্য অত্যন্ত আরামদায়ক ও ট্রেন্ডি লুক।',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-008-s', sku: 'SHT-LIN-08-S', size: 'S', color: 'Olive Sage', colorHex: '#4d7c0f', additionalPrice: 0, stock: 3 },
      { id: 'v-008-m', sku: 'SHT-LIN-08-M', size: 'M', color: 'Olive Sage', colorHex: '#4d7c0f', additionalPrice: 0, stock: 6 },
      { id: 'v-008-l', sku: 'SHT-LIN-08-L', size: 'L', color: 'Olive Sage', colorHex: '#4d7c0f', additionalPrice: 0, stock: 5 },
      { id: 'v-008-xl', sku: 'SHT-LIN-08-XL', size: 'XL', color: 'Olive Sage', colorHex: '#4d7c0f', additionalPrice: 50, stock: 2 }
    ],
    tags: ['linen', 'shirt', 'summer', 'casual'],
    features: ['100% Pure Flax Linen', 'Mandarin Band Collar', 'Natural coconut shell buttons', 'Pre-shrunk for consistent fit'],
    featuresBn: ['১০০% খাঁটি ন্যাচারাল লিনেন', 'চাইনিজ ব্যান্ড কলার ডিজাইন', 'নারকেলের খোসার তৈরি পরিবেশবান্ধব বোতাম', 'প্রি-শ্রিঙ্ক টেকনোলজি'],
    specifications: {
      Fabric: '100% European Flax Linen',
      Fit: 'Modern Regular Fit',
      Wash: 'Machine wash cold with gentle detergent'
    },
    createdAt: '2026-09-30T10:00:00Z'
  }
];

export const sampleReviews = [
  {
    id: 'rev-01',
    productId: 'prod-001',
    userName: 'Tanvir Ahmed',
    rating: 5,
    comment: 'Exceptional silk fabric! The embroidery on the collar looks even better than the photos. Received via Steadfast courier within 24 hours in Dhanmondi.',
    commentBn: 'অসাধারণ সিল্ক কাপড়! কলারের এমব্রয়ডারি ছবির চেয়েও বাস্তবে সুন্দর। ধানমন্ডিতে ২৪ ঘণ্টার ভেতর স্টিডফাস্ট কুরিয়ারে পেয়েছি।',
    date: '2026-10-02',
    verifiedPurchase: true,
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    reviewImage: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rev-02',
    productId: 'prod-001',
    userName: 'Kazi Farhan',
    rating: 5,
    comment: 'Fitting is true to size (Size 40). bKash payment was smooth and instant invoice was sent to my SMS.',
    commentBn: 'সাইজ ৪০ একদম সঠিক ফিটিং হয়েছে। বিকাশ পেমেন্ট খুব দ্রুত হয়েছে এবং সাথে সাথে এসএমএস ও ইনভয়েস পেয়েছি।',
    date: '2026-10-03',
    verifiedPurchase: true,
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-03',
    productId: 'prod-002',
    userName: 'Nusrat Jahan',
    rating: 5,
    comment: 'Active noise cancellation works very well during Dhaka traffic and metro commute. Battery easily lasts 4 days with my usage.',
    commentBn: 'ঢাকার জ্যাম আর মেট্রো ভ্রমণের সময় নয়েজ ক্যান্সেলেশন চমৎকার কাজ করে। ব্যাটারি ব্যাকআপ দারুণ!',
    date: '2026-10-01',
    verifiedPurchase: true,
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  }
];

export const activeCoupons: Coupon[] = [
  {
    code: 'EID2026',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 2000,
    expiresAt: '2026-12-31',
    description: '15% Discount on orders above ৳2,000',
    descriptionBn: '২,০০০ টাকার অধিক অর্ডারে ১৫% মূল্যছাড়'
  },
  {
    code: 'DHAKA50',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderValue: 1000,
    expiresAt: '2026-12-31',
    description: 'Flat ৳50 off on Dhaka orders',
    descriptionBn: 'ঢাকার অর্ডারে ৫০ টাকা ফ্ল্যাট ছাড়'
  },
  {
    code: 'FIRSTBUY',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 1200,
    expiresAt: '2026-12-31',
    description: '10% welcome discount for first-time shoppers',
    descriptionBn: 'প্রথম অর্ডারে ১০% বিশেষ ছাড়'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-8801',
    orderNumber: 'BP-2026-8801',
    customerName: 'Siam Chowdhury',
    customerPhone: '01711223344',
    customerEmail: 'siam.c@example.com',
    shippingAddress: {
      fullName: 'Siam Chowdhury',
      phone: '01711223344',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'INSIDE_DHAKA',
      fullAddress: 'House 42, Road 11, Banani, Dhaka-1213'
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productTitle: 'Heritage Embroidered Silk Panjabi - Royal Navy',
        productSku: 'PAN-HER-01-40',
        variantLabel: 'Size: 40 (L) · Royal Navy',
        price: 2950,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 2950,
    deliveryFee: 60,
    discount: 442,
    couponCode: 'EID2026',
    total: 2568,
    status: 'SHIPPED',
    paymentMethod: 'BKASH',
    paymentStatus: 'COMPLETED',
    transactionId: 'BKASH-9K2L4P8M',
    courierShipment: {
      consignmentId: 'STF-889104',
      trackingCode: 'STEADFAST-DHK-9941',
      courier: 'STEADFAST',
      status: 'IN_TRANSIT',
      deliveryFee: 60,
      codAmount: 0,
      bookedAt: '2026-10-04T14:30:00Z',
      lastUpdated: '2026-10-05T09:15:00Z'
    },
    notes: 'Please call before delivery to confirm home gate opening.',
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-05T09:15:00Z'
  },
  {
    id: 'ord-8802',
    orderNumber: 'BP-2026-8802',
    customerName: 'Sadia Rahman',
    customerPhone: '01819556677',
    customerEmail: 'sadia.r@example.com',
    shippingAddress: {
      fullName: 'Sadia Rahman',
      phone: '01819556677',
      division: 'Chattogram',
      district: 'Chattogram',
      area: 'OUTSIDE_DHAKA',
      fullAddress: 'Holding 18, GEC Circle, Nasirabad, Chattogram'
    },
    items: [
      {
        id: 'item-2',
        productId: 'prod-003',
        productTitle: 'Handcrafted Jamdani Saree - Crimson Gold Weave',
        productSku: 'SAR-JAM-03-STD',
        variantLabel: 'Crimson Red & Gold',
        price: 6990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 6990,
    deliveryFee: 120,
    discount: 0,
    total: 7110,
    status: 'PROCESSING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    courierShipment: {
      consignmentId: 'PTH-44129',
      trackingCode: 'PATHAO-CTG-5521',
      courier: 'PATHAO',
      status: 'BOOKED',
      deliveryFee: 120,
      codAmount: 7110,
      bookedAt: '2026-10-05T08:00:00Z',
      lastUpdated: '2026-10-05T08:00:00Z'
    },
    createdAt: '2026-10-05T07:45:00Z',
    updatedAt: '2026-10-05T08:00:00Z'
  },
  {
    id: 'ord-8803',
    orderNumber: 'BP-2026-8803',
    customerName: 'Mahmudul Hasan',
    customerPhone: '01912334455',
    shippingAddress: {
      fullName: 'Mahmudul Hasan',
      phone: '01912334455',
      division: 'Sylhet',
      district: 'Sylhet',
      area: 'OUTSIDE_DHAKA',
      fullAddress: 'Zindabazar Point, Sylhet Sadar'
    },
    items: [
      {
        id: 'item-3',
        productId: 'prod-002',
        productTitle: 'AcousticPulse Pro Active Noise Cancelling Earbuds',
        productSku: 'TECH-ANC-02-BLK',
        variantLabel: 'Color: Midnight Black',
        price: 3499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 3499,
    deliveryFee: 120,
    discount: 0,
    total: 3619,
    status: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    createdAt: '2026-10-05T11:20:00Z',
    updatedAt: '2026-10-05T11:20:00Z'
  }
];
