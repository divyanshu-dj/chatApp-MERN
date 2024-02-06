import jwt from "jsonwebtoken"
import User from "../models/user.js"

const authMiddleware = async (req, res, next) => {
    try {
        const authCookie = req.cookies.authorization;

        if( !authCookie || !authCookie.startsWith('Bearer ') ) return res.status(401).json({message: "Invalid auth token - LOGIN AGAIN BITCH"});

        const token = authCookie.split(' ')[1];

        if( !token ) return res.status(401).json({message: "Kindly login again - token not provided"})

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if( !decoded ) return res.status(401).json({message: "Kindly Login Again - unauthorised token"})

        const user = await User.findById(decoded.userId).select("-password");

        if( !user ) return res.status(401).json({message: "User Not Found"});

        req.user = user;

        next();
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error while auth"})
    }
};

export default authMiddleware;