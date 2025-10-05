import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(
      `MongoDB connected: ${connectionInstance.connection.host} / DB: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
