import { pool } from "../database/index.js";

const query = `
    CREATE TABLE IF NOT EXISTS incidents (
        incident_id SERIAL PRIMARY KEY,
        site_id INT NOT NULL REFERENCES Sites(site_id) ON DELETE CASCADE,
        year INT NOT NULL,
        losses DECIMAL(15,2) NOT NULL CHECK (losses >= 0),
        created_at TIMESTAMP DEFAULT NOW() 
    );
`; 

async function createIncidentsTable() {
    try {
        await pool.query(query);
        console.log("Incidents table created successfully.");
    } catch (error) {
        console.error("Error creating incidents table:", error);
    }
}

export default createIncidentsTable;