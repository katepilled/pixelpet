import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
	name: { type: String, required: true, default: 'your pet' },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	type: { type: String },
	age: { type: Number, required: true, default: 0 }, // age in days
	happiness_level: { type: Number, default: 50, max: 100 },
	hunger_level: { type: Number, default: 50, max: 100 },
	cleanliness: { type: Number, default: 50, max: 100 },
});

const Pet = mongoose.model('Pet', PetSchema);

export default Pet;
