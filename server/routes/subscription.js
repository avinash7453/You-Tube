import express from "express";
import { createOrder, getPlans, verifyPayment } from "../controllers/subscription.js";

const routes = express.Router();
routes.get("/plans", getPlans);
routes.post("/order", createOrder);
routes.post("/verify", verifyPayment);
export default routes;
