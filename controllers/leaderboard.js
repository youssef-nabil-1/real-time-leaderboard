import Score from "../models/score.js";
import User from "../models/user.js";
import {
    getLeaderboard,
    updateScore,
    getRanking,
    getUserScore,
} from "../redisClient.js";

export const getGlobalLeaderboard = async (req, res, next) => {
    try {
        const cachedBoard = await getGlobalLeaderboard();

        if (cachedBoard) {
            const populatedBoard = await Promise.all(
                cachedBoard.map(async (entry) => {
                    const user = await User.findById(entry.user);
                    return { ...entry, user };
                })
            );
            return res.status(200).json({
                message: "Global Leaderboard fetched from cache",
                leaderboard: populatedBoard,
            });
        }

        const scores = await Score.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalScore: { $sum: "$score" },
                },
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
        ]);

        await Promise.all(
            scores.map((score) =>
                updateGlobalScore(score._id.toString(), score.totalScore)
            )
        );

        res.status(200).json({
            message: "Global Leaderboard fetched",
            leaderboard: scores,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getUserRanking = async (req, res) => {
    const userId = req.userId;

    try {
        const cachedRanking = await getGlobalUserRanking(userId);

        if (cachedRanking.rank !== null) {
            return res.status(200).json({
                message: "Global rank fetched from cache",
                rank: cachedRanking.rank,
                totalPlayers: cachedRanking.total,
                totalScore: cachedRanking.score,
            });
        }

        const userTotalScore = await Score.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalScores: { $sum: "$score" },
                },
            },
        ]);

        if (!userTotalScore.length) {
            return res
                .status(404)
                .json({ message: "No scores found for this user" });
        }

        await updateGlobalScore(userId, userTotalScore[0].totalScores);

        const updatedRanking = await getGlobalUserRanking(userId);

        res.status(200).json({
            message: "Global rank fetched",
            rank: updatedRanking.rank,
            totalPlayers: updatedRanking.total,
            totalScore: updatedRanking.score,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getUserGameRank = async (req, res) => {
    const { gameId } = req.params;
    const userId = req.userId;

    try {
        const key = `leaderboard:game:${gameId}`;

        const cachedRank = await getRanking(key);
        const cachedScore = await getUserScore(key, userId);

        if (cachedRank) {
            return res.status(200).json({
                message: "User game rank fetched",
                rank: cachedRank + 1,
                userScore: cachedScore,
            });
        }
        const userScore = await Score.findOne({ gameId, user: userId }).sort({
            score: -1,
        });

        if (!userScore) {
            return res
                .status(404)
                .json({ message: "No score found for this user" });
        }

        const rank = await Score.countDocuments({
            gameId,
            score: { $gt: userScore.score },
        });

        await updateScore(key, { score: userScore, value: userId });

        res.status(200).json({
            message: "User game rank fetched",
            rank: rank + 1,
            userScore: userScore.score,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getGameLeaderboard = async (req, res) => {
    const { gameId } = req.params;

    try {
        const cachedBoard = await getLeaderboard(gameId);

        if (cachedBoard) {
            const populatedBoard = await Promise.all(
                cachedBoard.map(async (cache) => {
                    const user = await User.findById(cache.user);
                    return { ...cache, user };
                })
            );
            return res.status(200).json({
                message: "Game Leaderboard fetched",
                leaderboard: populatedBoard,
            });
        }
        const scores = await Score.find({ gameId })
            .sort({ score: -1 })
            .populate("user")
            .limit(10);

        scores.forEach(async (score) => {
            const key = `leaderboard:game:${gameId}`;
            await updateScore(key, score.score, score.user);
        });

        res.status(200).json({
            message: "Game Leaderboard fetched",
            leaderboard: scores,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getDailyLeaderboard = async (req, res) => {
    const { gameId } = req.params;

    try {
        const cachedBoard = await getDailyLeaderboard(gameId);

        if (cachedBoard) {
            const populatedBoard = await Promise.all(
                cachedBoard.map(async (entry) => {
                    const user = await User.findById(entry.user);
                    return { ...entry, user };
                })
            );
            return res.status(200).json({
                message: "Daily leaderboard fetched from cache",
                leaderboard: populatedBoard,
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const scores = await Score.find({
            gameId,
            createdAt: { $gte: today },
        })
            .sort({ score: -1 })
            .populate("user")
            .limit(10);

        await Promise.all(
            scores.map((score) =>
                updateDailyScore(gameId, score.score, score.user._id.toString())
            )
        );

        res.status(200).json({
            message: "Daily leaderboard fetched",
            leaderboard: scores,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
