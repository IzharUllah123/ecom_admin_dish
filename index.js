const express=require('express');
const cors=require("cors");
const app=express();
const User=require('./db/User');
const Product=require('./db/Product');
const path=require("path");
require('./db/config');
const Jwt=require('jsonwebtoken');
const jwtKey='e-comm'

// Control data that we send from postman etc
app.use(express.json());
app.use(cors());

app.post('/register',async(req,resp)=>{
let user=new User(req.body)
let result=await user.save()

 result=result.toObject()
 delete result.password

// resp.send(result)

Jwt.sign({user},jwtKey,(err,token)=>{
  if (err){
    resp.send({result:"Something Went wrong"})
  }
  resp.send({user, auth:token})
})


  });


  app.post('/login',async(req,resp)=>{
    
if(req.body.password && req.body.email){
  const user=await User.findOne(req.body).select("-password");
  if(user){
    
    Jwt.sign({user},jwtKey,(err,token)=>{
      if (err){
        resp.send("Something Went wrong")
      }
      resp.send({user, auth:token})
    })
    

  }else{
    resp.send({ result:"No user Found"})
   
  }
 
} else{
  resp.send({ result:"No user Found"})
  
}  
  });



app.post('/addProduct',verifyToken,async(req,resp)=>{
  const product=new Product(req.body)
  let result=await product.save();
resp.send(result)
});


app.get('/productlist',verifyToken,async(req,resp)=>{
  let products=await Product.find();
  if (products.length>0){
    resp.send(products)
  }else{
    resp.send("No result found")
  }

});

app.delete("/productDlt/:id",verifyToken,async(req,resp)=>{

  let products= await Product.deleteOne({_id:req.params.id})

  resp.send(products)

});


app.get("/product/:id",verifyToken,async(req,resp)=>{
  let result=await Product.findOne({_id:req.params.id})
  if (result){
    resp.send(result)
  }else{
    resp.send("Record Not Found")
  }
});

app.put("/product/:id",verifyToken,async(req,resp)=>{
let result=await Product.updateOne({_id:req.params.id},
  
   { $set:   req.body   }
    
  
)
resp.send(result)

});


app.get('/search/:key',verifyToken,async(req,resp)=>{
  let result=await Product.find(
    {
      "$or":[
        {name:{$regex:req.params.key}},
        {price:{$regex:req.params.key}},
        {category:{$regex:req.params.key}},
        {company:{$regex:req.params.key}}
      ]
    });
    resp.send(result);
});



// for deploying

app.get("/",(req,res)=>{
  app.use(express.static(path.resolve(__dirname,"front-end","build")));
  res.sendFile(path.resolve(__dirname,"front-end","build","index.html"));
})

function verifyToken(req,resp,next){
  let token=req.headers['authorization'];
   if(token){
     token=token.split(' ')[1];
     Jwt.verify(token,jwtKey,(err,valid)=>{
      if(err){
        resp.send("Enter valid token");
      }else{
        next();
      }

     })

   }else{
    resp.send("Provide the Token")
   }
}


app.listen(5000);