import express from "express";
import { getDownloads, requestDownload } from "../controllers/download.js";

const routes = express.Router();

routes.get("/:userId", getDownloads);
routes.post("/:videoId", requestDownload);

export default routes;
