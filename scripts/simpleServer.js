const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Simple test server running' });
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt:', req.body);
    res.json({ message: 'Test login endpoint', body: req.body });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simple server running on http://0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});