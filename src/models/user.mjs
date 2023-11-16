import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

export default User;
