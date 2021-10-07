import express from "express";
import createHttpError from "http-errors";
import UserModel from "./schema.js";
import q2m from "query-to-mongo";

const user = express.Router();

user
  .route("/")
  // == GET
  .get(async (req, res, next) => {
    try {
      const querys = q2m(req.query);
      const total = await UserModel.countDocuments();
      // querys.criteria.search && {
      //   firstName: { $regex: querys.criteria.search },
      // }
      const users = await UserModel.find(
        {},
        // querys.criteria.search && {
        //   firstName: { $regex: querys.criteria.search },
        // },
        { __v: 0 }
      )
        .sort(req.query.sort && { category: req.query.sort })
        .limit(querys.options.limit || 5)
        .skip((querys.options.skip && querys.options.skip) || 0);

      res.send([{ links: querys.links("/users", total) }, users]);
    } catch (error) {
      next(createHttpError(404, { message: error.errors }));
    }
  })
  // == POST
  .post(async (req, res, next) => {
    try {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send(_id);
    } catch (error) {
      next(createHttpError(400, { message: error.errors }));
    }
  });

user
  .route("/:userId")
  .get(async (req, res, next) => {
    try {
      const users = await UserModel.findById(req.params.userId, {
        __v: 0,
      });
      res.send(users);
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  })
  .put(async (req, res, next) => {
    try {
      const modUser = await UserModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true } // reurns modif user
      );
      console.log(modUser);
      res.send(modUser);
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  })
  .delete(async (req, res, next) => {
    try {
      const delUser = await UserModel.findByIdAndDelete(req.params.userId);
      if (delUser) {
        res.status(200).send("Deleted!");
      } else {
        next(createHttpError(500));
      }
    } catch (error) {
      next(createHttpError(404, { message: "Author not found!" }));
    }
  });

export default user;
