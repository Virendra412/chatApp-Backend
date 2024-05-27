const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userID param not found");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.user._id } } },
    ]
   
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name" },
    });

  if (isChat.length > 0) {
    // console.log(isChat[0]);
    res.status(200).send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
   
    const FullChat = await Chat.findById({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );

    res.send(FullChat);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  const Chats = await Chat.find({ users: req.user._id }).populate("users", "-password").populate("groupAdmin", "-password").sort({updatedAt:-1})
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name" },
    });

  res.send(Chats);
});



const createGroupChat = asyncHandler(async (req, res) => {
 
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({message:"Please Fill all the fields"})
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send({message:"More than 2 user required for Group Chat"})
  }

  users.push(req.user._id)
  

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin:req.user._id
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate("users", "-password").populate("groupAdmin", "-password")
    res.status(200).send(fullGroupChat)
    
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message })
  }


})



const renameGroup = asyncHandler(async (req, res) => {
  nchatName= req.body.chatName
  const chatId = req.body.chatId;
  const foundChat = await Chat.findById(chatId).populate("groupAdmin","-password");


  if (!foundChat.groupAdmin._id.equals( req.user._id)) {
    return res.status(400).send({message:"Dont Have Permision"})
  }

//   foundChat.set('chatName',"hiiii2222")
// await foundChat.save()
  // foundChat.chatName = nchatName
  // foundChat.save()
await foundChat.updateOne({ chatName: nchatName })
const updatedChat=await Chat.findById(chatId).populate("users", "-password").populate("groupAdmin", "-password")

  res.send(updatedChat)
})

const addToGroup=asyncHandler(async (req,res)=>{
  const userId = req.body.userId;
  const chatId = req.body.chatId;

  const foundChat = await Chat.findByIdAndUpdate(chatId,{$push:{users:userId}},{new:true}).populate("users", "-password").populate("groupAdmin", "-password")
 

  if (!foundChat) {
    res.status(404)
    throw new Error("Chat Not Found")
  }

  res.send(foundChat)
})


const removeFromGroup=asyncHandler(async (req,res)=>{
  const userId = req.body.userId;
  const chatId = req.body.chatId;

  const foundChat = await Chat.findByIdAndUpdate(chatId,{$pull:{users:userId}},{new:true}).populate("users", "-password").populate("groupAdmin", "-password")
 

  if (!foundChat) {
    res.status(404)
    throw new Error("Chat Not Found")
  }

  res.send(foundChat)
})





module.exports = { accessChat, fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};
