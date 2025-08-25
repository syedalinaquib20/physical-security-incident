import { pool } from "../database/index.js";

const updateIncidents = async (req, res) => {
    const { incident_id } = req.params;
    const { site_id, year, losses } = req.body;

    try {  
        const updateQuery = `
            UPDATE incidents
            SET site_id = $1, year = $2, losses = $3
            WHERE incident_id = $4
            RETURNING *;
        `;

        await pool.query(updateQuery, [site_id, year, losses, incident_id]);
        res.status(200).json({
            message: "The incident is updated successfully"
        });

    } catch (error) {
        console.error("Error in updateIncidents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default updateIncidents;