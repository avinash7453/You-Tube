import express from "express";
import { 
    deletecomment, 
    getallcomment, 
    postcomment, 
    editcomment,
    reactToComment,
    reportComment,
    translateComment
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.post("/:id/reaction", reactToComment);
routes.post("/:id/report", reportComment);
routes.post("/translate", translateComment);

export default routes;