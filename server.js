console.log("server.js file loaded");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure session
app.use(session({
    secret: "college-video-share-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};

// Login Endpoint
app.post("/login", (req, res) => {
    let { registerNumber, password } = req.body;

    // Explicitly convert to string and trim
    registerNumber = String(registerNumber || "").trim();
    password = String(password || "").trim();

    console.log(`Login attempt for Reg: "${registerNumber}" (length: ${registerNumber.length})`);

    // Register number must start with 71402 and be 12 digits total
    const isRegisterValid = /^71402\d{7}$/.test(registerNumber);
    const isPasswordValid = password === "Siet@i2024";

    if (!isRegisterValid) {
        console.log("Login failed: Register number must be 12 digits and you need to a SIET Student");
        return res.status(401).json({ message: "Register number must start with 71402 and be 12 digits" });
    }

    if (!isPasswordValid) {
        console.log(`Login failed: Password mismatch. Received: "${password}"`);
        return res.status(401).json({ message: "Incorrect Wi-Fi password" });
    }

    // If both are valid
    req.session.authenticated = true;
    req.session.user = registerNumber;
    console.log("Login successful");
    res.json({ message: "Login successful" });
});

// Check Auth Status
app.get("/auth-status", (req, res) => {
    if (req.session.authenticated) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out" });
});

// Protected Routes
app.post("/upload", isAuthenticated, upload.single("video"), (req, res) => {
    res.json({ message: "Uploaded successfully" });
});

app.get("/videos", isAuthenticated, (req, res) => {
    fs.readdir("uploads", (err, files) => res.json(files));
});

app.get("/download/:name", isAuthenticated, (req, res) => {
    res.download(path.join(__dirname, "uploads", req.params.name));
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
    console.log("reached end of file");
});
