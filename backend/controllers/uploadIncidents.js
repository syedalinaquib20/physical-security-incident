import { pool } from "../database/index.js";

const uploadIncidents = async (req, res) => {
    const { incidents } = req.body;

    if (!incidents || incidents.length === 0) {
        return res.status(400).json({
            message: "No incidents provided for upload"
        }); 
    }

    try {
        await pool.query("BEGIN");

        const batchSize = 500;
        for (let i = 0; i < incidents.length; i += batchSize) {
            const batch = incidents.slice(i, i + batchSize);

            const values = [];
            const placeholders = batch.map((incident, idx) => {
                const base = idx * 3;
                values.push(
                    incident.site_id, 
                    incident.year, 
                    incident.losses
                );
                return `($${base + 1}, $${base + 2}, $${base + 3})`;
            });

            const insertQuery = `
                INSERT INTO incidents (site_id, year, losses)
                VALUES ${placeholders.join(", ")}
                RETURNING *; 
            `;
            await pool.query(insertQuery, values);
        }

        await pool.query("COMMIT");

        res.status(201).json({
            message: "The incident uploaded successfully", 
            inserted: incidents.length
        });

    } catch (error) {
        console.error("Error in uploadIncidents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default uploadIncidents;