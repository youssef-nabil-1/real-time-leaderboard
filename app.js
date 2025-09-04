import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import userRouter from "./routers/user.js";

const app = express();

app.use(bodyParser.json());
app.use("/auth", userRouter);

mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/leadboard")
    .then(() => {
        console.log("CONNECTED");
        app.listen(process.env.PORT || 8080);
    });
