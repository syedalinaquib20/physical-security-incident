import { pool } from "../database/index.js";

const deleteSites = async (req, res) => {
    const { site_id } = req.params;

    try {
        await pool.query("DELETE FROM sites WHERE site_id = $1", [site_id]);
        res.status(200).json({
            message: "Site deleted successfully"
        });
        
    } catch (error) {
        console.error("Error in deleteSites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default deleteSites;