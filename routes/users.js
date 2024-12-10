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
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (err, results) => {
        if (err) throw err;

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        req.session.user = results[0]; // Store user info in the session
        res.redirect('/'); // Redirect after successful login
    });
});




// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;
