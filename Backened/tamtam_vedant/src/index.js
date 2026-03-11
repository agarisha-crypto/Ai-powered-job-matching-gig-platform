import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config({
    path: "./.env"
});

connectDB()
.then(() => {
    app.listen(8000, "0.0.0.0", () => {
  console.log("Server running on port 8000");
});
}).catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
});