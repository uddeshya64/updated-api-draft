import db from "../config/db.js";

// Get Assessment Criterias
const getAssessmentCriterias = async (req, res) => {
    const { subject, year, quarter, classname } = req.headers; 

    console.log(`Subject: ${subject}, Year: ${year}, Quarter: ${quarter}, Class: ${classname}`);

    // Validate required headers
    if (!subject || !year || !quarter || !classname) {
        return res.status(400).json({
            message: 'Invalid input. Subject, Class, Year, and Quarter are required in the headers.',
        });
    }

    try {
        const query = `
            SELECT id, name, max_marks
            FROM assessment_criterias
            WHERE subject = ? AND year = ? AND quarter = ? AND class = ?
        `;

        const [results] = await db.execute(query, [subject, year, quarter, classname]);

        if (results.length === 0) {
            return res.status(404).json({
                message: 'No assessment criteria found for the given filters.',
            });
        }

        return res.status(200).json({
            message: 'Assessment criteria retrieved successfully',
            assessments: results,
        });
    } catch (err) {
        console.error('Error retrieving assessment criteria:', err);

        return res.status(500).json({
            message: 'Server error while fetching assessment criteria',
            error: err.message,
        });
    }
};


// Create Assessment Criteria
const createAssessmentCriteria = async (req, res) => {
    const { year, quarter, subject, classname } = req.headers;
    const { max_marks, name, lo_id } = req.body;

    // Validate required fields
    if (!year || !quarter || !subject || !classname || !max_marks || !name || !lo_id || !Array.isArray(lo_id)) {
        return res.status(400).json({
            message: 'Missing or invalid required fields. Ensure year, quarter, class, subject (headers), and max_marks, name, lo_id (array in body) are provided.',
        });
    }
// POST: Add a new teacher
const createTeacher = async (req, res) => {
    const { name, email, class: teacherClass, section, subject, role } = req.body;

    // Validate required fields
    if (!name || !email || !teacherClass || !section || !subject || !role) {
        return res.status(400).json({ message: "All fields (name, email, class, section, subject, role) are required." });
    }

    try {
        // Insert new teacher into database
        const query = `INSERT INTO teachers (name, email, class, section, subject, role) VALUES (?, ?, ?, ?, ?, ?)`;
        await db.execute(query, [name, email, teacherClass, section, subject, role]);

        res.status(201).json({ message: "Teacher added successfully." });
    } catch (err) {
        console.error("Error adding teacher:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
    try {
        // Insert new assessment criteria
        const insertQuery = `
            INSERT INTO assessment_criterias (name, max_marks, year, quarter, subject, class)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(insertQuery, [
            name,
            max_marks,
            year,
            quarter,
            subject,
            classname
        ]);

        const acId = result.insertId; // Get the newly inserted AC ID

        // Insert LO-AC mappings
        const mappingQuery = `
            INSERT INTO lo_ac_mapping (lo, ac, priority, weight)
            VALUES (?, ?, NULL, NULL)
        `;

        for (const lo of lo_id) {
            await db.execute(mappingQuery, [lo, acId]); // Insert each mapping
        }

        return res.status(201).json({
            message: 'Assessment criterion added successfully with LO mappings',
            insertedId: acId,
        });
    } catch (err) {
        console.error('Error inserting assessment criteria:', err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Duplicate entry. This assessment criterion already exists.',
            });
        }

        return res.status(500).json({
            message: 'Server error while inserting assessment criteria',
            error: err.message,
        });
    }
};


// Update Assessment Criteria
const updateAssessmentCriteria = async (req, res) => {
    const { id } = req.params; // Get AC ID from URL params
    const { name, max_marks, lo_id } = req.body;

    // Validate required fields
    if (!id || !name || !max_marks || !lo_id || !Array.isArray(lo_id)) {
        return res.status(400).json({
            message: 'Missing or invalid required fields. Ensure id (params), name, max_marks, and lo_id (array in body) are provided.',
        });
    }

    try {
        // Update assessment_criteria details
        const updateQuery = `
            UPDATE assessment_criterias
            SET name = ?, max_marks = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(updateQuery, [name, max_marks, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Assessment criterion not found or no changes made.',
            });
        }

        // Remove existing mappings for this AC
        const deleteMappingQuery = `DELETE FROM lo_ac_mapping WHERE ac = ?`;
        await db.execute(deleteMappingQuery, [id]);

        // Insert new LO-AC mappings
        const insertMappingQuery = `
            INSERT INTO lo_ac_mapping (lo, ac, priority, weight)
            VALUES (?, ?, NULL, NULL)
        `;

        for (const lo of lo_id) {
            await db.execute(insertMappingQuery, [lo, id]);
        }

        return res.status(200).json({
            message: 'Assessment criterion updated successfully with new LO mappings',
        });
    } catch (err) {
        console.error('Error updating assessment criteria:', err);
        return res.status(500).json({
            message: 'Server error while updating assessment criteria',
            error: err.message,
        });
    }
};


// Delete Assessment Criteria
const deleteAssessmentCriteria = async (req, res) => {
    const { id } = req.params; // Get ID from request params

    if (!id) {
        return res.status(400).json({
            message: 'Missing assessment criterion ID in the request.',
        });
    }

    try {
        const deleteQuery = `
            DELETE FROM assessment_criterias WHERE id = ?
        `;

        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Assessment criterion not found.',
            });
        }

        return res.status(200).json({
            message: 'Assessment criterion deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting assessment criteria:', err);
        return res.status(500).json({
            message: 'Server error while deleting assessment criteria',
            error: err.message,
        });
    }
};

export { 
    getAssessmentCriterias, 
    createAssessmentCriteria, 
    updateAssessmentCriteria, 
    deleteAssessmentCriteria 
};