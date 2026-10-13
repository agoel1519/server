import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'local_storage.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  settings: {},
  pages: [],
  treatments: {},
  media: [],
  appointments: []
};

const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading local_storage.json:", e);
  }
  return { ...defaultData };
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error writing local_storage.json:", e);
    return false;
  }
};

// Initialize file if not present
if (!fs.existsSync(DATA_FILE)) {
  writeData(defaultData);
}

export const localStore = {
  // Settings
  getSetting: (key) => {
    const data = readData();
    return data.settings ? data.settings[key] : null;
  },
  saveSetting: (key, value) => {
    const data = readData();
    if (!data.settings) data.settings = {};
    data.settings[key] = value;
    writeData(data);
    return { key, value, updatedAt: new Date().toISOString() };
  },

  // Pages
  getPages: () => {
    const data = readData();
    return data.pages || [];
  },
  getPage: (slug) => {
    const data = readData();
    return (data.pages || []).find(p => p.slug === slug) || null;
  },
  savePage: (pageData) => {
    const data = readData();
    if (!data.pages) data.pages = [];
    const idx = data.pages.findIndex(p => p.slug === pageData.slug);
    const enriched = {
      ...pageData,
      updatedAt: new Date().toISOString(),
      _id: pageData._id || 'local_' + Date.now()
    };
    if (idx >= 0) {
      data.pages[idx] = enriched;
    } else {
      data.pages.push(enriched);
    }
    writeData(data);
    return enriched;
  },
  deletePage: (slug) => {
    const data = readData();
    if (!data.pages) return true;
    data.pages = data.pages.filter(p => p.slug !== slug);
    writeData(data);
    return true;
  },

  // Treatments
  getTreatments: () => {
    const data = readData();
    return data.treatments || {};
  },
  getTreatment: (slug) => {
    const data = readData();
    return data.treatments ? data.treatments[slug] : null;
  },
  saveTreatment: (slug, treatmentData) => {
    const data = readData();
    if (!data.treatments) data.treatments = {};
    data.treatments[slug] = treatmentData;
    writeData(data);
    return treatmentData;
  },
  deleteTreatment: (slug) => {
    const data = readData();
    if (data.treatments && data.treatments[slug]) {
      delete data.treatments[slug];
      writeData(data);
    }
    return true;
  },

  // Appointments
  getAppointments: () => {
    const data = readData();
    return data.appointments || [];
  },
  saveAppointment: (apptData) => {
    const data = readData();
    if (!data.appointments) data.appointments = [];
    const enriched = {
      ...apptData,
      _id: 'appt_' + Date.now(),
      status: apptData.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    data.appointments.unshift(enriched);
    writeData(data);
    return enriched;
  },
  updateAppointmentStatus: (id, status) => {
    const data = readData();
    if (!data.appointments) return null;
    const item = data.appointments.find(a => a._id === id || a.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      writeData(data);
      return item;
    }
    return null;
  },

  // Media
  getMedia: () => {
    const data = readData();
    return data.media || [];
  },
  saveMedia: (mediaItem) => {
    const data = readData();
    if (!data.media) data.media = [];
    data.media.unshift(mediaItem);
    writeData(data);
    return mediaItem;
  },
  deleteMedia: (id) => {
    const data = readData();
    if (!data.media) return true;
    data.media = data.media.filter(m => (m._id !== id && m.id !== id));
    writeData(data);
    return true;
  }
};
