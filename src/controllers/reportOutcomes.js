
import db from "../config/db.js";

// GET Report Outcomes with their Learning Outcomes
const getReportOutcomes = async (req, res) => {
    const { year, classname, section, quarter, subject } = req.headers;

    if (!year || !classname || !section || !quarter || !subject) {
        return res.status(400).json({ message: "Missing required headers: year, class, section, quarter, or subject" });
    }

    try {
        // Fetch Report Outcomes
        const roQuery = `
            SELECT id AS ro_id, name AS ro_name
            FROM report_outcomes
            WHERE year = ? AND class = ? AND section = ? AND quarter = ? AND subject = ?
        `;
        const [reportOutcomes] = await db.execute(roQuery, [year, classname, section, quarter, subject]);

        if (reportOutcomes.length === 0) {
            return res.status(404).json({ message: "No report outcomes found for the given filters" });
        }

        // Fetch LO mappings from ro_lo_mapping
        const roIds = reportOutcomes.map(ro => ro.ro_id);
        if (roIds.length === 0) {
            return res.status(200).json(reportOutcomes); // No Report Outcomes, return empty response
        }

        const loQuery = `
            SELECT lom.ro_id, lo.id AS lo_id, lo.name AS lo_name, lom.priority, lom.weight
            FROM ro_lo_mapping lom
            JOIN learning_outcomes lo ON lom.lo_id = lo.id
            WHERE lom.ro_id IN (${roIds.map(() => "?").join(", ")})
        `;
        const [learningOutcomes] = await db.execute(loQuery, roIds);

        // Map Learning Outcomes to corresponding Report Outcomes
        const roWithLO = reportOutcomes.map(ro => ({
            ...ro,
            learning_outcomes: learningOutcomes
                .filter(lo => lo.ro_id === ro.ro_id)
                .map(lo => ({
                    lo_id: lo.lo_id,
                    lo_name: lo.lo_name,
                    priority: lo.priority,
                    weight: lo.weight
                }))
        }));

        res.status(200).json(roWithLO);
    } catch (err) {
        console.error("Error fetching report outcomes with learning outcomes:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


// POST Report Outcome
const createReportOutcome = async (req, res) => {
    const { year, classname, section, quarter, subject } = req.headers;
    const { name } = req.body;

    if (!year || !classname || !section || !quarter || !subject || !name) {
        return res.status(400).json({ message: "Missing required fields in headers or body" });
    }

    try {
        // Insert new Report Outcome (assuming 'id' is auto-incremented)
        const query = `
            INSERT INTO report_outcomes (name, year, class, section, quarter, subject) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [name, year, classname, section, quarter, subject]);

        // Fetch the newly inserted report outcome
        const [newRO] = await db.execute(
            `SELECT id AS ro_id, name AS ro_name FROM report_outcomes WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: "Report outcome added successfully",
            report_outcome: newRO[0]  // Return inserted record
        });
    } catch (err) {
        console.error("Error inserting report outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// UPDATE Report Outcome
const updateReportOutcome = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
        return res.status(400).json({ message: "Missing required fields: Report Outcome ID (params) or name (body)." });
    }

    try {
        // Update the name of the Report Outcome
        const updateQuery = "UPDATE report_outcomes SET name = ? WHERE id = ?";
        const [result] = await db.execute(updateQuery, [name, id]);

        // Check if the update actually happened
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report outcome not found." });
        }

        // Fetch and return the updated record
        const [updatedRO] = await db.execute(
            "SELECT id AS ro_id, name AS ro_name FROM report_outcomes WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Report outcome updated successfully.",
            report_outcome: updatedRO[0]
        });
    } catch (err) {
        console.error("Error updating report outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


const deleteReportOutcome = async (req, res) => {
    const ro_id = req.headers["ro_id"]; // Use correct parameter name

    if (!ro_id) {
        return res.status(400).json({ message: "Missing required header: 'ro_id'." });
    }

    if (isNaN(ro_id)) {
        return res.status(400).json({ message: "Invalid 'ro_id'. It should be a number." });
    }

    try {
        // Delete report outcome
        const [deleteResult] = await db.execute(
            "DELETE FROM report_outcomes WHERE id = ?",
            [ro_id]
        );

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: "No report outcome found with the given 'ro_id'." });
        }

        res.status(200).json({
            message: `Deleted report outcome with id ${ro_id} successfully.`,
        });
    } catch (err) {
        console.error("Error deleting report outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



export { getReportOutcomes, createReportOutcome, updateReportOutcome, deleteReportOutcome };

