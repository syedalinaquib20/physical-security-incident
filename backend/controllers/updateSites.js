import { pool } from "../database/index.js";

const updateSites = async (req, res) => {
    const { site_id } = req.params;
    const { site_code, site_name, region_id } = req.body;

    try {
        const duplicateCheckQuery = `
            SELECT * FROM sites
            WHERE site_code = $1 AND site_name = $2 AND region_id = $3 AND site_id != $4;
        `;

        const duplicateCheckRes = await pool.query(duplicateCheckQuery, [site_code, site_name, region_id, site_id]);
        if (duplicateCheckRes.rows.length > 0) {
            return res.status(400).json({
                message: "Site already exists"
            });
        }

        const updateQuery = `
            UPDATE sites
            SET site_code = $1, site_name = $2, region_id = $3
            WHERE site_id = $4
            RETURNING *;
        `;

        await pool.query(updateQuery, [site_code, site_name, region_id, site_id]);
        res.status(200).json({
            message: "Site updated successfully"
        });

    } catch (error) {
        console.error("Error in updateSites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default updateSites;