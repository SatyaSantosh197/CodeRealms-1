// routes/realmRoutes.js
const express = require('express');
const router = express.Router();
const RealmController = require('../controllers/RealmController');


router.post('/create-problem', RealmController.create_problem);
router.post('/update-contest', RealmController.update_contest);
router.post('/update-realm', RealmController.update_realm);



module.exports = router;
