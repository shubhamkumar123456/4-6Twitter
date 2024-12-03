const express = require('express');
const { createPost, getAllPost, updatePost, deletePost, getUserPost, likePost, commentPost } = require('../controllers/postController');
const checkToken = require('../middleware/checkToken');
const router = express.Router();


router.post('/create',checkToken,createPost)
router.get('/getAllpost',getAllPost)
router.put('/update/:_id',updatePost)
router.delete('/delete/:_id',deletePost);
router.get('/userPost/:userId', getUserPost)
router.get('/like/:postId',checkToken, likePost);
router.post('/comment/:postId',checkToken,commentPost);



module.exports = router 