import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) =>{
    // res.send("signup route");
    const {fullName, email,  password } = req.body;
    
    try {
        // Check the required field 
        if (!email || !fullName || ! password){
            return res.status(400).json({message: "All fields are required"})
        }
        // check password requirement
        if (password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"})
        }
        // Search the existance of email
        const user = await User.findOne({email})
        if (user) return res.status(400).json({message: "Email already exists"})
        // hashing password
    console.log("inside controller 2")
        const salt = await bcrypt.genSalt(10)
        console.log("inside controller 3")
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log("inside controller 1")
        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword
        })
        console.log("check 1")

        if (newUser) {
            // generate jwt token
            await newUser.save();
            console.log("check 2")
            generateToken(newUser._id, res)
            res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                ProfilePic: newUser.ProfilePic
            })
        } else {
            res.status(400).json({message: "Invalid user data"})
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "internal Server Error"})
    }
    
    // save the user
    // direct login
}

export const login = async (req, res) =>{
    try {
            // check fields
        const {email, password} = req.body
        if (!email || !password) return res.status(400).json({message: "Email and password is required"})
        
            //search email
        const user = await User.findOne({email})
        if (!user) return res.status(400).json({message: "Invalid Credentials"})

            //compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials"})
        console.log("Debug control 1")
        
            //generate token 
        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log("Error in controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const logout = (req, res) =>{
    //clear cookie
    try {
        res.cookie('jwt', "", {maxAge: 0})
        res.status(200).json({message: "Logged out succesfully"})
    } catch (error) {
        console.log("Logout Error: ", error)
        res.status(500).json({message: "Internal server"})
    }
}

export const updateProfile = async(req, res) => {
    try {
        const userId = req.user._id;

        const {profilePic} = req.body;
        if (!profilePic) return res.status(400).json({message: "Profile Picture is Required"});

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        
        const updateduser = await User.findByIdAndUpdate(
            userId, {
                profilePic: uploadResponse.secure_url
            }, {new: true}
        )
        res.status(200).json(updateduser)
    } catch (error) {
        console.log("Error in update profile: ", error)
        res.status(500).json({message: "Internal server error"})
    }
}