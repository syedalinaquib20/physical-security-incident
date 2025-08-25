import { pool } from "../database/index.js";

const manageRegions = async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const searchQuery = q ? `%${q.toLowerCase()}%` : null;

    const values = [];
    let whereClause = "";

    if (searchQuery) {
        whereClause = "WHERE LOWER(region_name) LIKE $1";
        values.push(searchQuery);
    }

    const countQuery = `
        SELECT COUNT(*)
        FROM regions
        ${whereClause}
    `;

    const paginatedQuery = `
        SELECT region_id, region_name
        FROM regions
        ${whereClause}
        ORDER BY region_id
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    try {
        const totalResult = await pool.query(countQuery, values);
        const totalRegions = parseInt(totalResult.rows[0].count, 10);

        const paginatedValues = [...values, limit, offset];
        const dataResult = await pool.query(paginatedQuery, paginatedValues);

        res.status(200).json({
            regions: dataResult.rows,
            total: totalRegions
        });

    } catch (error) {
        console.error("Error in manageRegions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default manageRegions;