const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    title:{
        type:String
    },
    description:{
        type:String,
    },
    file:[],
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'users'
    }
},{timestamps:true})

postSchema.add({
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
    ],
    comments:[
     {
       user: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        },
       text: {
        type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
        // replies:[
        //     {
        //         user: {
        //             type:mongoose.Schema.Types.ObjectId,
        //             ref:"users"
        //         },
        //        text: {
        //         type:String
        //         },

        //     }
        // ]

     }
    ]
})

module.exports = mongoose.model('posts',postSchema)