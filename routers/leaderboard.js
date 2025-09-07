import express from "express";
import * as leaderboardController from "../controllers/leaderboard.js";

const router = express.Router();

router.get("/global", leaderboardController.getGlobalLeaderboard);
router.get("/game/:gameId", leaderboardController.getGameLeaderboard);
router.get("/game/:gameId/daily", leaderboardController.getDailyLeaderboard);
router.get("/user/rank", leaderboardController.getUserRanking);
router.get("/game/:gameId/user/rank", leaderboardController.getUserGameRank);

export default router;
