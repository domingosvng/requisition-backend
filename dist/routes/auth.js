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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entity/User");
const data_source_1 = require("../data-source");
const router = express_1.default.Router();
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
// Register route
// Handles user registration. Hashes password in User entity.
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const existingUser = yield userRepository.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        // DEMO ONLY: Store plain password in password_hash
        const password_hash = password;
        // Default role is SOLICITANTE
        const newUser = userRepository.create({ username, password_hash, role: 'SOLICITANTE' });
        yield userRepository.save(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
}));
// Login route
// Authenticates user and returns JWT token if credentials are valid.
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield userRepository.findOne({
            where: { username },
            select: ['id', 'username', 'role', 'password_hash']
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // --- LOGIN DEBUG ---
        console.log('--- LOGIN DEBUG ---');
        console.log(`Input Password: ${password}`); // What the client sent
        console.log(`DB password_hash: ${user.password_hash}`);
        // If user.password exists, log it too
        console.log(`DB password: ${user.password}`);
        console.log('-------------------');
        // --- END DEBUG BLOCK ---
        // DEMO ONLY: Compare plain password to password_hash directly
        if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid credentials. DEBUG: Check console output.' });
        }
        // Include role in JWT and use env secret
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Login failed' });
    }
}));
exports.default = router;
