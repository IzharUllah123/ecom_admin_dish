const mongoose=require("mongoose");

// Define Schema
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

  // define Model
module.exports=mongoose.model('users',userSchema);
