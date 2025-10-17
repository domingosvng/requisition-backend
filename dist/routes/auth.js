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
const bcrypt_1 = __importDefault(require("bcrypt"));
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
        // Default role is SOLICITANTE
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const newUser = userRepository.create({ username, role: 'SOLICITANTE', password_hash: hashed });
        yield userRepository.save(newUser);
        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
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
        // We need password_hash when present, so explicitly select it
        const user = yield userRepository.findOne({
            where: { username },
            select: ['id', 'username', 'role', 'password_hash']
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // If there's a password_hash, verify with bcrypt. If not (legacy/dev account), accept
        // the fallback where password equals username, then hash & save the provided password
        let passwordOk = false;
        if (user.password_hash) {
            passwordOk = yield bcrypt_1.default.compare(password, user.password_hash);
        }
        else {
            // legacy behavior: password must equal username
            if (password === user.username) {
                passwordOk = true;
                // Hash and save the provided password for future logins
                try {
                    const newHash = yield bcrypt_1.default.hash(password, 10);
                    user.password_hash = newHash;
                    yield userRepository.save(user);
                }
                catch (e) {
                    console.error('Failed to migrate legacy password to hash:', e);
                }
            }
        }
        if (!passwordOk)
            return res.status(401).json({ message: 'Credenciais inválidas' });
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
