import db from "../config/db.js";

// Get Assessment Criterias
const getAssessmentCriterias = async (req, res) => {
    const { subject, year, quarter, classname } = req.headers; // Extract headers

    console.log(`Subject: ${subject}, Year: ${year}, Quarter: ${quarter}, Class: ${classname}`);

    if (!subject || !year || !quarter || !classname) {
        return res.status(400).json({
            message: 'Invalid input. Subject, Class, Year, and Quarter are required in the headers.',
        });
    }

    try {
        const query = `
            SELECT id, name, max_marks, lo_id
            FROM assessment_criterias
            WHERE subject = ? AND year = ? AND quarter = ? AND class = ?
        `;

        const [results] = await db.execute(query, [subject, year, quarter, classname]);

        if (results.length === 0) {
            return res.status(404).json({
                message: 'No assessment criterias found for the given filters.',
            });
        }

        return res.status(200).json({
            message: 'Assessment criterias retrieved successfully',
            assessments: results,
        });
    } catch (err) {
        console.error('Error retrieving assessment criterias:', err);
        return res.status(500).json({
            message: 'Server error while fetching assessment criterias',
            error: err.message,
        });
    }
};

// Create Assessment Criteria
const createAssessmentCriteria = async (req, res) => {
    const { year, quarter, subject, classname } = req.headers;
    const { max_marks, name, lo_id } = req.body;

    if (!year || !quarter || !subject || !classname || !max_marks || !name || !lo_id) {
        return res.status(400).json({
            message: 'Missing required fields. Ensure year, quarter, class, subject (headers), and max_marks, name, lo_id (body) are provided.',
        });
    }

    try {
        const insertQuery = `
            INSERT INTO assessment_criterias (name, max_marks, year, quarter, subject, class, lo_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(insertQuery, [
            name,
            max_marks,
            year,
            quarter,
            subject,
            classname,
            lo_id
        ]);

        return res.status(201).json({
            message: 'Assessment criterion added successfully',
            insertedId: result.insertId,
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
    const { id } = req.params; // Get ID from request params
    const { name, max_marks, lo_id } = req.body;

    if (!id || !name || !max_marks || !lo_id) {
        return res.status(400).json({
            message: 'Missing required fields. Ensure id (params), name, max_marks, and lo_id (body) are provided.',
        });
    }

    try {
        const updateQuery = `
            UPDATE assessment_criterias
            SET name = ?, max_marks = ?, lo_id = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(updateQuery, [name, max_marks, lo_id, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Assessment criterion not found or no changes made.',
            });
        }

        return res.status(200).json({
            message: 'Assessment criterion updated successfully',
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