import express from "express";
import { handlelike, getAllLikedVideo } from "../controllers/like.js";

const routes = express.Router();

routes.get("/:userId", getAllLikedVideo);
routes.post("/:videoId", handlelike);

export default routes;