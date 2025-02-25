import db from "../config/db.js";

const getTeachers = (req, res) => {
    db.query("SELECT name, status, last_seen FROM teachers", (err, results) => {
        if (err) {
            console.error("❌ Error fetching teacher list:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.status(200).json(results);
    });
};

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


// PUT: Update teacher details
const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { name, email, class: teacherClass, section, subject, role } = req.body;

    // Validate teacher ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid teacher ID." });
    }

    // Check if the teacher exists
    const [teacherExists] = await db.execute("SELECT id FROM teachers WHERE id = ?", [id]);
    if (teacherExists.length === 0) {
        return res.status(404).json({ message: "Teacher not found." });
    }

    try {
        // Construct update query dynamically
        let updateFields = [];
        let values = [];

        if (name) { updateFields.push("name = ?"); values.push(name); }
        if (email) { updateFields.push("email = ?"); values.push(email); }
        if (teacherClass) { updateFields.push("class = ?"); values.push(teacherClass); }
        if (section) { updateFields.push("section = ?"); values.push(section); }
        if (subject) { updateFields.push("subject = ?"); values.push(subject); }
        if (role) { updateFields.push("role = ?"); values.push(role); }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        values.push(id);
        const updateQuery = `UPDATE teachers SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.execute(updateQuery, values);

        res.status(200).json({ message: "Teacher updated successfully." });
    } catch (err) {
        console.error("Error updating teacher:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export {updateTeacher, getTeachers, createTeacher};

