import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import userRouter from "./routers/user.js";
import scoreRouter from "./routers/score.js";
import gameRouter from "./routers/game.js";
import leaderboardRouter from "./routers/leaderboard.js";
import { initSocket } from "./socket.js";

const app = express();

app.use(bodyParser.json());
app.use("/auth", userRouter);
app.use("/game", gameRouter);
app.use("/score", scoreRouter);
app.use("/leaderboard", leaderboardRouter);

mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/leadboard")
    .then(() => {
        console.log("CONNECTED");
        const server = app.listen(process.env.PORT || 8080);
        const io = initSocket(server, {
            cors: {
                origin: "*",
            },
        });
        io.on("connection", (socket) => {
            console.log("Client connected");

            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
