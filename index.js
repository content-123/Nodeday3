const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to MongoDB (replace 'your_database' and 'your_password' with your actual database credentials)
mongoose.connect('mongodb://localhost/Database1', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mentor Schema
const mentorSchema = new mongoose.Schema({
  name: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const Mentor = mongoose.model('Mentor', mentorSchema);

// Define Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});

const Student = mongoose.model('Student', studentSchema);

// API to create Mentor
app.post('/mentors', async (req, res) => {
  const { name } = req.body;
  const mentor = new Mentor({ name });
  await mentor.save();
  res.json({ message: 'Mentor created successfully', mentor });
});

// API to create Student
app.post('/students', async (req, res) => {
  const { name } = req.body;
  const student = new Student({ name });
  await student.save();
  res.json({ message: 'Student created successfully', student });
});

// API to Assign a student to Mentor
app.post('/assign/:mentorId/:studentId', async (req, res) => {
    try{
  const { mentorId, studentId } = req.params;
  console.log('Received request to assign:', { mentorId, studentId });

  const mentor = await Mentor.findById(mentorId);
  const student = await Student.findById(studentId);

  if (!mentor || !student) {
    return res.status(404).json({ error: 'Mentor or Student not found' });
  }

  mentor.students.push(student);
  student.mentor = mentor;

  await mentor.save();
  await student.save();

  res.json({ message: 'Student assigned to Mentor successfully', mentor, student });
}
catch (error) {
    console.error('Error in /assign route:', error);
    res.status(500).json({ error: 'Internal server error' });

}});

// API to show all students for a particular mentor
app.get('/mentor/:mentorId/students', async (req, res) => {
  const { mentorId } = req.params;

  const mentor = await Mentor.findById(mentorId).populate('students');

  if (!mentor) {
    return res.status(404).json({ error: 'Mentor not found' });
  }

  res.json(mentor.students);
});

// API to show the previously assigned mentor for a particular student
app.get('/student/:studentId/mentor', async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId).populate('mentor');

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json(student.mentor);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
