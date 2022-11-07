import mongoose from "mongoose";
import env from "@utils/env";
import {UserRole} from "@utils/enum";

const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

await mongoose.connect(env.MONGO_DB_URL, options);
console.log('connected to MongoDB');
