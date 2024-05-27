const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken')

const userSchema =new  mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    notif:[{ type: mongoose.Schema.Types.ObjectId, ref: "Message", }]
  },
  { timestaps: true }
);

userSchema.methods.generateToken = function(){
  const token =  jwt.sign({
      
      id:this._id,
  }, 'jwtsecret', { expiresIn: '5d' })
  return token;
}

userSchema.methods.matchPassword = async function (enteredPassword) {
  // console.log(enteredPassword, this.password);
  
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
 


  if (!this.isModified('password')) {
  return  next();
  }

  // const salt = await bcrypt.genSalt(10);
  console.log("password rehashing");
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);

