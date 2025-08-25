import { pool } from "../database/index.js";

const deleteIncidents = async (req, res) => {
    const { incident_id } = req.params; 

    try {
        await pool.query("DELETE FROM incidents WHERE incident_id = $1", [incident_id]);
        res.status(200).json({
            message: "Incident deleted successfully"
        });

    } catch (error) {
        console.error("Error in delete incidents", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export default deleteIncidents;