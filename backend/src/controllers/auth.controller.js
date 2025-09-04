import bcrypt from "bcryptjs"

import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) =>{
    const {fullName, email,  password } = req.body;
    
    try {
        if (!email || !fullName || ! password){
            return res.status(400).json({message: "All fields are required"})
        }
        if (password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"})
        }
        
        const user = await User.findOne({email})
        if (user) return res.status(400).json({message: "Email already exists"})
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            await newUser.save();

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
}

export const login = async (req, res) =>{
    try {
        const {email, password} = req.body
        if (!email || !password) return res.status(400).json({message: "Email and password is required"})
        
        const user = await User.findOne({email})
        if (!user) return res.status(400).json({message: "Invalid Credentials"})

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials"})
        console.log("Debug control 1")
        
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

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}