import mongoose from 'mongoose';

// Track connection diagnostics
let lastMongoError = null;
let reconnectTimer = null;
let isConnecting = false;

export const getLastMongoError = () => lastMongoError;
export const isMongoConnected = () => mongoose.connection.readyState === 1;

// Default fallback Atlas URI if environment variable is not explicitly injected in host dashboard
export const DEFAULT_MONGO_URI = 'mongodb+srv://agoel1519_db_user:pBATyRQbdTn2I08m@cluster0.lujcuqf.mongodb.net/aevora?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  if (isMongoConnected() || isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  const connectionOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 12000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  };

  // Only apply IPv4 constraint on Windows to prevent Windows-specific OpenSSL handshake delays
  // NEVER force family: 4 on Linux/Render where SRV DNS resolvers operate differently
  if (process.platform === 'win32') {
    connectionOptions.family = 4;
  }

  try {
    const conn = await mongoose.connect(uri, connectionOptions);
    lastMongoError = null;
    isConnecting = false;
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host}`);
    
    // Clear any pending retry timer on success
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Bidirectional sync: seed missing items to Mongo, and update local cache from Mongo
    syncWithMongo().catch(e => console.warn('Sync notice:', e.message));

    return conn;
  } catch (error) {
    isConnecting = false;
    lastMongoError = error.message;

    console.error(`\n======================================================================`);
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (
      error.message?.includes('SSL alert number 80') || 
      error.message?.includes('tlsv1 alert internal error') ||
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoServerSelectionError'
    ) {
      console.error(`\n🔍 ROOT CAUSE IDENTIFIED:`);
      console.error(`   MongoDB Atlas closed the TLS connection with 'SSL Alert 80'.`);
      console.error(`   This happens when the host/server IP address is NOT whitelisted in MongoDB Atlas.`);
      console.error(`\n🛠️  HOW TO FIX IN MONGODB ATLAS (Takes 30 seconds):`);
      console.error(`   1. Open MongoDB Atlas: https://cloud.mongodb.com`);
      console.error(`   2. Go to "Security" (left sidebar) -> "Network Access"`);
      console.error(`   3. Click "+ ADD IP ADDRESS"`);
      console.error(`   4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)`);
      console.error(`   5. Click "Confirm"`);
    }

    console.error(`\n🛡️  SEAMLESS FALLBACK & AUTO-RECONNECT ACTIVE:`);
    console.error(`   Using local store while scheduling automatic background reconnection...`);
    console.error(`======================================================================\n`);

    // Automatically retry connecting in background every 5 seconds
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB();
      }, 5000);
    }

    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Scheduling auto-reconnect...');
  if (!reconnectTimer) {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectDB();
    }, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  lastMongoError = err.message;
  console.warn('⚠️ MongoDB socket notice:', err.message);
});

export const syncWithMongo = async () => {
  try {
    const { localStore } = await import('./localStore.js');
    const Setting = (await import('../models/Setting.js')).default;
    const Treatment = (await import('../models/Treatment.js')).default;

    // 1. First, pull all existing settings from MongoDB to update localStore
    const mongoSettings = await Setting.find({});
    const mongoKeys = new Set();
    for (const s of mongoSettings) {
      mongoKeys.add(s.key);
      localStore.saveSetting(s.key, s.value);
    }

    // 2. Push any default/local settings that don't exist yet in Mongo
    const store = localStore.loadRawStore();
    if (store && store.settings) {
      for (const [key, val] of Object.entries(store.settings)) {
        if (!mongoKeys.has(key) && val !== undefined && val !== null) {
          await Setting.findOneAndUpdate(
            { key },
            { $setOnInsert: { value: val } },
            { upsert: true }
          );
        }
      }
    }
    console.log('🔄 Synced settings with MongoDB Atlas');

    // 3. Sync treatments
    const mongoTreatments = await Treatment.find({});
    const mongoSlugs = new Set(mongoTreatments.map(t => (t.slug || '').toLowerCase().trim()));
    if (store && Array.isArray(store.treatments)) {
      for (const t of store.treatments) {
        const slug = (t.slug || '').toLowerCase().trim();
        if (slug && !mongoSlugs.has(slug)) {
          await Treatment.findOneAndUpdate(
            { slug },
            { $setOnInsert: { ...t, slug } },
            { upsert: true }
          );
        }
      }
    }
    console.log('🔄 Synced treatments with MongoDB Atlas');
  } catch (err) {
    console.warn('MongoDB sync notice:', err.message);
  }
};

export default connectDB;
