import express from "express"
import zod from "zod"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.js";

const router = express.Router();


///////////////////  SIGNUP  ///////////////////////

const SignupSchema = zod.object({
    firstName: zod.string(),
    lastName: zod.string(),
    username: zod.string().email({ message: "Invalid email address" }),
    password: zod.string().min(6, { message: "Given password is too small" }),
});

router.post("/signup", async (req, res) => {
    try {
        if (!req.body.confirmPassword || req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match" });
        }
        
        const { success, data } = SignupSchema.safeParse(req.body);

        if (!success) return res.status(400).json({ message: "Invalid Inputs", errors: data.errors });

        const { firstName, lastName, username, password, gender } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) return res.status(400).json({ message: "Email Already Taken" });

        // Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            password: hashedPassword,
            gender,
            profilePic: gender == "male" ? boyProfilePic : girlProfilePic,
        });

        // JSON WEB TOKENS
        const userId = newUser._id;

        const token = jwt.sign({userId}, process.env.JWT_SECRET, {
            expiresIn: '20d'
        });

        res.cookie("authorization", `Bearer ${token}`, {
            maxAge: 20*24*60*60*1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.MODE !== "development"   //this makes it so if we are in dev mode the site is not secure and we can use it in local host but if it is in prod it will be secure  
        });
        ///////////////

        res.status(201).json({
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            profilePic: newUser.profilePic,
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


///////////////////  SIGNIN  ///////////////////////
const SigninSchema = zod.object({
    username: zod.string().email({message: "Invalid Email"}),
    password: zod.string()
})
router.post("/signin", async (req, res) => {
    try {
        const { success } = SigninSchema.safeParse(req.body);

        if( !success ) return res.json({message: "Invalid Input"});

        const { username, password } = req.body;

        const user = await User.findOne({username});
        if( !user ) return res.json({message: "Email not found....SIGNUP!!"})

        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if( isPasswordCorrect ){
            const userId = user._id;

            const token = jwt.sign({userId}, process.env.JWT_SECRET, {
                expiresIn: '20d'
            });
    
            res.cookie("authorization", `Bearer ${token}`, {
                maxAge: 20*24*60*60*1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.MODE !== "development"   //this makes it so if we are in dev mode the site is not secure and we can use it in local host but if it is in prod it will be secure  
            });

            res.status(200).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePic: user.profilePic,
            })
        } else {
            return res.json({message: "Invalid credentials"});
        }

    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({
        message: "Internal server error"
        });
    }
});



////////////////////  LOGOUT  //////////////////////////
router.post("/logout", (req, res) => {
    try {
        res.clearCookie("authorization");
        res.status(200).json({message: "Logged out successfully"})
        res.end();
        
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({
        message: "Internal server error"
        });
    }
});

export default router;
