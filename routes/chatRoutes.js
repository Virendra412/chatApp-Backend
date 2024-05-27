const express = require("express")
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, addNotification, removeNotification } = require("../controllers/chatController");

const Router = express.Router();

Router.get("/", protect, fetchChats);
Router.post("/", protect, accessChat);
Router.post("/group", protect, createGroupChat);
Router.put("/renameGroup", protect, renameGroup);
Router.put("/addgroup", protect, addToGroup);
Router.put("/removegroup", protect, removeFromGroup);


module.exports = Router;
