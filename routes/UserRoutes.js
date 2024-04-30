const express = require('express');
const router = express.Router();


const UserController = require('../controllers/UserController');

router.get("/home" , UserController.home);
router.get("/realm_search" , UserController.realm_search);
router.post("/join_realm" , UserController.join_realm);


module.exports = router;
