import db from "../config/db.js";

// Get All Assessment Criteria Scores for All Students in a Section
const getAssessmentCriteriaScores = async (req, res) => {
    const { class_id, section_id } = req.params;
    const { year, quarter_id, subject_id } = req.headers;

    // Validate input
    if (!year || !quarter_id || !subject_id) {
        return res.status(400).json({ message: "Missing required headers: year, quarter_id, subject_id" });
    }

    try {
        const query = `
            SELECT sr.student_id, s.name AS student_name, ac.id AS ac_id, ac.name AS ac_name, acs.value
            FROM ac_scores acs
            JOIN students_records sr ON acs.student_id = sr.id
            JOIN students s ON sr.student_id = s.id
            JOIN assessment_criterias ac ON acs.ac_id = ac.id
            WHERE sr.class = ? AND sr.section = ? AND sr.year = ? 
            AND ac.quarter = ? AND ac.subject = ?
            ORDER BY sr.student_id, ac.id;
        `;

        const [results] = await db.execute(query, [class_id, section_id, year, quarter_id, subject_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No assessment scores found for this section." });
        }

        // Format results into structured JSON
        const studentScores = {};
        results.forEach(({ student_id, student_name, ac_id, ac_name, value }) => {
            if (!studentScores[student_id]) {
                studentScores[student_id] = {
                    student_id,
                    student_name,
                    scores: []
                };
            }
            studentScores[student_id].scores.push({ ac_id, ac_name, value });
        });

        res.status(200).json({ students: Object.values(studentScores) });
    } catch (err) {
        console.error("Error fetching assessment scores:", err);
        res.status(500).json({ message: "Server error while fetching assessment scores", error: err.message });
    }
};

// Set Assessment Criteria Scores
const setAssessmentCriteriaScore = async (req, res) => {
    try {
        const { year, quarter, classname, section, subject } = req.headers;
        const { ac_id, scores } = req.body;
        if (!ac_id || !scores || !Array.isArray(scores) || scores.length === 0) {
            return res.status(400).json({ error: "ac_id and an array of scores (student_id, obtained_marks) are required in the body" });
        }
        if (!year || !quarter || !classname || !section) { // Included 'section' in validation
            return res.status(400).json({ error: "year, quarter, className, and section are required in the headers" });
        }
        const [criteriaRows] = await db.query(
            "SELECT max_marks FROM assessment_criterias WHERE id = ? AND quarter = ? AND year = ? AND class = ?",
            [ac_id, quarter, year, classname, section]
        );
        if (criteriaRows.length === 0) {
            return res.status(404).json({ error: "Assessment criteria not found for the given parameters" });
        }
        const max_marks = criteriaRows[0].max_marks;
        let validScores = scores
            .filter(({ student_id, obtained_marks }) => student_id && obtained_marks !== null && obtained_marks <= max_marks)
            .map(({ student_id, obtained_marks }) => [student_id, ac_id, obtained_marks / max_marks]);
        if (validScores.length === 0) {
            return res.status(400).json({ error: "No valid scores to insert" });
        }
        const valuesPlaceholder = validScores.map(() => "(?, ?, ?)").join(", ");
        const flattenedValues = validScores.flat();
        const query = `
            INSERT INTO ac_scores (student_id, ac_id, value)
            VALUES ${valuesPlaceholder}
            ON DUPLICATE KEY UPDATE value = VALUES(value);
        `;
        await db.query(query, flattenedValues);
        res.status(201).json({ message: `${validScores.length} scores saved successfully.` });
    } catch (error) {
        console.error("Error processing scores:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update Assessment Criteria Scores
const updateAssessmentCriteriaScore = async (req, res) => {
    try {
        const { year, quarter, classname, section, subject } = req.headers;
        const { ac_id, scores } = req.body;

        // Validate request data
        if (!ac_id || !scores || !Array.isArray(scores) || scores.length === 0) {
            return res.status(400).json({ error: "ac_id and an array of scores (student_id, obtained_marks) are required in the body" });
        }
        if (!year || !quarter || !classname || !section) {
            return res.status(400).json({ error: "year, quarter, className, and section are required in the headers" });
        }

        // Fetch max_marks for the given AC
        const [criteriaRows] = await db.query(
            "SELECT max_marks FROM assessment_criterias WHERE id = ? AND quarter = ? AND year = ? AND class = ? AND section = ?",
            [ac_id, quarter, year, classname, section]
        );

        if (criteriaRows.length === 0) {
            return res.status(404).json({ error: "Assessment criteria not found for the given parameters" });
        }

        const max_marks = criteriaRows[0].max_marks;

        // Validate and prepare scores for update
        let validScores = scores
            .filter(({ student_id, obtained_marks }) => student_id && obtained_marks !== null && obtained_marks <= max_marks)
            .map(({ student_id, obtained_marks }) => [obtained_marks / max_marks, student_id, ac_id]);

        if (validScores.length === 0) {
            return res.status(400).json({ error: "No valid scores to update" });
        }

        // Update scores in database
        const query = `
            UPDATE ac_scores 
            SET value = ? 
            WHERE student_id = ? AND ac_id = ?;
        `;

        for (const score of validScores) {
            await db.query(query, score);
        }

        res.status(200).json({ message: `${validScores.length} scores updated successfully.` });
    } catch (error) {
        console.error("Error updating scores:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export { updateAssessmentCriteriaScore };
export {getAssessmentCriteriaScores,setAssessmentCriteriaScore};