// Import required modules
require('dotenv').config();
var express = require('express');
var ejs = require('ejs');
var validator = require('express-validator');
const expressSanitizer = require('express-sanitizer');

// Import mysql module
var mysql = require('mysql2');
var session = require('express-session');

// Create the express application object
const app = express();
const port = 8000;

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const apiRoutes = require('./routes/api');

// Configure session middleware
app.use(
    session({
        secret: 'somerandomstuff',
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000, // Session expires in 10 minutes
        },
    })
);

// Use sanitizer
app.use(expressSanitizer());

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., CSS, JS) from the public folder
app.use(express.static(__dirname + '/public'));

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'restaurant',
    password: 'qwertyuiop',
    database: 'restaurant_finder'
})
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.render('index', { user: req.session.user }); // Render homepage for logged-in users
    }
    return res.redirect('/users/login'); // Redirect to login page if not logged in
});


// Middleware to check if the user is logged in
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/users/login'); // Redirect to login page if not logged in
    }
    next(); // Proceed to the requested route
}

// Apply the middleware to all routes except login and registration
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/users/login' || req.path === '/users/register') {
        return next(); // Allow API access and login/registration pages without login
    }
    requireLogin(req, res, next); // Restrict access to other pages
});


// Middleware to make `user` available in EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // `user` will be `null` if not logged in
    next();
});

// Define application-specific data
app.locals.shopData = { shopName: 'Restaurant Finder' };

// Load route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Load route handlers for users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

app.use('/api', apiRoutes); // All API routes will be prefixed with /api


// Load route handlers for restaurants
const restaurantsRoutes = require('./routes/restaurants')(db);
app.use('/restaurants', restaurantsRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
