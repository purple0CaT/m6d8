import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userShecma = new Schema(
  {
    nickName: { type: String, required: true },
    fullName: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Users", userShecma);
