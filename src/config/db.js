import mysql from "mysql2/promise";

// Create database connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "rahul@patil123",
    database: "mayoor",
    port: 3306, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Database connection established successfully!");
        connection.release(); // Release connection back to pool
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
})();

export default db;

