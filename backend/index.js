import express from "express"; 
import cors from "cors";
import "dotenv/config";
import routes from "./routes/routes.js";
import { databaseInit } from "./database/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased JSON payload size
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increased URL-encoded data size
app.use(express.static("public"));

databaseInit()

app.use("/", routes);

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
})
