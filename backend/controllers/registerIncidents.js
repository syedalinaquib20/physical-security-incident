import { pool } from "../database/index.js";

const registerIncidents = async (req, res) => {
    const insertNewIncident = `
        INSERT INTO incidents (site_id, year, losses)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    try {
        let { site_id, year, losses } = req.body;

       if (!site_id || !year || losses === undefined || isNaN(site_id) || isNaN(year) || isNaN(losses)) {
            return res.status(400).json({
                message: "Please provide valid site_id, year, and losses"
            });
        }

        site_id = parseInt(site_id, 10);
        year = parseInt(year, 10);
        losses = parseFloat(losses);

        await pool.query(insertNewIncident, [site_id, year, losses]);
        res.status(201).json({
            message: "The incident registered successfully"
        });

    } catch (error) {
        console.error("Error in registerIncidents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default registerIncidents;