import { pool } from "../database/index.js";

const regsterRegions = async (req, res) => {
    const insertNewRegion = `
        INSERT INTO regions (region_name)
        VALUES ($1)
        RETURNING *;
    `;

    const checkRegion = `
        SELECT * FROM regions 
        WHERE region_name = $1;
    `;

    try {
        let { region_name } = req.body;

        if (!region_name?.trim()) {
            return res.status(400).json({
                message: "Please provide all required fields"
            })
        }

        region_name = region_name.trim();

        const dbResRegion = await pool.query(checkRegion, [region_name]);
        if (dbResRegion.rows.length > 0) {
            return res.status(400).json({
                message: "Region already exists"
            });
        }

        await pool.query(insertNewRegion, [region_name]);
        res.status(201).json({
            message: "Region registered successfully"
        });

    } catch (error) {
        console.error("Error in regsterRegions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default regsterRegions;