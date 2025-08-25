import { pool } from "../database/index.js";

const uploadSites = async (req, res) => {
    const { sites } = req.body;

    if (!sites || sites.length === 0) {
        return res.status(400).json({
            message: "No sites provided for upload"
        });
    }

    try {
        await pool.query("BEGIN");

        const batchSize = 500; 
        for (let i = 0; i < sites.length; i += batchSize) {
            const batch = sites.slice(i, i + batchSize);

            const values = [];
            const placeholders = batch.map((site, idx) => {
                const base = idx * 3;
                values.push(
                    site.site_code,
                    site.site_name,
                    site.region_id
                );
                return `($${base + 1}, $${base + 2}, $${base + 3})`;
            });

            const insertQuery = `
                INSERT INTO sites (site_code, site_name, region_id)
                VALUES ${placeholders.join(", ")}
                RETURNING *;
            `;
            await pool.query(insertQuery, values);
        }

        await pool.query("COMMIT");

        res.status(201).json({
            message: "Sites uploaded successfully", 
            inserted: sites.length
        });

    } catch (error) {
        console.error("Error in uploadSites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default uploadSites;