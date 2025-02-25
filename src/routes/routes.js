import express, { Router } from "express";
import {updateStudentStatus, createStudent, getStudents} from "../controllers/students.js";
import {getAssessmentCriterias, createAssessmentCriteria, updateAssessmentCriteria, deleteAssessmentCriteria } from "../controllers/assessmentCriterias.js";
import { deleteLearningOutcome, updateLearningOutcome, getLearningOutcomes, createLearningOutcome } from "../controllers/learningOutcomes.js";
import { getReportOutcomes, createReportOutcome, updateReportOutcome, deleteReportOutcome } from "../controllers/reportOutcomes.js";
import { getAssessmentCriteriaScores, setAssessmentCriteriaScore, updateAssessmentCriteriaScore } from "../controllers/assessmentCriteriasScores.js";
import getLearningOutcomesScore from "../controllers/learningOutcomesScore.js";
import getReportOutcomesScore from "../controllers/reportOutcomesScore.js";
import {getReportOutcomesMapping,updateReportOutcomeMapping} from "../controllers/reportOutcomesMapping.js";
// import { getClassAverageACScore, getClassAverageLOScore, getClassAverageROScore } from "../controllers/classAverageScore.js";
import { getLearningOutcomesMapping, updateLearningOutcomeMapping } from "../controllers/learningOutcomesMapping.js";
import getTeachers from "../controllers/teachers.js";
// import { saveToken, sendNotification } from "../controllers/sendNotification.js";


const routers = express.Router();

routers.get('/students',getStudents)


routers.get("/teachers", getTeachers);
routers.get('/assessment-criteria',getAssessmentCriterias)
routers.get('/learning-outcome',getLearningOutcomes)
routers.get('/report-outcome',getReportOutcomes)
routers.get('/report-outcome',createReportOutcome)
routers.get('/report-outcome',updateReportOutcome)
routers.get('/assessment-criteria-score',getAssessmentCriteriaScores)
routers.get('/learning-outcome-score',getLearningOutcomesScore)
routers.get('/report-outcome-score',getReportOutcomesScore)
// routers.get('/class-average-ac-score',getClassAverageACScore)
// routers.get('/class-average-lo-score',getClassAverageLOScore)
// routers.get('/class-average-ro-score',getClassAverageROScore)
routers.get('/learning-outcome-mapping',getLearningOutcomesMapping)
routers.get('/report-outcome-mapping',getReportOutcomesMapping)



routers.post('/students',createStudent)
routers.post('/assessment-criteria',createAssessmentCriteria)
routers.post('/learning-outcome',createLearningOutcome)
routers.post('/assessment-criteria-score',setAssessmentCriteriaScore)
routers.post('/learning-outcome-mapping',getLearningOutcomesMapping)
// routers.post('/save-token',saveToken)
// routers.post('/send-notifications',sendNotification)
// routers.post('/verify-token',verifyToken)

routers.put('/students',updateStudentStatus)
routers.put('/assessmentCriteriasScores.js', updateAssessmentCriteriaScore)
routers.put('/assessment-criteria', updateAssessmentCriteria)
routers.put('/learning-outcome', updateLearningOutcome)
routers.put('/learning-outcome-mapping', updateLearningOutcomeMapping)
routers.put('/report-outcome-mapping',updateReportOutcomeMapping)


routers.delete('/assessment-criteria' ,deleteAssessmentCriteria)
routers.delete('/learning-outcome', deleteLearningOutcome)
routers.delete('/report-outcomes', deleteReportOutcome)
export default routers;