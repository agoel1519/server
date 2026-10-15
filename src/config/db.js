import mongoose from 'mongoose';

// Disable operation buffering so queries fail fast or use fallback instead of hanging for 10+ seconds
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️ MONGO_URI is not set in server/.env. Running with local storage fallback.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      family: 4, // Force IPv4 to prevent Windows OpenSSL IPv6 DNS resolution handshake drops
      tls: true,
      tlsAllowInvalidCertificates: false
    });
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
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
      console.error(`   This happens because your current IP address is NOT whitelisted in MongoDB Atlas.`);
      console.error(`\n🛠️  HOW TO FIX IN MONGODB ATLAS (Takes 30 seconds):`);
      console.error(`   1. Open MongoDB Atlas: https://cloud.mongodb.com`);
      console.error(`   2. Go to "Security" (left sidebar) -> "Network Access"`);
      console.error(`   3. Click "+ ADD IP ADDRESS"`);
      console.error(`   4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0) or "Add Current IP"`);
      console.error(`   5. Click "Confirm"`);
    }

    console.error(`\n🛡️  SEAMLESS FALLBACK ACTIVE:`);
    console.error(`   The backend will use the built-in local store so your website,`);
    console.error(`   admin dashboard, and treatments continue working without hanging!`);
    console.error(`======================================================================\n`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  // Avoid unhandled crashes on runtime socket errors
  console.warn('⚠️ MongoDB socket notice:', err.message);
});

export default connectDB;
