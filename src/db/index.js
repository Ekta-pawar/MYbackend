import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
//connect db
const connectDB = async () => {
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`${connectionInstance.connection.host}:${connectionInstance.connection.port}`,"Connected to MongoDB");
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
export default connectDB;