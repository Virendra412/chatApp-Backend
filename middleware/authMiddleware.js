const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  // console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "jwtsecret");
      // console.log(decoded);
        req.user = await User.findById(decoded.id).select("-password");
        // console.log("protect middleware working");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized token failed");
    }
    }
    if (!token) {
        res.status(401);
        throw new Error("Token Not found");
    }
 
});

module.exports = { protect };
