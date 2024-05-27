const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const mongoose = require("mongoose");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid Data passsed");
    res.sendStatus(400);
  }

  let newMesage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMesage);
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    const resultmessage=await Message.findById(message._id).populate("sender", "name pic")
          .populate("chat");
      res.status(200).send(resultmessage)
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const { ChatId } = req.params;

    const allchats = await Message.find({ chat: ChatId })
      .populate("sender", "name pic")
      .populate("chat");
    res.send(allchats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
