const express = require('express');
const axios = require('axios');
const router = express.Router();
const crypto = require("crypto");

const googleApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const placesApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';


module.exports = (db) => {
    const router = express.Router();

    // Middleware to require login
    // function requireLogin(req, res, next) {
    //     if (!req.session.user) {
    //         return res.redirect('../users/login');
    //     }
    //     next();
    // }

    // Search for restaurants
    router.get('/search', async (req, res) => {
        const { query, location, minRating } = req.query;
        const minRatingFilter = parseFloat(minRating) || 0;
    
        try {
            // Step 1: Geocode the location
            const geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
            const geocodeResponse = await axios.get(geocodeApiUrl, {
                params: {
                    address: location,
                    key: process.env.GOOGLE_PLACES_API_KEY,
                },
            });
    
            if (geocodeResponse.data.results.length === 0) {
                return res.render('search', {
                    results: [],
                    user: req.session.user,
                    query,
                    location,
                    minRating: minRatingFilter,
                    error: 'Invalid location. Please try again.',
                });
            }
    
            const coordinates = geocodeResponse.data.results[0].geometry.location;
            const latLng = `${coordinates.lat},${coordinates.lng}`;
    
            // Step 2: Search for restaurants
            const placesApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
            const placesResponse = await axios.get(placesApiUrl, {
                params: {
                    query: query || 'restaurants',
                    location: latLng,
                    radius: 5000, // Search radius in meters
                    type: 'restaurant',
                    key: process.env.GOOGLE_PLACES_API_KEY,
                },
            });
    
            // Step 3: Filter and format results with image URLs
            const filteredResults = placesResponse.data.results
                .filter((restaurant) => restaurant.rating >= minRatingFilter)
                .map((restaurant) => ({
                    name: restaurant.name,
                    address: restaurant.formatted_address,
                    rating: restaurant.rating,
                    image: restaurant.photos
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${restaurant.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
                        : null, // Use `null` if no image is available
                }));
    
            res.render('search', {
                results: filteredResults,
                user: req.session.user,
                query,
                location,
                minRating: minRatingFilter,
                error: null,
            });
        } catch (error) {
            console.error('Error fetching restaurant data:', error.message);
            res.render('search', {
                results: [],
                user: req.session.user,
                query,
                location,
                minRating: minRatingFilter,
                error: 'An error occurred while fetching restaurant data. Please try again.',
            });
        }
    });
    
    
    
    module.exports = router;

   // Fetch user's favourite restaurants
router.get('/favourites', (req, res) => {
    const userId = req.session.user.id;
    const minRating = parseFloat(req.query.minRating) || 0; // Default to 0 if no minRating is provided
    const searchQuery = req.query.query || ''; // Extract search query
    const searchLocation = req.query.location || ''; // Extract search location

    const sql = `
        SELECT * FROM favourites 
        WHERE user_id = ? AND restaurant_rating >= ?
    `;

    global.db.query(sql, [userId, minRating], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Format the results to include image URLs
        const favourites = results.map((favourite) => ({
            ...favourite,
            image: favourite.restaurant_image
                ? favourite.restaurant_image
                : '/images/default-restaurant.jpg', // Fallback to a default image if no image URL is saved
        }));

        res.render('favourites', {
            favourites,
            user: req.session.user,
            minRating, // Pass the current filter value to the template
            searchQuery, // Pass search query back to the template
            searchLocation, // Pass search location back to the template
        });
    });
});

    

// Add a restaurant to favourites
router.post('/favourites', (req, res) => {
    const { restaurantName, restaurantAddress, restaurantRating, restaurantImage, searchQuery, searchLocation } = req.body;
    const userId = req.session.user.id;

    // if (!userId) {
    //     return res.redirect('/users/login'); // Redirect to login page if user is not logged in
    // }

    // Check if the restaurant is already in favourites
    const checkSql = `SELECT * FROM favourites WHERE user_id = ? AND restaurant_name = ? AND restaurant_address = ?`;
    db.query(checkSql, [userId, restaurantName, restaurantAddress], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            // Restaurant already exists in favourites
            return res.redirect(`../restaurants/favourites?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
        }

        // Insert the restaurant into favourites
        const insertSql = `
            INSERT INTO favourites (user_id, restaurant_name, restaurant_address, restaurant_rating, restaurant_image) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [userId, restaurantName, restaurantAddress, restaurantRating, restaurantImage], (err) => {
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.redirect(`../restaurants/favourites?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
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
    
            res.redirect('./'); // Redirect back to favourites page
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
    
            res.redirect('./favourites'); // Redirect back to the favourites page
        });
    });
    
    
// About Page
router.get('/about', (req, res) => {
    res.render('about', { shopData: req.app.locals.shopData, user: req.session.user });
});


//Route to API key
router.get("/apiKey", async (req, res) => {
    try {

        const userId = req.session.user.id;

        const apiKeySql = "SELECT api_key FROM users WHERE id = ?";
        const [results] = await db.promise().query(apiKeySql, [userId]);

        let apiKey = results[0]?.api_key;
        if (!apiKey) {
            apiKey = crypto.randomBytes(16).toString("hex");
            const updateSql = "UPDATE users SET api_key = ? WHERE id = ?";
            await db.promise().query(updateSql, [apiKey, userId]);
        }


        res.render("apikey", { apiKey });
    } catch (err) {
        console.error("Error fetching or generating API key:", err);
        res.status(500).send("An error occurred while fetching or generating your API key.");
    }
});

    

    return router;
};

