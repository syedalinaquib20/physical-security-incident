import { pool } from "../database/index.js";

const query = `
    CREATE TABLE IF NOT EXISTS sites (
        site_id SERIAL PRIMARY KEY,
        site_code VARCHAR(20) UNIQUE NOT NULL,
        site_name VARCHAR(255) NOT NULL,
        region_id INT NOT NULL REFERENCES Regions(region_id)
    );
`;

async function createSitesTable() {
    try {
        await pool.query(query);
        console.log("Sites table created successfully.");
    } catch (error) {
        console.error("Error creating sites table:", error);
    }
}

export default createSitesTable;