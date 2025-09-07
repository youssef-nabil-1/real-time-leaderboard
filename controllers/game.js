import Game from "../models/game.js";

export const createGame = async (req, res, next) => {
    if (!req.body.name)
        return res.status(400).json({ message: "No name provided" });

    const { name } = req.body;
    try {
        const game = new Game({ name });
        const result = await game.save();
        res.status(201).json({ message: "Game Created", game: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
};

export const getGames = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let totalPages = games.length / limit;
        if (games.length / parseFloat(limit) != totalPages) totalPages += 1;
        const games = await Game.find({ isActive: true })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            message: "Games fetched",
            games,
            pagination: { page, totalPages },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getGameById = async (req, res, next) => {
    try {
        if (!req.params.id)
            return res.status(400).json({ message: "Game Id is required" });
        const id = req.params.id;
        const game = await Game.findOne(id);
        res.status(200).json({
            message: "Game fetched",
            game,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
