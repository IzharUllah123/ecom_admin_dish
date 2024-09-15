const mongoose=require("mongoose");
require('dotenv').config()
// First Connect mongoose 
mongoose.connect(process.env.MONGO_URL);