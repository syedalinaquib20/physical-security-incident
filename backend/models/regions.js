import { pool } from "../database/index.js";

const query = `
CREATE TABLE IF NOT EXISTS regions (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL UNIQUE);
`;

async function createRegionsTable() {
    try {
        await pool.query(query);
        console.log("Regions table created successfully.");
    } catch (error) {
        console.error("Error creating regions table:", error);
    }
}

export default createRegionsTable;