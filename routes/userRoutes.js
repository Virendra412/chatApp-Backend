const express = require('express');
const { registerUser, authUser, allUser, getCurrentUser, addNotification, removeNotification, getNotification } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const Router = express.Router();



Router.post('/register', registerUser)
Router.post('/login', authUser)
Router.get('/search', protect, allUser)
Router.get('/getuser',protect,getCurrentUser)
Router.post('/addNoti',protect,addNotification)
Router.get('/getNoti',protect,getNotification)
Router.post('/removeNoti',protect,removeNotification)
module.exports = Router;


