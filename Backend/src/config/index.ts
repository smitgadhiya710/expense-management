import dotenv from 'dotenv';

dotenv.config();

type Config = {
  appEnv: string;
  port: number;
  mongoUri: string;
  mongoDatabase: string;
  jwtSecret: string;
  jwtExpiresIn: string;
};

const config: Config = {
  appEnv: process.env.APP_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDatabase: process.env.MONGO_DATABASE || 'expense_management',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

export default config;
