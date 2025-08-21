import pkg from "pg";
import "dotenv/config";
import createRegionsTable from "../models/regions.js";
import createSitesTable from "../models/sites.js";
import createIncidentsTable from "../models/incidents.js";

const { Pool } = pkg;

export const pool = new Pool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    port: process.env.DBPORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export async function databaseInit() {
    try {
        const dbName = await pool.query("SELECT current_database();");
        const dbRes = await pool.query("SELECT NOW();");
        const time = dbRes.rows[0].now;
        const name = dbName.rows[0].current_database;
        console.log(`Connected to database: ${name} at ${time}`);

        await createRegionsTable();
        await createSitesTable();
        await createIncidentsTable();

    } catch (error) {
        console.error(error);
        console.error("Database connection failed");
    }
}