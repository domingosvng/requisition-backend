import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
            return res.status(400).json({ 
                message: 'Usuário e senha são obrigatórios',
                errors: [
                    ...((!username) ? [{ field: 'username', message: 'Usuário é obrigatório' }] : []),
                    ...((!password) ? [{ field: 'password', message: 'Senha é obrigatória' }] : [])
                ],
                errorType: 'VALIDATION_ERROR'
            });
        }

        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Nome de usuário já existe',
                errors: [{ field: 'username', message: 'Este nome de usuário já está em uso', value: username }],
                errorType: 'DUPLICATE_VALUE'
            });
        }

    // Default role is SOLICITANTE
    const hashed = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ username, role: 'SOLICITANTE', password_hash: hashed });
    await userRepository.save(newUser);
        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
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

        // We need password_hash when present, so explicitly select it
        const user = await userRepository.findOne({
            where: { username },
            select: ['id', 'username', 'role', 'password_hash'] as any
        });

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuário não encontrado',
                errors: [{ field: 'username', message: 'Usuário não existe', value: username }],
                errorType: 'AUTHENTICATION_ERROR'
            });
        }

        // If there's a password_hash, verify with bcrypt. If not (legacy/dev account), accept
        // the fallback where password equals username, then hash & save the provided password
        let passwordOk = false;
        if (user.password_hash) {
            passwordOk = await bcrypt.compare(password, user.password_hash);
        } else {
            // legacy behavior: password must equal username
            if (password === user.username) {
                passwordOk = true;
                // Hash and save the provided password for future logins
                try {
                    const newHash = await bcrypt.hash(password, 10);
                    user.password_hash = newHash;
                    await userRepository.save(user);
                } catch (e) {
                    console.error('Failed to migrate legacy password to hash:', e);
                }
            }
        }

        if (!passwordOk) return res.status(401).json({ 
            message: 'Senha incorreta',
            errors: [{ field: 'password', message: 'A senha fornecida está incorreta' }],
            errorType: 'AUTHENTICATION_ERROR'
        });

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