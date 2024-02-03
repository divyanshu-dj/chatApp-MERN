import mongoose from "mongoose"

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.log("Failed connecting to MongoDB", error.message)
    }
}

export default connect;