import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

// Register route
// Handles user registration. Hashes password in User entity.
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

    // DEMO ONLY: Store plain password in password_hash
    const password_hash = password;
    // Default role is SOLICITANTE
    const newUser = userRepository.create({ username, password_hash, role: 'SOLICITANTE' });

        await userRepository.save(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login route
// Authenticates user and returns JWT token if credentials are valid.
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userRepository.findOne({
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
            console.log('-------------------');
            // --- END DEBUG BLOCK ---

            // DEMO ONLY: Compare plain password to password_hash directly
            if (user.password_hash !== password) {
                return res.status(401).json({ message: 'Invalid credentials. DEBUG: Check console output.' });
            }

        // Include role in JWT and use env secret
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

export default router;