import { pool } from "../database/index.js";

const manageIncidents = async (req, res) => {
    const { q, year, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const values = [];
    const conditions = [];

    if (q) {
        values.push(`%${q.toLowerCase()}%`);
        conditions.push(`
            (
                LOWER(sites.site_code) LIKE $${values.length} OR
                LOWER(sites.site_name) LIKE $${values.length} OR 
                LOWER(regions.region_name) LIKE $${values.length} 
            )
        `);
    }

    if (year) {
        values.push(year.toLowerCase());
        conditions.push(`incidents.year = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `
        SELECT COUNT(*)
        FROM incidents 
        LEFT JOIN sites ON incidents.site_id = sites.site_id
        LEFT JOIN regions ON sites.region_id = regions.region_id
        ${whereClause}
    `;

    const paginatedQuery = `
        SELECT 
            incidents.incident_id, 
            sites.site_code, 
            sites.site_name, 
            regions.region_name, 
            incidents.year, 
            incidents.losses
        FROM incidents 
        LEFT JOIN sites ON incidents.site_id = sites.site_id
        LEFT JOIN regions ON sites.region_id = regions.region_id
        ${whereClause}
        ORDER BY incidents.incident_id
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `; 

    try {
        const totalResult = await pool.query(countQuery, values);
        const totalIncidents = parseInt(totalResult[0].count, 10);

        const paginatedValues = [...values, limit, offset];
        const dataResult = await pool.query(paginatedQuery, paginatedValues);

        res.status(200).json({
            incidents: dataResult.rows, 
            total: totalIncidents
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default manageIncidents;