import express from "express";
import * as gameController from "../controllers/game.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/", gameController.getGames);
router.get("/:id", gameController.getGameById);
router.post("/", isAuth, gameController.createGame);

export default router;
