import mongoose from "mongoose";
import logger from "../../logs/index.js";

mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            logger.info('database connect: successful');
        }).catch((err) => {
            logger.error(`database connect: unsuccessful : ${err.message}`);
        });

export default mongoose.connection;