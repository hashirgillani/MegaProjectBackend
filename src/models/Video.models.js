import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = mongoose.Schema(
    {
        vidoFile:{
            type:String,//URl from cloud service
            require:true
        },
        thumbnail:{
            type:String,//URl from cloud service
            require:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
           
        },
        title:{
            type:String,
            require:true
        },
        descripton:{
            type:String,
            require:true
        },
        duration:{
            type:Number,
            require:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },



    },{timestamps:true}
)
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",VideoSchema)