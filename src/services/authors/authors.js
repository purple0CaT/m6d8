import express from "express";
import createHttpError from "http-errors";
import AuthorModel from "./schema.js";
import q2m from "query-to-mongo";

const author = express.Router();

author
  .route("/")
  // == GET
  .get(async (req, res, next) => {
    try {
      const querys = q2m(req.query);
      const totalPost = await AuthorModel.countDocuments();
      // querys.criteria.search && {
      //   firstName: { $regex: querys.criteria.search },
      // }
      const posts = await AuthorModel.find(
        {},
        // querys.criteria.search && {
        //   firstName: { $regex: querys.criteria.search },
        // },
        { __v: 0 }
      )
        .sort(req.query.sort && { category: req.query.sort })
        .limit(querys.options.limit || 5)
        .skip((querys.options.skip && querys.options.skip) || 0);

      res.send([{ links: querys.links("/authors", totalPost) }, posts]);
    } catch (error) {
      next(createHttpError(404, { message: error.errors }));
    }
  })
  // == POST
  .post(async (req, res, next) => {
    try {
      const newAuthor = new AuthorModel(req.body);
      const { _id } = await newAuthor.save();
      res.status(201).send(_id);
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  });

author
  .route("/:authorId")
  .get(async (req, res, next) => {
    try {
      const authors = await AuthorModel.findById(req.params.authorId, {
        __v: 0,
      });
      res.send(authors);
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  })
  .put(async (req, res, next) => {
    try {
      const modifAuthor = await AuthorModel.findByIdAndUpdate(
        req.params.authorId,
        req.body,
        { new: true } // reurns modif user
      );
      res.send(modifAuthor);
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedAuthor = await AuthorModel.findByIdAndDelete(
        req.params.authorId
      );
      if (deletedAuthor) {
        res.status(200).send("Deleted!");
      } else {
        next(createHttpError(500));
      }
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  });

export default author;
