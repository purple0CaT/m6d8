import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, required: true },
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    content: { type: String, required: true },
    comments: [
      {
        name: { type: String },
        comment: { type: String },
        createdAt: Date,
      },
    ],
  },
  { timestamps: true }
);
export default model("Posts", postSchema); // bounded to the "users" collection! if coll false its create automaticly
