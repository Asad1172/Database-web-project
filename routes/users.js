const express = require('express');
const bcrypt = require('bcrypt');
//const db = require('../config/db');
const router = express.Router();

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) throw err;
        res.redirect('/users/login');
    });
});

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.render('message', {
                message: 'Invalid email or password. Please try again.',
                redirectUrl: '/users/login',
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('message', {
                message: 'Invalid email or password. Please try again.',
                redirectUrl: '/users/login',
            });
        }

        req.session.user = { id: user.id, username: user.username, email: user.email };
        return res.redirect('../');
    });
});






// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('../users/login'); // Redirect to login page after logout
    });
});

module.exports = router;
