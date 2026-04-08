const express = require('express');
const { aiChat } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', aiChat);

module.exports = router;
