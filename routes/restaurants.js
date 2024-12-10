const express = require('express');
const axios = require('axios');
const router = express.Router();

const googleApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const placesApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';


module.exports = (db) => {
    const router = express.Router();

    // Middleware to require login
    function requireLogin(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/users/login');
        }
        next();
    }

    // Search for restaurants
    router.get('/search', async (req, res) => {
        const { query, location, radius } = req.query;
    
        try {
            // Step 1: Convert location (city/postcode) to latitude and longitude
            const geocodeResponse = await axios.get(geocodeApiUrl, {
                params: {
                    address: location,
                    key: process.env.GOOGLE_PLACES_API_KEY,
                },
            });
    
            // Check if the geocode response contains results
            if (geocodeResponse.data.results.length === 0) {
                return res.status(400).send('Invalid location. Please enter a valid city or postcode.');
            }
    
            const coordinates = geocodeResponse.data.results[0].geometry.location;
            const latLng = `${coordinates.lat},${coordinates.lng}`;
    
            // Step 2: Use latitude and longitude in the Google Places API request
            const placesResponse = await axios.get(placesApiUrl, {
                params: {
                    query: query || 'restaurants',
                    location: latLng,
                    radius: radius || 5000, // Default: 5 km
                    type: 'restaurant',
                    key: process.env.GOOGLE_PLACES_API_KEY,
                },
            });
    
            res.render('search', {
                results: placesResponse.data.results,
                user: req.session.user,
                query,
                location,
                radius,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('An error occurred while fetching restaurant data.');
        }
    });
    
    module.exports = router;

    // Fetch user's favourite restaurants
    router.get('/favourites', async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/users/login'); // Redirect if user is not logged in
        }
    
        const userId = req.session.user.id;
    
        const sql = `SELECT * FROM favourites WHERE user_id = ?`;
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            res.render('favourites', { favourites: results, user: req.session.user });
        });
    });
       

    // Add a restaurant to favourites
    router.post('/favourites', requireLogin, (req, res) => {
        const { restaurantName, restaurantAddress, restaurantRating } = req.body;
    const userId = req.session.user.id;

    if (!userId) {
        return res.redirect('/users/login'); // Redirect to login page if user is not logged in
    }

    // Check if the restaurant is already in favourites
    const checkSql = `SELECT * FROM favourites WHERE user_id = ? AND restaurant_name = ? AND restaurant_address = ?`;
    db.query(checkSql, [userId, restaurantName, restaurantAddress], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            // Restaurant already exists in favourites
            return res.render('message', {
                message: 'This restaurant is already in your favourites.',
                redirectUrl: '/restaurants/favourites',
            });
        }

        // Insert the restaurant into favourites
        const insertSql = `INSERT INTO favourites (user_id, restaurant_name, restaurant_address, restaurant_rating) VALUES (?, ?, ?, ?)`;
        db.query(insertSql, [userId, restaurantName, restaurantAddress, restaurantRating], (err) => {
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.redirect('/restaurants/favourites'); // Redirect to favourites page
        });
    });
});

    router.post('/favourites/remove', (req, res) => {
        const favouriteId = req.body.id;
    
        if (!req.session.user) {
            return res.redirect('/users/login'); // Redirect if user is not logged in
        }
    
        const sql = `DELETE FROM favourites WHERE id = ? AND user_id = ?`;
        db.query(sql, [favouriteId, req.session.user.id], (err, result) => {
            if (err) {
                console.error('Database deletion error:', err);
                return res.status(500).send('Error deleting favourite.');
            }
    
            res.redirect('/restaurants/favourites'); // Redirect back to favourites page
        });
    });

    router.post('/rate', (req, res) => {
        const { id, user_rating } = req.body;
    
        if (!req.session.user) {
            return res.redirect('/users/login'); // Redirect to login page if user is not logged in
        }
    
        const sql = `UPDATE favourites SET user_rating = ? WHERE id = ? AND user_id = ?`;
        db.query(sql, [user_rating, id, req.session.user.id], (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Error updating rating.');
            }
    
            res.redirect('/restaurants/favourites'); // Redirect back to the favourites page
        });
    });
    
    
    

    return router;
};

