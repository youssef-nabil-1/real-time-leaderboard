import express from "express";
import * as leaderboardController from "../controllers/leaderboard.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/global", leaderboardController.getGlobalLeaderboard);
router.get("/game/:gameId", leaderboardController.getGameLeaderboard);
router.get("/game/:gameId/daily", leaderboardController.getDailyLeaderboard);
router.get("/user/rank", isAuth, leaderboardController.getUserRanking);
router.get(
    "/game/:gameId/user/rank",
    isAuth,
    leaderboardController.getUserGameRank
);

export default router;
