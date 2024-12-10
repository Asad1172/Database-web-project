const express = require('express');
const router = express.Router();

// Middleware to validate the username
router.use('/:username', (req, res, next) => {
    const username = req.params.username;

    // Check if the user exists in the database
    const sql = `SELECT * FROM users WHERE username = ?`;
    global.db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: `User '${username}' not found` });
        }

        // Attach user details to the request for further use
        req.user = results[0];
        next();
    });
});

// Get all favourites for the user
router.get('/:username/favourites', (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT * FROM favourites WHERE user_id = ?`;
    global.db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Add a restaurant to the user's favourites
router.post('/:username/favourites', (req, res) => {
    const userId = req.user.id;
    const { restaurantName, restaurantAddress, restaurantRating } = req.body;

    const sql = `INSERT INTO favourites (user_id, restaurant_name, restaurant_address, restaurant_rating) VALUES (?, ?, ?, ?)`;
    global.db.query(sql, [userId, restaurantName, restaurantAddress, restaurantRating], (err, result) => {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Restaurant added to favourites', id: result.insertId });
    });
});

// Delete a restaurant from the user's favourites
router.delete('/:username/favourites/:id', (req, res) => {
    const userId = req.user.id;
    const favouriteId = req.params.id;

    const sql = `DELETE FROM favourites WHERE id = ? AND user_id = ?`;
    global.db.query(sql, [favouriteId, userId], (err, result) => {
        if (err) {
            console.error('Database deletion error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Restaurant removed from favourites' });
    });
});

module.exports = router;
