import dotenv from "dotenv";
dotenv.config();

try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

// export const MONGO_URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
export const MONGO_URL = 'mongodb://mongo:KYtxYUlPJHLumZZERQRUMviexKSMsmlC@roundhouse.proxy.rlwy.net:21011';
export const PORT = process.env.PORT || 9000
export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";