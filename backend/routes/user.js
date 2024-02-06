import express  from "express";
import authMiddleware from "../middleware/authMiddelware.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/",authMiddleware ,async (req, res) => {
    try {
        const currentUser = req.user._id;
        
        const filteredUsers = await User.find({ _id : {$ne: currentUser} }).select("-password");
        console.log(filteredUsers)
    
        res.status(200).json(filteredUsers);
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
});

export default router;