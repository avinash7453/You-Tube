import express from "express";
import { uploadVideo, getVideos } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("video"), uploadVideo);
routes.get("/getall", getVideos);

export default routes;