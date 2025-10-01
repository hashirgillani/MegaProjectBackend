import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connect_db = async ()=>{
    try {
        const db_connection_instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB connected successfully !! DB Host: ${db_connection_instance.connection.host}`)
    } catch (error) {
        console.log("MONOGODB connection Failed",error)
        throw error
        process.exit(1)
    }
}

export default connect_db