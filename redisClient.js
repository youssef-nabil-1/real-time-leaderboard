import { createClient } from "redis";

const leaderboardExpiry = 3600;

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error:", err));

await client.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
});

export const updateScore = async (key, score, userId) => {
    const currentScore = await client.zScore(key, userId);

    if (!currentScore || score > currentScore) {
        await client.zAdd(key, { score, value: userId });
        await client.expire(key, leaderboardExpiry);
    }
    return true;
};

export const getRanking = async (key, user) => {
    const rank = await client.zRevRank(key, user);
    return rank === null ? null : rank + 1;
};

export const getLeaderboard = async (gameId, start = 0, end = 9) => {
    const key = `leaderboard:game:${gameId}`;
    const results = await client.zRevRangeWithScores(key, start, end);
    if (!results) return null;
    return results.map(({ score, value }) => ({
        user: value,
        score: score,
    }));
};

export const clearLeaderboard = async (gameId) => {
    try {
        const key = `leaderboard:game:${gameId}`;
        await client.del(key);
    } catch (error) {
        console.error("Error clearing leaderboard:", error);
        throw error;
    }
};

export const getUserScore = async (key, user) => {
    const score = await client.zScore(key, user);
    return score;
};

export const getGlobalLeaderboard = async () => {
    const key = "leaderboard:global";
    const results = await client.zRevRangeWithScores(key, 0, 9);
    if (!results) return null;
    return results.map(({ score, value }) => ({
        user: value,
        score: score,
    }));
};

export const updateGlobalScore = async (userId, totalScore) => {
    const key = "leaderboard:global";
    await client.zAdd(key, { score: totalScore, value: userId });
    await client.expire(key, leaderboardExpiry);
};

export const getDailyLeaderboard = async (gameId) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `leaderboard:daily:${gameId}:${today}`;
    const results = await client.zRevRangeWithScores(key, 0, 9);
    if (!results) return null;
    return results.map(({ score, value }) => ({
        user: value,
        score: score,
    }));
};

export const updateDailyScore = async (gameId, score, userId) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `leaderboard:daily:${gameId}:${today}`;
    const currentScore = await client.zScore(key, userId);

    if (!currentScore || score > currentScore) {
        await client.zAdd(key, { score, value: userId });
        await client.expire(key, 172800);
    }
};

export const getGlobalUserRanking = async (userId) => {
    const key = "leaderboard:global";
    const rank = await client.zRevRank(key, userId);
    const score = await client.zScore(key, userId);
    const total = await client.zCard(key);
    return { rank: rank !== null ? rank + 1 : null, score, total };
};
