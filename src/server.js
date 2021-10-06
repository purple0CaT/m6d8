import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import cors from "cors";
import post from "./services/posts/posts.js";
import { regError, generError } from "./errorHandler.js";
//=
const server = express();
const port = process.env.PORT;

// = BASIC
server.use(cors());
server.use(express.json());
//=ROUTES

server.use("/blogPosts", post);
//= ERRORS
server.use(regError);
server.use(generError);
// = MONGO
mongoose.connect(`${process.env.MONGOOSEDB}`);
mongoose.connection.on("connected", () => {
  //=
  server.listen(port, () => {
    console.log("Runs 🚀 - ", port);
  });
  console.table(listEndpoints(server));
});
mongoose.connection.on("error", () => {
  console.log("Some ❌ error!");
});
