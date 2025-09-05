import jwt from "jsonwebtoken";

export default (req, res, next) => {
    if (!req.headers["Autherization"])
        return res.status(401).json({ message: "No token provided" });
    const token = req.headers["Autherization"].split(" ")[1];
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "hasdbsabdsadlsabkdbas"
        );
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
