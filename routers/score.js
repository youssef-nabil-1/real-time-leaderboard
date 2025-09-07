import express from "express";
import * as scoreController from "../controllers/score.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/create", isAuth, scoreController.createScore);

export default router;
