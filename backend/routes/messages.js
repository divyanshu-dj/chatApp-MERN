import express from "express";
import authMiddelware from "../middleware/authMiddelware.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

const router = express.Router();

router.post("/send/:id", authMiddelware, async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conservation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conservation) {
            conservation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
        });
        console.log(newMessage);

        if (newMessage) conservation.messages.push(newMessage._id);

        await conservation.save();
        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id", authMiddelware, async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const conservation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate("messages");

        if (!conservation)
            return res
                .status(401)
                .json([]);

        res.status(200).json(conservation.messages);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
