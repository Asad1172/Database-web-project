const express = require('express');
const router = express.Router();

// Export the router object so index.js can access it
module.exports = router

// Home Page
router.get('/', (req, res) => {
    res.render('index', { shopData: req.app.locals.shopData, user: req.session.user });
});

// About Page
router.get('/about', (req, res) => {
    res.render('about', { shopData: req.app.locals.shopData, user: req.session.user });
});

module.exports = router;
