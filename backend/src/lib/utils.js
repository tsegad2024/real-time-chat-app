// generate token here
import jwt from 'jsonwebtoken';

export const generateToken = async (userId, res) => {
    try {
        const token = jwt.sign({userId}, process.env.JWT_SECRET,  {
            expiresIn: '1hr'
        })

        console.log("check 3")
        res.cookie("jwt", token, {
            maxAge: 1*60*60,
            httpOnly: true, 
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== "development"? true: false
        })
        console.log("check 4")
        return token;
    } catch (error) {
        return res.status(400).json({message: "Error while generating token"})
    }
}