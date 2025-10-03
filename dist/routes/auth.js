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
const express_1 = require("express");
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
// Register Route
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const existingUser = yield userRepository.findOneBy({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const newUser = new User_1.User();
        newUser.username = username;
        newUser.password_hash = password;
        yield userRepository.save(newUser);
        res.status(201).json({ message: 'User registered successfully!' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
}));
// Login Route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield userRepository.findOneBy({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
}));
exports.default = router;
