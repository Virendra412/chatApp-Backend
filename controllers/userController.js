const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const Message = require("../models/messageModel");

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({ name, email, password, pic });
  const token = await user.generateToken();
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token,
    });
  }
});

const authUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User doesn't Exixts");
  }

  const isValidPassword = await user.matchPassword(password);
  if (!isValidPassword) {
    res.status(400);
    throw new Error("Invalid Email and Password");
  }

  if (user) {
    const token = await user.generateToken();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token,
    });
  }
});


const allUser = asyncHandler(async (req, res) => {
 
    const keyword = req.query.search;
    // console.log(keyword);
  const result = await User.find({
    $or: [{ name: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } }]
  }).find({ _id: { $ne: req.user._id } }).select("-password")
   
    if (!result) {
       return res.status(400).send("no User found")
    }

    return res.status(200).send(result)
    
})


const getCurrentUser=asyncHandler(async (req,res)=>{
    res.send(req.user)
})


const addNotification = asyncHandler(async (req, res) => {

  
  const foundUser = await User.findById(req.user._id);
  const foundMsg = await Message.findById(req.body.msgId)
  
  foundUser.notif.push(foundMsg)
  foundUser.save().then(data => {
    
    res.send(data)
  })
 
})
const addNotificationForOffline = async (userId, mesId)=>{
  const foundUser = await User.findById(userId);
  const foundMsg = await Message.findById(mesId)
  
  foundUser.notif.push(foundMsg)
  await foundUser.save()
  console.log("notification added for user " + foundUser.name);
}

const removeNotification = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const foundUser = await User.findByIdAndUpdate(req.user._id).populate('notif')
  foundUser.notif= foundUser.notif.filter(msg => {
    return (! msg.chat.equals(chatId))
  })
 await foundUser.save()
  
  const userNotification = await User.findById(req.user._id).populate({
    path: "notif",
    populate: { path: "chat" },
  });
  res.send(userNotification);
})

const getNotification=asyncHandler(async (req, res) => {
  const userNotification = await User.findById(req.user._id).populate({
    path: "notif",
    populate: { path: "chat" },
  });
  res.send(userNotification);
})

const updateUser = asyncHandler(async (req, res) => {
  const {id, name, email, pic } = req.body;

 

  const user = await User.findByIdAndUpdate(id,{ name, email, pic },{new:true});
  const token = await user.generateToken();
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token,
    });
  }
})



module.exports = { registerUser, authUser,allUser,getCurrentUser,updateUser,addNotification,removeNotification,getNotification,addNotificationForOffline };


// const sampleUsers = ["uday", "rishi", "virendra", "rishabh", "aru", "rinku", "Nikki"]
// const pics = ["https://th.bing.com/th?id=OIP.f_Xrz6UpSCTJ97XuIX7XtgHaJQ&w=223&h=279&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2", "https://th.bing.com/th?id=OIP.JxyGHWbgPXgjta3k4PznxwHaLH&w=204&h=306&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2", "https://th.bing.com/th?id=OIP.XwQl1fgL8Sj_byE6Ca2xNQHaJQ&w=223&h=279&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2", "https://th.bing.com/th?id=OIP.vgT-xN93AGkhrGpIEaz-sgHaJG&w=225&h=277&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2","https://th.bing.com/th?id=OIP.vgT-xN93AGkhrGpIEaz-sgHaJG&w=225&h=277&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2","https://th.bing.com/th?id=OIP.wFG-L3CZNHC8BQ7y6vIeSQAAAA&w=216&h=288&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2","https://th.bing.com/th?id=OIP.AlYuxFaE03YtiMaILu6_0gHaKc&w=210&h=296&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2","https://th.bing.com/th?id=OIP.-OIIGeCPsoFGAL55xy1I6wHaIx&w=229&h=272&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2"];

// async function createUsers(arr,pics) {
//     arr.forEach(async(u,ind) => {
//         await User.create({ name:u, email:`${u}@gmail.com`, password:"uday",pic:pics[ind] })
//     })
// }
// createUsers(sampleUsers,pics)