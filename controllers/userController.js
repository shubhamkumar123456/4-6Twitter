let UserCollection = require('../models/UsersCollection')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
let JWT_SECRET = "HellBoy768"
let randomstring = require("randomstring");
const nodemailer = require("nodemailer");

const registerUser = async(req,res)=>{
    const {name,email,password,address} = req.body;
    if(!name){
        return res.json({msg:"name is required",success:false})
    }

    if(!email){
        return res.json({msg:"email is required",success:false})
    }
    if(!password){
        return res.json({msg:"password is required",success:false})
    }

    let existingUser = await UserCollection.findOne({email})
    // console.log(existingUser)
    if(existingUser){
        return res.json({msg:"user already registered",success:false})
    }
    else{
        try {

            let hashedpassword = bcrypt.hashSync(password, salt) //changing password into hashed form or encypted form
            // console.log(password)
            // console.log(hashedpassword)
            let data = await UserCollection.create({
                name,
                email,
                password:hashedpassword,
                address
            })
        
            res.json({msg:"user registered successfully",success:true,data})
           } catch (error) {
            res.json({msg:'error in creating user',success:false,error:error.message})
           }
    }
}
const loginUser = async(req,res)=>{
    const {email,password} = req.body;

   try {
    let existingUser = await UserCollection.findOne({email});


    if(existingUser){
        let comparePassword = bcrypt.compareSync( password,existingUser.password );
        if(comparePassword){
            let token = jwt.sign({ _id:existingUser._id,email:existingUser.email}, JWT_SECRET);
            res.json({msg:"user logged in successfully",success:true,token})
        }
        else{
            res.json({msg:"wrong password",success:false})
        }
    }
    else{
        return res.json({msg:"user not found ",success:false})
    }
   } catch (error) {
        res.json({msg:"error in log in user",success:false ,error:error.message})
   }


    // res.send('login function is running good')
}
const updateUser = async(req,res)=>{

   const {name,password,profilePic,coverPic,bio} = req.body;
   const userId = req.params._id

   if(password){
    var hashedPassword = bcrypt.hashSync(password,salt)
   }

   console.log(hashedPassword)

   let data = await UserCollection.findByIdAndUpdate(userId, {$set:{name,profilePic,coverPic,password:hashedPassword,bio}} ,{new:true})

   res.json({msg:"user updated successfully",success:true,user:data})

}
const deleteUser = async(req,res)=>{
   


    try {
        let paramId = req.params._id;

    let userId = req.user._id // this is get from token

    console.log("logged in userId = ", userId)
    console.log("user id you want to delete  = ", paramId)

    if(userId===paramId){
        console.log("you can delete")
        let data = await UserCollection.findByIdAndDelete(userId)
        res.json({msg:"user deleted successfully",success:true})
    }
    else{
        console.log("you can delete only your account")
        res.json({msg:"not autherized to delete this account",success:false})
    }
    } catch (error) {
        res.json({msg:"error in deleting user",success:false ,error:error.message})
    }   

}

const getUserDetails=async(req,res)=>{
    let userId = req.user._id;
    try {
        let user  = await UserCollection.findById(userId).select('-password');
    res.json({msg:"user fetched successfully", success:true,user})
    } catch (error) {
        res.json({msg:"error in getting user details",success:false ,error:error.message})
    }
}

const resetPassword = async(req,res)=>{
    const {email}= req.body;
    let user = await UserCollection.findOne({email});
    if(user){
        let reset_token = randomstring.generate(20);
        let date = Date.now();
        user.resetToken = reset_token;
        user.resetTokenValidity = date
        await user.save()
        let msgSent =await sendMail(email,reset_token)
        res.json({msg:"please check your email for password reset"})
    }
    else{
        return res.json({msg:"user not found",success:false}) 
    }
}

async function sendMail(email,reset_token){
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: "shubhamfarainzi@gmail.com",
          pass: "tyvd ibmm xerz daqc",
        },
      });

      const info = await transporter.sendMail({
        from: 'shubhamfarainzi@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Password reset request", // Subject line
        text: `Please click the link below to choose a new password: \n http://localhost:8080/users/forgetPassword/${reset_token}`
      
      });
    
      console.log("Message sent: %s", info.messageId);
}

const forgetPassword = async(req,res)=>{
    // res.send("all working")
    let resetToken = req.params.resetToken
    console.log(resetToken)
    let user = await UserCollection.findOne({resetToken:resetToken});
    let tokenDate = user.resetTokenValidity;
    let currentDate = Date.now();
    let timeDifference =   currentDate - tokenDate
    console.log(timeDifference)
    let timeInHour = timeDifference / (60*60  * 1000)
    console.log("time in hour = ", timeInHour )
    if(timeInHour > 24){
        return res.send("token expired! token is valid only for 1day")
    }
    // res.send(timeDifference)



    if(user){
       res.render('forgetPassword',{resetToken})
        // res.send("user found successfully")
    }
    else{
        res.send("token expired")
    }
}

const updatePassword = async(req,res)=>{
    let resetToken = req.params.resetToken;
    let password = req.body.updatedPassword;
    console.log("resetToken", resetToken)
    console.log("password", password)

   try {
    let user = await UserCollection.findOne({resetToken}); //{_id,name,email,profilePic,password}
    console.log("user",user)
    if(user){
        // await UserCollection.findByIdAndUpdate(user._id,{$set:password:updatedPassword})
        let hashedPassword = bcrypt.hashSync(password,salt)
        user.password = hashedPassword
        user.resetToken = null
        await user.save()
        res.json({msg:"password updated successfully",success:true})
    }
    else{
        res.json({msg:"token expired",success:false})
    }
   } catch (error) {
    res.json({msg:"error in updating password",success:false,error:error.message})
   }

   
}

const searchUser = async(req,res)=>{
    console.log(req.query)
    let {q} =  req.query;

    if(q.length>0){
        let regex  = new RegExp(q,'i');
        let users = await UserCollection.find({name:regex}).select('name profilePic');
        res.json({msg:"fetched successfully",success:true,users})
    }
    else{
        res.json({msg:"no user found",success:false})
    }
    console.log(q)

    
}

const getSingleUser = async(req,res)=>{
    let _id = req.params._id;
try {
    let user = await UserCollection.findById(_id).select('-password');
    res.json({msg:"user get successfully",success:true,user})
} catch (error) {
    res.json({msg:"error in getting user",success:false})
}
}

const followUser = async(req,res)=>{
        let userId = req.user._id;
        let {friendId} = req.params;

      try {
        let user = await UserCollection.findById(userId);
        let friend = await UserCollection.findById(friendId);


        if(!user.followings.includes(friendId)){
            user.followings.push(friendId);
            friend.followers.push(userId)
            await user .save()
            await friend.save();
            res.json({msg:"user followed successfully",success:true})
        }
        else{
            user.followings.pull(friendId);
            friend.followers.pull(userId)
            await user .save()
            await friend.save();
            res.json({msg:"user unfollowed successfully",success:true})
        }

      } catch (error) {
        res.json({msg:"error in follow user", success:false})
      }

}

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserDetails,
    resetPassword,
    forgetPassword,
    updatePassword,
    searchUser,
    getSingleUser,
    followUser
}

