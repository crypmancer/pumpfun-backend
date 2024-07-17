"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const http_1 = __importDefault(require("http"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const tokenRoute_1 = __importDefault(require("./routes/tokenRoute"));
// Load environment variables from .env file
dotenv_1.default.config();
// Connect to the MongoDB database
(0, config_1.connectMongoDB)();
// Create an instance of the Express application
const app = (0, express_1.default)();
const whitelist = ["http://localhost:5173", "https://lmao-fun-beta-version.vercel.app"];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
// Set up Cross-Origin Resource Sharing (CORS) options
app.use((0, cors_1.default)(corsOptions));
// Serve static files from the 'public' folder
// Parse incoming JSON requests using body-parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
const server = http_1.default.createServer(app);
// cron.schedule(`* * * * * *`, updatePermins)
// Define routes for different API endpoints
app.use("/api/users", userRoute_1.default);
app.use("/api/tokens", tokenRoute_1.default);
// Define a route to check if the backend server is running
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Backend Server is Running now!");
}));
// Start the Express server to listen on the specified port
server.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
