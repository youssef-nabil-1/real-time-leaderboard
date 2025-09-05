import Score from "../models/score.js";

export const createScore = async (req, res, next) => {
    const { gameId, score, userId } = req.body;
    try {
        const score = new Score({ gameId, score, userId });
        const result = await score.save();
        res.status(201).json({ message: "Score added", score: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
