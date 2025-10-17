"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const auth_1 = __importDefault(require("./routes/auth"));
const requisicoesRoutes_1 = __importDefault(require("./routes/requisicoesRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const suppliersRoutes_1 = __importDefault(require("./routes/suppliersRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
}));
app.use(express_1.default.json());
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connection initialized successfully!");
    app.use('/api/auth', auth_1.default);
    app.use('/api/requisicoes', requisicoesRoutes_1.default);
    app.use('/api/inventory', inventoryRoutes_1.default);
    // Also mount Portuguese path to support frontends that call /api/inventario
    app.use('/api/inventario', inventoryRoutes_1.default);
    app.use('/api/suppliers', suppliersRoutes_1.default); // Register suppliers routes
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => console.error("Database connection error:", error));
