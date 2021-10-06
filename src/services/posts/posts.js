import express from "express";
import createHttpError from "http-errors";
import PostModel from "../../db/schemas.js";

const post = express.Router();

post
  .route("/")
  // == GET
  .get(async (req, res, next) => {
    try {
      const posts = await PostModel.find(
        req.query.search && {
          title: { $regex: req.query.search },
        },
        { __v: 0 }
      )
        .sort(req.query.category && { category: req.query.category })
        .limit(5)
        .skip(req.query.page ? req.query.page * 5 : 0);
      res.send(posts);
    } catch (error) {
      next(createHttpError(404, { message: error.errors }));
    }
  })
  // == POST
  .post(async (req, res, next) => {
    try {
      const newPost = new PostModel(req.body);
      const { _id } = await newPost.save();
      res.status(201).send(_id);
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  });

post
  .route("/:postId")
  .get(async (req, res, next) => {
    try {
      const posts = await PostModel.findById(req.params.postId, { __v: 0 });
      res.send(posts);
    } catch (error) {
      next(createHttpError(404, { message: "User not found!" }));
    }
  })
  .put(async (req, res, next) => {
    try {
      const modifPost = await PostModel.findByIdAndUpdate(
        req.params.postId,
        req.body,
        { new: true } // reurns modif user
      );
      res.send(modifPost);
    } catch (error) {
      next(createHttpError(404, { message: "User not found!" }));
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedPost = await PostModel.findByIdAndDelete(req.params.postId);
      if (deletedPost) {
        res.status(200).send("Deleted!");
      } else {
        next(createHttpError(500));
      }
    } catch (error) {
      next(createHttpError(404, { message: "User not found!" }));
    }
  });

export default post;
