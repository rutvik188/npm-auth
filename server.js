const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.cookies['authenticated'] === 'true') {
        // User is authenticated, proceed to the next middleware/route
        next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect('/login');
    }
};

// Helper function to get user by username from the database
function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Serve HTML pages from the 'views' directory
app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

// Apply the isAuthenticated middleware to protect the profile route
app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/views/profile.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/signup.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;



    const user = await getUserByUsername(username);

    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Set a cookie to mark the user as authenticated
            res.cookie('authenticated', 'true');
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid password');
        }
    } else {
        res.status(401).send('User not found');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('authenticated');
    res.redirect('/login');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
        res.status(400).send('User already exists');
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(201).send('User created successfully');
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
