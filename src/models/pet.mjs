import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  age: { type: Number, required: true },
  happiness_level: { type: Number },
  hunger_level: { type: Number },
  cleanliness: { type: Number },
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
