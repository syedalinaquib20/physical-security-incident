import { pool } from "../database/index.js";

const registerSites = async (req, res) => {
    const insertNewSite = `
        INSERT INTO sites (site_code, site_name, region_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const checkLocation = `
        SELECT * FROM sites 
        WHERE site_code = $1 AND site_name = $2 AND region_id = $3;
    `;

    try {
        let { site_code, site_name, region_id } = req.body;

        if (!site_code?.trim() || !site_name?.trim() || isNaN(region_id)) {
            return res.status(400).json({
                message: "Please provide all required fields"
            })
        }

        region_id = parseInt(region_id);

        const dbResSite = await pool.query(checkLocation, [site_code, site_name, region_id]);
        if (dbResSite.rows.length > 0) {
            return res.status(400).json({
                message: "Site already exists"
            });
        }

        await pool.query(insertNewSite, [site_code, site_name, region_id]);
        res.status(201).json({
            message: "Site registered successfully"
        });

    } catch (error) {
        console.error("Error in registerSites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default registerSites;