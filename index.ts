import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';

import { PORT, connectMongoDB } from "./config";
import http from "http";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'
import UserRouter from "./routes/userRoute";
import LeaderBoardRouter from "./routes/leaderRoute";

// Swagger options
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "LogRocket Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LogRocket",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8500",
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

const specs = swaggerJsdoc(options);

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Define routes for different API endpoints
app.use("/api/users", UserRouter);
app.use("/api/leaderboard", LeaderBoardRouter);

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
