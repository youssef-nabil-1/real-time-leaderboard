import Score from "../models/score.js";
import { getIO } from "../socket.js";

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
