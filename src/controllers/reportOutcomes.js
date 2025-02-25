
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

        // Fetch Learning Outcomes mapped to Report Outcomes
        const roIds = reportOutcomes.map(ro => ro.ro_id);
        if (roIds.length === 0) {
            return res.status(200).json(reportOutcomes); // No Report Outcomes, return empty response
        }

        const loQuery = `
            SELECT id AS lo_id, name AS lo_name, ro_id
            FROM learning_outcomes
            WHERE ro_id IN (${roIds.map(() => "?").join(", ")})
        `;
        const [learningOutcomes] = await db.execute(loQuery, roIds);

        // Map Learning Outcomes to corresponding Report Outcomes
        const roWithLO = reportOutcomes.map(ro => ({
            ...ro,
            learning_outcomes: learningOutcomes.filter(lo => lo.ro_id === ro.ro_id)
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
        // Get the next available ID
        const [maxIdRow] = await db.execute('SELECT MAX(id) AS maxId FROM report_outcomes');
        const newId = (maxIdRow[0].maxId || 0) + 1;

        // Insert new Report Outcome
        const query = `
            INSERT INTO report_outcomes (id, name, year, class, section, quarter, subject) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(query, [newId, name, year, classname, section, quarter, subject]);

        res.status(201).json({
            message: "Report outcome added successfully",
            insertedId: newId
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
        // Check if the Report Outcome exists
        const [existingRO] = await db.execute(
            "SELECT id FROM report_outcomes WHERE id = ?", [id]
        );

        if (existingRO.length === 0) {
            return res.status(404).json({ message: "Report outcome not found." });
        }

        // Update the name of the Report Outcome
        const updateQuery = "UPDATE report_outcomes SET name = ? WHERE id = ?";
        await db.execute(updateQuery, [name, id]);

        res.status(200).json({ message: "Report outcome updated successfully." });
    } catch (err) {
        console.error("Error updating report outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteReportOutcome = async (req, res) => {
    const lo_id = req.headers["lo_id"];

    // Validate required header
    if (!lo_id) {
        return res.status(400).json({
            message: "Missing required header. Please provide 'lo_id'.",
        });
    }

    if (isNaN(lo_id)) {
        return res.status(400).json({
            message: "Invalid 'lo_id'. It should be a number.",
        });
    }

    try {
        // Check if the report outcome exists
        const [existingRows] = await db.execute(
            "SELECT id FROM report_outcomes WHERE id = ?",
            [lo_id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ message: "No report outcome found with the given 'lo_id'." });
        }

        // Delete report outcome
        const [deleteResult] = await db.execute(
            "DELETE FROM report_outcomes WHERE id = ?",
            [lo_id]
        );

        res.status(200).json({
            message: `Deleted report outcome with id ${lo_id} successfully.`,
        });
    } catch (err) {
        console.error("Error deleting report outcome:", err);
        res.status(500).json({ message: "Server error" });
    }
};


export { getReportOutcomes, createReportOutcome, updateReportOutcome, deleteReportOutcome };

