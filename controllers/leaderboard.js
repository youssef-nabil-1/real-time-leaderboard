import { useId } from "react";
import Score from "../models/score.js";

export const getGlobalLeaderboard = async (req, res, next) => {
    try {
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
        const totalUserScore = await Score.aggregate([
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

        const allUserScores = await Score.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalScore: { $sum: "$score" },
                },
            },
            { $sort: { totalScore: -1 } },
        ]);

        const userRank =
            allUserScores.findIndex(
                (score) => score._id.toSring() === userId.toSring()
            ) + 1;

        res.status(200).json({
            message: "Global rank fetched",
            rank: userRank,
            totalPlayers: allUserScores.length,
            totalScore: userTotalScore[0].totalScore,
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

        const totalPlayers = await Score.distinct("user", { gameId }).length;

        res.status(200).json({
            message: "User game rank fetched",
            rank: rank + 1,
            totalPlayers,
            userScore: userScore.score,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getGameLeaderboard = async (req, res) => {
    const { gameId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const scores = await Score.find({ gameId })
            .sort({ score: -1 })
            .populate("user")
            .skip(skip)
            .limit(limit);

        const total = await Score.countDocuments({ gameId });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: "Game Leaderboard fetched",
            leaderboard: scores,
            pagination: { page, totalPages, total },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getDailyLeaderboard = async (req, res) => {
    const { gameId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const scores = await Score.find({
            gameId,
            createdAt: { $gte: today },
        })
            .sort({ score: -1 })
            .populate("user")
            .limit(10);

        res.status(200).json({
            message: "Daily leaderboard fetched",
            leaderboard: scores,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
