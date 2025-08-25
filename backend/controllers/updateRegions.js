import { pool } from "../database/index.js";

const updateRegions = async (req, res) => {
    const { region_id } = req.params;
    const { region_name } = req.body;

    try {
        const duplicateCheckQuery = `
            SELECT * FROM regions
            WHERE region_name = $1 AND region_id != $2;
        `;

        const duplicateCheckRes = await pool.query(duplicateCheckQuery, [region_name, region_id]);
        if (duplicateCheckRes.rows.length > 0) {
            return res.status(400).json({
                message: "Region already exists"
            });
        }

        const updateQuery = `
            UPDATE regions
            SET region_name = $1
            WHERE region_id = $2
            RETURNING *;
        `;
        await pool.query(updateQuery, [region_name, region_id]);
        res.status(200).json({
            message: "Region updated successfully"
        });

    } catch (error) {
        console.error("Error in updateRegions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default updateRegions;