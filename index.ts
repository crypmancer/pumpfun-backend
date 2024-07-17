import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { PORT, connectMongoDB } from "./config";
import http from "http";
import UserRouter from "./routes/userRoute";
import TokenRouter from "./routes/tokenRoute";

import cron from 'node-cron';
import { updatePermins } from "./routes/tradeRoute";


// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();
const whitelist = ["http://localhost:5173", "https://lmao-fun-beta-version.vercel.app"];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
  } else {
   callback(new Error('Not allowed by CORS'));
  }
 },
};
// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors(corsOptions));

// Serve static files from the 'public' folder

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

// cron.schedule(`* * * * * *`, updatePermins)

// Define routes for different API endpoints
app.use("/api/users", UserRouter);
app.use("/api/tokens", TokenRouter);


// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
