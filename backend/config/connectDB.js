import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const DB_connect = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => 
        {
            console.log("DB connected");
        }
    )
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
};

export default DB_connect;