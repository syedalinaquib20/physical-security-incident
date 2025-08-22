import { pool } from "../database/index.js";

const manageSites = async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const searchQuery = q ? `%${q.toLowerCase()}%` : null;

    const values = [];
    let whereClause = "";

    if (searchQuery) {
        whereClause = `
           WHERE
                LOWER(sites.site_code) LIKE $1 OR
                LOWER(sites.site_name) LIKE $1 OR
                LOWER(regions.region_name) LIKE $1
        `;
        values.push(searchQuery);
    }

    const countQuery = `
        SELECT COUNT(*)
        FROM sites
        INNER JOIN regions ON sites.region_id = regions.region_id
        ${whereClause}
    `;

    const paginatedQuery = `
        SELECT sites.site_id, sites.site_code, sites.site_name, regions.region_name
        FROM sites
        INNER JOIN regions ON sites.region_id = regions.region_id
        ${whereClause}
        ORDER BY sites.site_id
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    try {
        const totalResult = await pool.query(countQuery, values);
        const totalSites = parseInt(totalResult.rows[0].count, 10);

        const paginatedValues = [...values, limit, offset];
        const dataResult = await pool.query(paginatedQuery, paginatedValues);

        res.status(200).json({
            sites: dataResult.rows,
            total: totalSites
        });

    } catch (error) {
        console.error("Error in manageSites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default manageSites;