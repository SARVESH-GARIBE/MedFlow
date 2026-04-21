import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Ensure MONGODB_URI is defined
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      const errorMsg = "MONGODB_URI environment variable is not defined. Please ensure .env file has MONGODB_URI configured.";
      console.error(`\n❌ CONFIGURATION ERROR:\n   ${errorMsg}\n`);
      console.error("For local development, use:");
      console.error("   MONGODB_URI=mongodb://127.0.0.1:27017/MedFlow");
      console.error("\nFor production (MongoDB Atlas), use:");
      console.error("   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medflow\n");
      throw new Error(errorMsg);
    }

    // Connect with appropriate options based on environment
    const connectOptions = process.env.NODE_ENV === 'production'
      ? {
          retryWrites: true,
          w: "majority",
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        }
      : {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
        };

    await mongoose.connect(mongoUri, connectOptions);

    console.log("✅ Successfully connected to MongoDB");
    console.log(`   Connection: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);

    // Seed default admin (only in development)
    if (process.env.NODE_ENV === 'development') {
      await seedDefaultAdmin();
    }

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("\nTroubleshooting steps:");
    console.error("1. Ensure MongoDB is running (for local: mongod)");
    console.error("2. Check MONGODB_URI in your .env file");
    console.error("3. For MongoDB Atlas, check IP whitelist and credentials\n");
    throw error;
  }
};

// Seed default admin user
async function seedDefaultAdmin() {
  try {
    const User = (await import('../models/User.js')).default;
    const bcrypt = (await import('bcrypt')).default;

    const adminEmail = 'admin@medflow.local';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        status: 'verified',
        verification: {
          isVerified: true
        },
        assignedArea: {
          city: 'Global',
          area: 'All'
        }
      });

      console.log("✅ Default admin seeded:");
      console.log("   Email: admin@medflow.local");
      console.log("   Password: admin123");
      console.log("   ⚠️  Change this password in production!\n");
    }
  } catch (error) {
    console.error("⚠️  Error seeding default admin:", error.message);
  }
}
