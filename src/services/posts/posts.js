import express from "express";
import createHttpError from "http-errors";
import PostModel from "./schema.js";
import q2m from "query-to-mongo";

const post = express.Router();

post
  .route("/")
  // == GET
  .get(async (req, res, next) => {
    try {
      const querys = q2m(req.query);
      const totalPost = await PostModel.countDocuments(
        querys.criteria.search && {
          title: { $regex: querys.criteria.search },
        }
      );
      const posts = await PostModel.find(
        querys.criteria.search && {
          title: { $regex: querys.criteria.search },
        },
        { __v: 0 }
      )
        .sort(req.query.sort && { category: req.query.sort })
        .limit(querys.options.limit || 5)
        .skip((querys.options.skip && querys.options.skip) || 0)
        .populate({ path: "author", select: "firstName lastName avatar" });

      res.send([{ links: querys.links("/blogPosts", totalPost) }, posts]);
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
      const posts = await PostModel.findById(req.params.postId, {
        __v: 0,
      })
        .populate({ path: "author", select: "firstName lastName avatar" })
        .populate({ path: "likes", select: "nickName fullName" });
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

// =========== COMMMENTS
post
  .route("/:postId/comments")
  .get(async (req, res, next) => {
    try {
      const post = await PostModel.findById(req.params.postId);
      if (post) {
        res.status(201).send(post.comments);
      } else {
        next(createHttpError(404, { message: "No such post!" }));
      }
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  })
  .post(async (req, res, next) => {
    try {
      const newComment = { ...req.body, createdAt: new Date() };

      const updatedPosts = await PostModel.findByIdAndUpdate(
        req.params.postId,
        {
          $push: { comments: newComment },
        },
        { new: true }
      );
      if (updatedPosts) {
        res.status(201).send(updatedPosts);
      } else {
        next(createHttpError(400, { message: "No such id!" }));
      }
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  });
post
  .route("/:postId/comments/:commId")
  .get(async (req, res, next) => {
    try {
      const post = await PostModel.findById(req.params.postId);
      if (post) {
        const comment = await post.comments.find(
          (com) => com._id.toString() === req.params.commId
        );
        res.status(201).send(comment);
      } else {
        next(createHttpError(404, { message: "No such post!" }));
      }
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  })
  .delete(async (req, res, next) => {
    try {
      const post = await PostModel.findByIdAndUpdate(
        req.params.postId,
        {
          $pull: { comments: { _id: req.params.commId } },
        },
        { new: true }
      );
      if (post) {
        res.status(201).send(post.comments);
      } else {
        next(createHttpError(404, { message: "No such post!" }));
      }
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  })
  .put(async (req, res, next) => {
    try {
      // const post = await PostModel.findOneAndUpdate(
      //   {
      //     _id: req.params.postId,
      //     "comments._id": req.params.commId,
      //   },
      //   {
      //     "comments.$": { ...comments.$, ...req.body },
      //   },
      //   {
      //     new: true,
      //   }
      // );
      const post = await PostModel.findById(req.params.postId);
      if (post) {
        const indx = await post.comments.findIndex(
          (c) => c._id.toString() === req.params.commId
        );
        if (indx !== -1) {
          post.comments[indx] = {
            ...post.comments[indx].toObject(),
            ...req.body,
          };
          await post.save();
          res.status(201).send(post);
        } else {
          next(createHttpError(404, { message: "No such comment!" }));
        }
      } else {
        next(createHttpError(404, { message: "No such post!" }));
      }
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  });

// =========== Likes
post.route("/likes/:postId").post(async (req, res, next) => {
  const posts = await PostModel.findById(req.params.postId);
  if (posts) {
    const index = await posts.likes.findIndex(
      (p) => p._id.toString() === req.body.userId
    );
    if (index !== -1) {
      posts.likes.splice(index, 1);
      await posts.save();
      res.send(posts);
    } else {
      posts.likes.push(req.body.userId);
      await posts.save();
      res.send(posts);
    }
  } else {
    res
      .status(404)
      .send({ message: `No such post, with id: ${req.params.postId}` });
  }
});

export default post;
