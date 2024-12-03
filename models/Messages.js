const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    reciever:{
         type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    text:{
        type:String,
        required:true
    },
   

},{timestamps:true})
messageSchema.add({
    file:[],
})

module.exports = mongoose.model('message',messageSchema );

