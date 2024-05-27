const express = require("express")
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages } = require("../controllers/messageController");


const Router = express.Router();

Router.post("/",protect,sendMessage)
Router.get("/:ChatId",protect,allMessages)

module.exports = Router;
