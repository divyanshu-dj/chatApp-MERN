import express from "express"
import authRouter from "./auth.js"
import messagesRouter from "./messages.js"
import userRouter from "./user.js"
const router = express.Router();


router.use("/auth", authRouter);
router.use("/messages", messagesRouter);
router.use("/user", userRouter)

export default router;

