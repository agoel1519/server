import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'localStore.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed catalog for treatments
const initialTreatments = [
  { 
    name: 'SCAR', 
    slug: 'scar', 
    category: 'FACE / SKIN',
    title: 'SCAR REVISION & RESTORATION',
    introText: 'Specialized laser resurfacing, subcision, and MNRF protocols designed to restore smooth skin texture.',
    contentSection: {
      heading: 'ADVANCED CLINICAL SCAR TREATMENT',
      text: 'Our clinic combines Fotona 4D laser, Exion MNRF, and targeted skin boosters for clinical scar revision.',
      image: '/treatments/scar-before-after.png'
    }
  },
  { 
    name: 'CHEMICAL PEELS', 
    slug: 'chemical-peels', 
    category: 'FACE / SKIN',
    title: 'CHEMICAL PEELS IN MUMBAI',
    introText: 'Chemical peels represent a cornerstone in clinical dermatology, offering a refined, evidence-based approach to skin resurfacing.',
    contentSection: {
      heading: 'WHAT ARE CLINICAL CHEMICAL PEELS?',
      text: 'A chemical peel is an advanced dermatological procedure utilizing physician-calibrated fruit acids, AHAs, BHAs, and trichloroacetic acids (TCA).',
      image: '/treatments/treatment-skin.jpg'
    }
  },
  { 
    name: 'ULTHERAPY PRIME', 
    slug: 'ultherapy-prime', 
    category: 'FACE / SKIN',
    title: 'ULTHERAPY PRIME - NON-INVASIVE LIFTING',
    introText: 'US-FDA cleared micro-focused ultrasound that stimulates deep collagen synthesis for lasting facial firmness.',
    contentSection: {
      heading: 'PRECISION ULTRASOUND COLLAGEN LIFT',
      text: 'Targeting the deep SMAS layer without needles or downtime, delivering defined jawline and brow contours.',
      image: '/treatments/treatment-skin.jpg'
    }
  },
  { 
    name: 'EMSCULPT NEO', 
    slug: 'emsculpt-neo', 
    category: 'BODY',
    title: 'EMSCULPT NEO BODY CONTOURING',
    introText: 'Simultaneous synchronized RF heating and high-intensity focused electromagnetic energies for fat reduction and muscle building.',
    contentSection: {
      heading: 'REVOLUTIONARY BODY SCULPTING',
      text: 'Up to 30% fat reduction and 25% muscle increase in targeted 30-minute clinical sessions.',
      image: '/treatments/treatment-body.jpg'
    }
  },
  { 
    name: 'EMERALD LASER', 
    slug: 'emerald-laser', 
    category: 'BODY',
    title: 'EMERALD LASER INCH LOSS',
    introText: 'Non-thermal low level green laser therapy for targeted fat liquefaction and circumference reduction.',
    contentSection: {
      heading: 'FDA CLEARED GREEN LASER',
      text: 'Painless, zero recovery inch loss targeting stubborn adipocytes.',
      image: '/treatments/treatment-body.jpg'
    }
  },
  { 
    name: 'FUE HAIR TRANSPLANT', 
    slug: 'fue-hair-transplant', 
    category: 'HAIR',
    title: 'HIGH-DENSITY FUE HAIR RESTORATION',
    introText: 'Bespoke graft harvesting and artistic hairline design executed by certified trichological surgeons.',
    contentSection: {
      heading: 'NATURAL FOLLICULAR UNIT EXTRACTION',
      text: 'Individual follicular graft extraction delivering natural density and permanent coverage.',
      image: '/treatments/treatment-hair.jpg'
    }
  },
  { 
    name: 'NAD+ LONGEVITY DRIP', 
    slug: 'nad-longevity-drip', 
    category: 'LONGEVITY / IV',
    title: 'CELLULAR VITALITY & NAD+ INFUSION',
    introText: 'Intravenous coenzyme therapy replenishing mitochondrial energy, cognitive clarity, and cellular DNA repair.',
    contentSection: {
      heading: 'CELLULAR LONGEVITY SCIENCE',
      text: 'Administered in our private executive wellness lounge with certified medical oversight.',
      image: '/treatments/treatment-iv.jpg'
    }
  }
];

// Initial default popup settings
const initialPopupSettings = {
  enabled: true,
  layout: 'banner',
  badge: 'SPECIAL ANNOUNCEMENT',
  title: 'Radiance Reimagined at Aevora',
  subtitle: 'Experience world-class laser therapies, bespoke medical facials, and dermal restoration customized by certified aesthetic physicians.',
  showCta: true,
  ctaText: 'Book Free Consultation',
  ctaLink: '#book',
  secondaryCtaText: 'WhatsApp Us',
  secondaryCtaLink: 'https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Aevora%20treatments',
  displayDelay: 2,
  displayFrequency: 'session',
  targetPage: 'all',
  autoPlay: true,
  autoPlayInterval: 4,
  showDots: true,
  showArrows: true,
  showCloseButton: true,
  closeOnBackdrop: true,
  maxWidth: '720px',
  images: [
    {
      id: 'popup-img-1',
      url: '/banners/popup-offer-banner.jpg',
      alt: 'Radiance Reimagined - Aesthetic Excellence',
      title: 'Precision Aesthetics & Timeless Radiance',
      subtitle: 'Complimentary 3D Skin Analysis with every consultation this month',
      link: '#book',
      buttonText: 'Book Consultation'
    },
    {
      id: 'popup-img-2',
      url: '/banners/popup-offer-banner-2.jpg',
      alt: 'Luxury Skincare & Advanced Laser Therapies',
      title: 'Advanced Laser Rejuvenation & Serum Infusions',
      subtitle: 'US-FDA approved technology with certified dermatologists',
      link: '/#treatments',
      buttonText: 'Explore Treatments'
    },
    {
      id: 'popup-img-3',
      url: '/banners/banner-wellness.jpg',
      alt: 'Cellular Longevity & Vitality Protocols',
      title: 'Cellular Longevity & NAD+ Infusion Lounge',
      subtitle: 'Unlock cellular wellness with tailored anti-aging protocols',
      link: '/#treatments',
      buttonText: 'View Programs'
    }
  ]
};

// Initial default data structure
const defaultData = {
  settings: {
    site_popup_settings: initialPopupSettings,
    header_settings: {
      locationText: "Premium Aesthetics & Wellness Clinic",
      timingsText: "Mon - Sat: 10:00 AM - 8:00 PM",
      phoneText: "+91 98765 43210",
      badgeText: "Certified Specialists",
      ctaText: "Book Appointment",
      ctaUrl: "#book",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      logoUrl: "/aevora-logo-clean.png",
      logoWidth: "180"
    }
  },
  treatments: initialTreatments,
  appointments: [],
  pages: [],
  media: []
};

// Load store from disk or create defaults
let memoryStore = null;

const loadStore = () => {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
    } else {
      memoryStore = { ...defaultData };
      fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2));
    }
  } catch (err) {
    console.warn('Error reading localStore.json, using in-memory default:', err.message);
    memoryStore = { ...defaultData };
  }
  return memoryStore;
};

const saveStore = () => {
  try {
    if (!memoryStore) return;
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2));
  } catch (err) {
    console.error('Failed to write localStore.json:', err.message);
  }
};

export const localStore = {
  // Settings API
  getSetting: (key) => {
    const store = loadStore();
    return store.settings?.[key] || null;
  },

  saveSetting: (key, value) => {
    const store = loadStore();
    if (!store.settings) store.settings = {};
    store.settings[key] = value;
    saveStore();
    return { key, value, updatedAt: new Date().toISOString() };
  },

  // Treatments API
  getTreatments: () => {
    const store = loadStore();
    return store.treatments || [];
  },

  getTreatmentBySlug: (slug) => {
    const store = loadStore();
    const clean = (slug || '').toLowerCase().trim();
    return (store.treatments || []).find(t => (t.slug || '').toLowerCase() === clean) || null;
  },

  saveTreatment: (treatmentData) => {
    const store = loadStore();
    if (!store.treatments) store.treatments = [];
    const idx = store.treatments.findIndex(t => t.slug === treatmentData.slug);
    const updated = {
      ...treatmentData,
      _id: treatmentData._id || `local-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      store.treatments[idx] = { ...store.treatments[idx], ...updated };
    } else {
      store.treatments.unshift(updated);
    }
    saveStore();
    return updated;
  },

  deleteTreatment: (slug) => {
    const store = loadStore();
    if (!store.treatments) return false;
    store.treatments = store.treatments.filter(t => t.slug !== slug);
    saveStore();
    return true;
  },

  // Appointments API
  getAppointments: () => {
    const store = loadStore();
    return store.appointments || [];
  },

  addAppointment: (appointmentData) => {
    const store = loadStore();
    if (!store.appointments) store.appointments = [];
    const newAppt = {
      ...appointmentData,
      _id: `appt-${Date.now()}`,
      status: appointmentData.status || 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.appointments.unshift(newAppt);
    saveStore();
    return newAppt;
  },

  updateAppointmentStatus: (id, status) => {
    const store = loadStore();
    if (!store.appointments) return null;
    const item = store.appointments.find(a => a._id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      saveStore();
      return item;
    }
    return null;
  },

  // Pages API
  getPages: () => {
    const store = loadStore();
    return store.pages || [];
  },

  getPageBySlug: (slug) => {
    const store = loadStore();
    return (store.pages || []).find(p => p.slug === slug) || null;
  },

  savePage: (pageData) => {
    const store = loadStore();
    if (!store.pages) store.pages = [];
    const idx = store.pages.findIndex(p => p.slug === pageData.slug);
    const updated = {
      ...pageData,
      _id: pageData._id || `page-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      store.pages[idx] = { ...store.pages[idx], ...updated };
    } else {
      store.pages.push(updated);
    }
    saveStore();
    return updated;
  },

  deletePage: (slug) => {
    const store = loadStore();
    if (!store.pages) return false;
    store.pages = store.pages.filter(p => p.slug !== slug);
    saveStore();
    return true;
  },

  // Media API
  getMedia: () => {
    const store = loadStore();
    return store.media || [];
  },

  addMedia: (mediaItem) => {
    const store = loadStore();
    if (!store.media) store.media = [];
    const item = {
      ...mediaItem,
      _id: `media-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    store.media.unshift(item);
    saveStore();
    return item;
  },

  deleteMedia: (id) => {
    const store = loadStore();
    if (!store.media) return false;
    store.media = store.media.filter(m => m._id !== id);
    saveStore();
    return true;
  }
};
