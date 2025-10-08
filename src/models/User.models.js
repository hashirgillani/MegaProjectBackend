import mongoose from "mongoose";
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken";
const UserSchema = mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
        },
        avatar:{
            type:String,
            required:true,
            
        },
        coverImage:{
            type:String,
            
            
        },
          password:{
            type:String,
            required:[true,"Password is required"],
           
        },
          refreshToken:{
            type:String,
           
        },
        watchHistory:[
                {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Video"
                }
        ]

        
    }
    ,{timestamps:true}
)

UserSchema.pre("save", async function(next){
    if (this.isModified("password")) {
        this.password =  await bcrypt.hash(this.password,10)
        next()
    }
    else{
        return next()
    }
})
UserSchema.methods.isPasswordCorrect= async function(user_password){
    return await bcrypt.compare(user_password,this.password)
}
UserSchema.methods.AccessTokenGenerated = function (){
       return JWT.sign(
            {
                _id:this._id,
                email:this.email,
                username:this.username,
                fullName:this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRE
            }
        )
}
UserSchema.methods.RefreshTokenGenerated = function (){
       return JWT.sign(
            {
                _id:this._id,
               
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRE
            }
        )
}
export const User = mongoose.model("User",UserSchema) 