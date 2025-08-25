import { pool } from "../database/index.js";

const deleteRegions = async (req, res) => {
    const { region_id } = req.params;

    try {
        await pool.query("DELETE FROM regions WHERE region_id = $1", [region_id]);
        res.status(200).json({
            message: "Region deleted successfully"
        });
        
    } catch (error) {
        console.error("Error in deleteRegions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default deleteRegions;