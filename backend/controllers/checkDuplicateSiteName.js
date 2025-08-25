import { pool } from "../database/index.js";

const checkDuplicateSiteName = async (req, res) => {
    const { sites } = req.body;

    if (!Array.isArray(sites) || sites.length === 0) {
        return res.status(400).json({ message: "No site data provided" });
    }

    try {
        const values = [];
        const conditions = sites.map((site, index) => {
            const siteName = String(site.site_name).toLowerCase().trim();
            values.push(siteName);
            return `(LOWER(TRIM(site_name)) = $${index + 1})`;
        }).join(" OR ");

        const query = `
            SELECT site_name FROM sites
            WHERE ${conditions};
        `;

        const result = await pool.query(query, values);
        res.status(200).json({
            duplicates: result.rows
        });

    } catch (error) {
        console.error("Error in checkDuplicateSiteName:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default checkDuplicateSiteName;