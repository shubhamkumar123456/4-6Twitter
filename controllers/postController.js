
// const PostCollection = require('../models/PostCollection');
let postCollection = require('../models/PostCollection')

const createPost = async(req, res)=>{
    const {title,description , file} = req.body;
    let id = req.user._id


   try {
    let post = await postCollection.create({
        title,
        description,
        file,
        userId:id
    })
    res.json({msg:"post created successfully",success:true,post})
   } catch (error) {
        res.json({msg:"error in creating post",success:false,error:error.message})
   }



    // res.send(req.user._id)
}
const getAllPost = async(req, res)=>{
    // res.send("get all post running good")
    try {
        // .populate({ 
        //     path: 'pages',
        //     populate: {
        //       path: 'components',
        //       model: 'Component'
        //     } 
        //  })
        let post = await postCollection.find().populate({path:'userId',select:['name','profilePic']}).populate({path:'comments',populate:{path:'user',select:['name','profilePic']}}).sort({ createdAt: -1 });
    res.json({msg:"fetched successfully", success:true,post})
    } catch (error) {
        res.json({msg:"error in creating post",success:false,error:error.message})   
    }
}
const updatePost = async(req, res)=>{
    res.send("update post running good")
    
}
const deletePost = async(req, res)=>{
    res.send("delete post running good")
} 

const getUserPost= async(req,res)=>{
    let {userId} = req.params;
    try {
        let posts = await postCollection.find({userId});
        res.json({msg:"post fetched successfully", success:true, posts})
    } catch (error) {
        res.json({msg:"error in getting posts", success:false,error:error.message})
    }
}


const likePost = async(req,res)=>{
    const {postId}  = req.params;
    let userId = req.user._id 

    console.log("userId = ", userId)
    console.log("postId = ", postId)
    
  try {
    let post = await postCollection.findById(postId)
    if(post.likes.includes(userId)){
        console.log("mil gyi")
        post.likes.pull(userId)
        await post.save();
        return res.json({msg:"post disiked successfully",success:true})
    }
    else{
        post.likes.push(userId)
        await post.save();
        return res.json({msg:"post liked successfully",success:true})
    }
  } catch (error) {
    return res.json({msg:"error in like post ", success:false, error:error.message})
  }

   

}


const commentPost = async(req,res)=>{
    const {postId} = req.params;
    const userId = req.user._id;
    const {text} =  req.body;
    try {
       
    let post = await postCollection.findById(postId);

    post.comments.push({user:userId, text:text});
    await post.save();

    res.json({msg:"post commented successfully",success:true}); 
    } catch (error) {
        return res.json({msg:"error in like post ", success:false, error:error.message})
    }



}

module.exports ={
    createPost,
    getAllPost,
    updatePost,
    deletePost,
    getUserPost,
    likePost,
    commentPost
}