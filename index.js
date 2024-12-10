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

// Middleware to make `user` available in EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // `user` will be `null` if not logged in
    next();
});

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



// Define application-specific data
app.locals.shopData = { shopName: 'Restaurant Finder' };

// Load route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Load route handlers for users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load route handlers for restaurants
const restaurantsRoutes = require('./routes/restaurants')(db);
app.use('/restaurants', restaurantsRoutes);

// Home route
app.get('/', (req, res) => {
    res.redirect('/restaurants/search');
});

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
