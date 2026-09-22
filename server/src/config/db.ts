import mongoose from 'dotenv';
import mongoosePackage from 'mongoose';

export let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('username:password')) {
    console.info('ℹ️ MONGODB_URI not provided or placeholder. Using resilient in-memory datastore with MongoDB Atlas compatibility.');
    isMongoConnected = false;
    return false;
  }

  try {
    console.info('Connecting to MongoDB Atlas...');
    await mongoosePackage.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    console.info('✅ Successfully connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.warn('⚠️ Could not connect to MongoDB Atlas:', (error as Error).message);
    console.info('ℹ️ Operating in resilient in-memory MongoDB compatibility mode.');
    isMongoConnected = false;
    return false;
  }
}
