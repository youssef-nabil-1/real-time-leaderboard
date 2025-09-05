import mongoose from "mongoose";
const Schema = mongoose.Schema;

const scoreSchema = new Schema(
    {
        gameId: {
            type: Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Score", scoreSchema);
