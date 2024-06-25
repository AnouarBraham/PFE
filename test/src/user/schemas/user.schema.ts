import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";



export enum UserRole {
  User = 'user',
  Admin = 'admin',
}


@Schema({
    timestamps:true
})
export class user{

    @Prop()
    email:string;

    @Prop()
    password:string;

    @Prop()
    first_name:string;

    @Prop()
    last_name:string;

    @Prop()
    department:string

    @Prop()
    profilePicture: string; // Add field for profile picture
    _id: any;




  @Prop({ type: String, default: UserRole.User }) // Default role is User
  role: UserRole; // Add role field to the schema


  @Prop({ default: true }) // Default value for notificationsEnabled is true
    notificationsEnabled: boolean;

  @Prop({
    type: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: Date
    }]
})
notifications: {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
}[];







}

export const userSchema=SchemaFactory.createForClass(user)