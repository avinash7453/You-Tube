import express from "express";
import { createParty, getParty, heartbeat, joinParty, postMessage, updateParty } from "../controllers/watchparty.js";

const routes = express.Router();
routes.post("/", createParty);
routes.post("/:roomId/join", joinParty);
routes.get("/:roomId", getParty);
routes.patch("/:roomId/state", updateParty);
routes.post("/:roomId/heartbeat", heartbeat);
routes.post("/:roomId/messages", postMessage);
export default routes;
