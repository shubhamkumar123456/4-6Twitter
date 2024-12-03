const express = require('express');
const checkToken = require('../middleware/checkToken');
const { sendMessage, getConversation } = require('../controllers/messageController');
const router = express.Router();


router.post('/send/:recieverId',checkToken,sendMessage);
router.get('/getMessage/:recieverId',checkToken,getConversation)




module.exports = router