const express = require('express');
const router = express.Router();

// Middleware to check if the user is logged in
function requireLogin2(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('./users/login'); // Redirect to login page if not logged in
    }
    next(); // Proceed to the requested route
}

// Export the router object so index.js can access it
module.exports = router

// Home Page
router.get('/', (req, res) => {
    res.render('index', { shopData: req.app.locals.shopData, user: req.session.user });
});

// About Page
router.get('/about', requireLogin2, (req, res) => {
    res.render('about', { shopData: req.app.locals.shopData, user: req.session.user });
});

module.exports = router;
