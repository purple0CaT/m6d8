import mongoose from "mongoose";
const { Schema, model } = mongoose;

const authorShecma = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, required: false, default: "none" },
  },
  { timestamps: true }
);

export default model("Authors", authorShecma);
