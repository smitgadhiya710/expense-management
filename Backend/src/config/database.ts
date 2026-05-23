import mongoose from 'mongoose';

import config from './index.js';

const connectDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongoUri, {
    dbName: config.mongoDatabase,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  console.log('mongodb connected');
};

export default connectDatabase;
