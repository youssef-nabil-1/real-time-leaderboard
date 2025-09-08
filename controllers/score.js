import Score from "../models/score.js";
import { getIO } from "../socket.js";
import {
    updateScore,
    updateDailyScore,
    updateGlobalScore,
} from "../redisClient.js";

export const createScore = async (req, res, next) => {
    const { gameId, score: scoreValue } = req.body;
    const userId = req.userId;
    try {
        const score = new Score({
            gameId,
            score: scoreValue,
            user: userId,
        });
        const result = await score.save();

        await Promise.all([
            updateScore(`leaderboard:game:${gameId}`, scoreValue, userId),
            updateDailyScore(gameId, scoreValue, userId),
            Score.aggregate([
                { $match: { user: userId } },
                { $group: { _id: null, total: { $sum: "$score" } } },
            ]).then(([{ total }]) => updateGlobalScore(userId, total)),
        ]);

        const io = getIO();
        io.emit("newScore", {
            score: result,
            gameId,
            userId,
        });

        res.status(201).json({ message: "Score added", score: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
