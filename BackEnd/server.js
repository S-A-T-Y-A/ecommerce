const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234567890", // Replace with your MySQL password
    database: "e_commerce"  // Replace with your database name
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database!");
});

// const bcrypt = require('bcryptjs');

// Inside your register API route
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Hash the password before saving to the database
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send("Error hashing password");
        }

        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error saving data");
            } else {
                res.status(200).send("User registered successfully");
            }
        });
    });
});


app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Query to find user by email
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).send("Error querying the database");
        }

        if (results.length === 0) {
            return res.status(400).send("User not found");
        }

        const user = results[0];

        // Compare the entered password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send("Error comparing passwords");
            }

            if (!isMatch) {
                return res.status(400).send("Incorrect password");
            }

            // Proceed to login (send a success response, issue a token, etc.)
            res.status(200).send("Login successful");
        });
    });
});


// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
