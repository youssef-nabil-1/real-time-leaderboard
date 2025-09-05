import mongoose from "mongoose";
const Schema = mongoose.Schema;

const gameSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
