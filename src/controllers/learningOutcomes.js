
import db from "../config/db.js";
//get learning outcome
const getLearningOutcomes = async (req, res) => {
    const { year, subject, classname, quarter } = req.headers;

    if (!year || !subject || !quarter || !classname) {
        return res.status(400).json({ message: "Missing required headers: year, subject, class, or quarter" });
    }

    try {
        // Fetch Learning Outcomes
        const loQuery = `
            SELECT id AS lo_id, name AS lo_name
            FROM learning_outcomes
            WHERE year = ? AND subject = ? AND quarter = ? AND class = ?
        `;
        const [learningOutcomes] = await db.execute(loQuery, [year, subject, quarter, classname]);

        if (learningOutcomes.length === 0) {
            return res.status(404).json({ message: "No learning outcomes found for the provided filters" });
        }

        // Fetch Assessment Criterias mapped to Learning Outcomes
        const loIds = learningOutcomes.map(lo => lo.lo_id);
        if (loIds.length === 0) {
            return res.status(200).json(learningOutcomes); // No LOs, return empty response
        }

        const acQuery = `
            SELECT ac.id AS ac_id, ac.name AS ac_name, ac.lo_id
            FROM assessment_criterias ac
            WHERE ac.lo_id IN (${loIds.map(() => "?").join(", ")})
        `;
        const [assessmentCriterias] = await db.execute(acQuery, loIds);

        // Map Assessment Criterias to corresponding Learning Outcomes
        const loWithAC = learningOutcomes.map(lo => ({
            ...lo,
            assessment_criterias: assessmentCriterias.filter(ac => ac.lo_id === lo.lo_id)
        }));

        res.status(200).json(loWithAC);
    } catch (err) {
        console.error("Error fetching learning outcomes with assessment criterias:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST LO 
const createLearningOutcome = async (req, res) => {
    const { year, quarter, classname, subject } = req.headers;
    const { name, ro_id } = req.body;
    
    if (!year || !quarter || !classname || !subject || !name || !ro_id) {
        return res.status(400).json({
            message: "Missing required fields: year, quarter, class, subject (headers) or name, ro_id (body)."
        });
    }

    try {
        // Get the next available ID
        const [maxIdRow] = await db.execute('SELECT MAX(id) AS maxId FROM learning_outcomes');
        const newId = (maxIdRow[0].maxId || 0) + 1;

        // Insert the new Learning Outcome with ro_id
        const query = `
            INSERT INTO learning_outcomes (id, name, ro_id, year, quarter, class, subject) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(query, [newId, name, ro_id, year, quarter, classname, subject]);

        res.status(201).json({
            message: "Learning outcome added successfully",
            insertedId: newId
        });
    } catch (err) {
        console.error("Error inserting learning outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

//UPDATE lo
const updateLearningOutcome = async (req, res) => {
    const { id } = req.params;
    const { year, quarter, classname, subject } = req.headers;
    const { name, ro_id } = req.body;

    if (!id || !year || !quarter || !classname || !subject) {
        return res.status(400).json({
            message: "Missing required fields: year, quarter, class, subject (headers) or LO id (params)."
        });
    }

    if (!name && !ro_id) {
        return res.status(400).json({
            message: "At least one field (name or ro_id) is required to update."
        });
    }

    try {
        // Check if the LO exists
        const [existingLO] = await db.execute(
            `SELECT id FROM learning_outcomes WHERE id = ? AND year = ? AND quarter = ? AND class = ? AND subject = ?`,
            [id, year, quarter, classname, subject]
        );

        if (existingLO.length === 0) {
            return res.status(404).json({ message: "Learning outcome not found for the given filters." });
        }

        // Prepare the update query dynamically
        let updateFields = [];
        let values = [];

        if (name) {
            updateFields.push("name = ?");
            values.push(name);
        }
        if (ro_id) {
            updateFields.push("ro_id = ?");
            values.push(ro_id);
        }

        values.push(id, year, quarter, classname, subject);

        const updateQuery = `
            UPDATE learning_outcomes 
            SET ${updateFields.join(", ")}
            WHERE id = ? AND year = ? AND quarter = ? AND class = ? AND subject = ?
        `;

        await db.execute(updateQuery, values);

        res.status(200).json({ message: "Learning outcome updated successfully." });
    } catch (err) {
        console.error("Error updating learning outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteLearningOutcome = async (req, res) => {
    const { lo_id } = req.params; // Expecting LO ID in URL

    if (!lo_id) {
        return res.status(400).json({ message: "Missing required parameter: lo_id" });
    }

    try {
        // Check if LO exists
        const [existingLO] = await db.execute(
            "SELECT id FROM learning_outcomes WHERE id = ?",
            [lo_id]
        );

        if (existingLO.length === 0) {
            return res.status(404).json({ message: "Learning Outcome not found" });
        }

        // Delete related mappings from ro_lo_mapping
        await db.execute(
            "DELETE FROM ro_lo_mapping WHERE lo_id = ?",
            [lo_id]
        );

        // Delete the LO itself
        await db.execute(
            "DELETE FROM learning_outcomes WHERE id = ?",
            [lo_id]
        );

        res.status(200).json({ message: "Learning Outcome deleted successfully" });
    } catch (err) {
        console.error("Error deleting Learning Outcome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export { getLearningOutcomes, updateLearningOutcome, createLearningOutcome, deleteLearningOutcome };