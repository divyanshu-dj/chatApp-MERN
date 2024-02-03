import express from "express"
import zod from "zod"
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

        if (!success) {
            return res.status(400).json({ message: "Invalid Inputs", errors: data.errors });
        }

        const { firstName, lastName, username, password, gender } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "Email Already Taken" });
        }

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${req.body.username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${req.body.username}`;
        console.log(username)
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            password,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic: newUser.profilePic,
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/signin", (req, res) => {
    res.send("signin");
});

router.post("/logout", (req, res) => {
    // Your logout logic here
});

export default router;
