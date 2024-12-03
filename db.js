const mongoose = require('mongoose');
require('dotenv').config()

const connectToDb = ()=>{
    // mongoose.connect('mongodb://127.0.0.1:27017/socialPost')
    mongoose.connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@socialtweetapp.vtcxv.mongodb.net/?retryWrites=true&w=majority&appName=SocialTweetApp`)
    .then(() => console.log('mongodb connected successfully'))
    .catch(()=>console.log('error in connecting mongodb'))
}

module.exports = connectToDb