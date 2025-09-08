# Real-Time Leaderboard System

A high-performance real-time leaderboard system built with Node.js, Redis, and MongoDB. This system provides real-time score tracking, multiple leaderboard types, and efficient caching strategies.

## Features

-   **Real-time Updates**: Instant leaderboard updates using Socket.IO
-   **Multiple Leaderboard Types**:
    -   Game-specific leaderboards
    -   Daily leaderboards
    -   Global leaderboard
-   **Efficient Caching**: Redis-based caching system for high performance
-   **User Rankings**: Individual and global ranking tracking
-   **Authentication**: Secure endpoints with user authentication

## Technology Stack

-   **Backend**: Node.js
-   **Database**: MongoDB (persistent storage)
-   **Caching**: Redis (leaderboard caching)
-   **Real-time**: Socket.IO
-   **Authentication**: JWT (JSON Web Tokens)

## Architecture

### Caching Strategy

-   **Game Leaderboards**: Cached for 1 hour
-   **Daily Leaderboards**: Cached for 48 hours
-   **Global Leaderboard**: Cached for 1 hour
-   Cache-first approach with database fallback

### Data Models

-   **User**: Player information and authentication
-   **Score**: Individual game scores
-   **Game**: Game-specific information

### API Endpoints

#### Leaderboards

-   `GET /leaderboard/global` - Get global leaderboard
-   `GET /leaderboard/game/:gameId` - Get game-specific leaderboard
-   `GET /leaderboard/daily/:gameId` - Get daily leaderboard for a game
-   `GET /leaderboard/rank` - Get user's global ranking
-   `GET /leaderboard/game/:gameId/rank` - Get user's ranking in a specific game

#### Scores

-   `POST /score` - Submit a new score

## Setup

1. **Prerequisites**

    - Node.js (v14 or higher)
    - MongoDB
    - Redis

2. **Environment Variables**

    ```env
    MONGODB_URI=your_mongodb_connection_string
    REDIS_URL=your_redis_connection_string
    JWT_SECRET=your_jwt_secret
    ```

3. **Installation**

    ```bash
    npm install
    ```

4. **Running the Server**
    ```bash
    npm start
    ```

## Caching Implementation

The system uses Redis Sorted Sets (ZSET) for efficient leaderboard management:

-   **Score Updates**: Only higher scores are cached for each user
-   **Ranking Queries**: O(log(N)) complexity using ZREVRANK
-   **Leaderboard Retrieval**: O(log(N)+M) using ZREVRANGE

### Key Patterns

-   Game Leaderboard: `leaderboard:game:{gameId}`
-   Daily Leaderboard: `leaderboard:daily:{gameId}:{date}`
-   Global Leaderboard: `leaderboard:global`

## Performance Considerations

-   Parallel updates for different leaderboard types
-   Automatic cache warming on data retrieval
-   Efficient memory usage with expiry policies
-   Optimized database queries with MongoDB aggregation

## Error Handling

-   Graceful degradation on Redis failures
-   Automatic cache rebuilding
-   Comprehensive error logging
-   Request validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License

## Author

[Your Name]

## Acknowledgments

-   Redis Labs for Redis
-   MongoDB for the database
-   Socket.IO team for real-time capabilities
