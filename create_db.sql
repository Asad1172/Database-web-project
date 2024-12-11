-- Drop database if it exists
DROP DATABASE IF EXISTS restaurant_finder;

-- Create the database
CREATE DATABASE restaurant_finder;
USE restaurant_finder;

-- Drop users table if it exists
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop favourites table if it exists
DROP TABLE IF EXISTS favourites;

-- Create favourites table
CREATE TABLE favourites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(255),
    restaurant_address VARCHAR(255),
    restaurant_rating FLOAT,
    user_rating INT DEFAULT NULL,
    restaurant_image VARCHAR(500) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create the MySQL user if it does not exist
CREATE USER IF NOT EXISTS 'restaurant'@'localhost' IDENTIFIED BY 'qwertyuiop';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON restaurant_finder.* TO 'restaurant'@'localhost';

-- Apply privileges immediately
FLUSH PRIVILEGES;
