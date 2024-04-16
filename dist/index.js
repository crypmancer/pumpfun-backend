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
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const http_1 = __importDefault(require("http"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const leaderRoute_1 = __importDefault(require("./routes/leaderRoute"));
// Swagger options
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "LogRocket Express API with Swagger",
            version: "0.1.0",
            description: "This is a simple CRUD API application made with Express and documented with Swagger",
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
const specs = (0, swagger_jsdoc_1.default)(options);
// Load environment variables from .env file
dotenv_1.default.config();
// Connect to the MongoDB database
(0, config_1.connectMongoDB)();
// Create an instance of the Express application
const app = (0, express_1.default)();
// Set up Cross-Origin Resource Sharing (CORS) options
app.use((0, cors_1.default)());
// Serve static files from the 'public' folder
app.use(express_1.default.static(path_1.default.join(__dirname, './public')));
// Parse incoming JSON requests using body-parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
const server = http_1.default.createServer(app);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Define routes for different API endpoints
app.use("/api/users", userRoute_1.default);
app.use("/api/leaderboard", leaderRoute_1.default);
// Define a route to check if the backend server is running
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Backend Server is Running now!");
}));
// Start the Express server to listen on the specified port
server.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
