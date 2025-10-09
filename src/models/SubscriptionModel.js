import mongoose from "mongoose";
const SubscriptionScheme = new mongoose.Schema(
    {
        subscriber:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"

        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
)
export const SubscriptionModel = mongoose.model("SubscriptionModel",SubscriptionScheme)