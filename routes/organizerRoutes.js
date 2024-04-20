// routes/organizerRoutes.js

const express = require('express');
const router = express.Router();
const orgController = require('../controllers/AuthController');

router.post("/login", orgController.login);

// Route to render login.ejs
router.get("/login", (req, res) => {
    res.render('login');
});



module.exports = router;
