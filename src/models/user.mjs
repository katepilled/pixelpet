import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const UserSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	password: { type: String},
	pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
});

UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', UserSchema);

export default User;
