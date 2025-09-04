import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getUsersForSidebar = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filtedUsers = await User.find({_id: {$ne: loggedInUserId}}).select('-password')
        
        res.status(200).json(filtedUsers)
    } catch (error) {
        console.log("Error in getUserForSidebar", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const getMessages = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const {id:userToChatId} = req.params;

        const filterdMessages = await Message.find(
            {
                $or: [
                    {senderId: loggedInUserId, receiverId: userToChatId},
                    {senderId: userToChatId, receiverId: loggedInUserId}
                ]
            }
        );

        res.status(200).json(filterdMessages);
    } catch (error) {
        console.log("Error in getMessage", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const senderId = req.user._id;
        const {id: receiverId} = req.params;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        await newMessage.save();

        // REAL TIME FUNCTIONALITY HERE => socket.io
        
    } catch (error) {
        console.log("Error in sendMessage", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}