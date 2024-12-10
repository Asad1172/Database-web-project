CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(255),
    restaurant_address VARCHAR(255),
    restaurant_rating FLOAT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE USER IF NOT EXISTS 'restaurant'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON restaurant_finder.* TO 'restaurant'@'localhost';