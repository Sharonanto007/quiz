const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for development
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Load quiz data
let quizData = [];
try {
    const data = fs.readFileSync(path.join(__dirname, 'quiz_data.json'), 'utf8');
    quizData = JSON.parse(data);
    console.log(`✅ Loaded ${quizData.length} questions`);
} catch (error) {
    console.error('❌ Error loading quiz data:', error);
}

// API Routes

// Get all questions (without answers for security)
app.get('/api/questions', (req, res) => {
    try {
        // Remove correct answers from response for security
        const questionsWithoutAnswers = quizData.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
        
        res.json({
            success: true,
            count: questionsWithoutAnswers.length,
            data: questionsWithoutAnswers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching questions'
        });
    }
});

// Get a specific question by ID (without answer)
app.get('/api/questions/:id', (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        const question = quizData.find(q => q.id === questionId);
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        // Remove correct answer
        const { correct_answer, ...questionData } = question;
        
        res.json({
            success: true,
            data: questionData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching question'
        });
    }
});

// Get questions by range
app.get('/api/questions/range/:start/:end', (req, res) => {
    try {
        const start = parseInt(req.params.start) - 1; // Convert to 0-indexed
        const end = parseInt(req.params.end);
        
        if (start < 0 || end > quizData.length || start >= end) {
            return res.status(400).json({
                success: false,
                error: 'Invalid range'
            });
        }
        
        const rangeQuestions = quizData.slice(start, end).map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
        
        res.json({
            success: true,
            count: rangeQuestions.length,
            data: rangeQuestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching questions'
        });
    }
});

// Submit quiz and get results
app.post('/api/submit', (req, res) => {
    try {
        const { answers } = req.body;
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission format'
            });
        }
        
        let score = 0;
        const results = [];
        
        answers.forEach((answer, index) => {
            const question = quizData[index];
            if (!question) return;
            
            const isCorrect = answer === question.correct_answer;
            if (isCorrect) score++;
            
            results.push({
                id: question.id,
                userAnswer: answer,
                correctAnswer: question.correct_answer,
                isCorrect: isCorrect
            });
        });
        
        const percentage = ((score / answers.length) * 100).toFixed(2);
        
        res.json({
            success: true,
            data: {
                score: score,
                total: answers.length,
                percentage: percentage,
                results: results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error processing submission'
        });
    }
});

// Check single answer
app.post('/api/check', (req, res) => {
    try {
        const { questionId, answer } = req.body;
        
        const question = quizData.find(q => q.id === questionId);
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        const isCorrect = answer === question.correct_answer;
        
        res.json({
            success: true,
            data: {
                isCorrect: isCorrect,
                correctAnswer: question.correct_answer
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error checking answer'
        });
    }
});

// Get quiz statistics
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalQuestions: quizData.length,
            categories: {
                diathermy: quizData.filter(q => q.question.toLowerCase().includes('diathermy')).length,
                radiation: quizData.filter(q => q.question.toLowerCase().includes('radiation')).length,
                ultrasound: quizData.filter(q => q.question.toLowerCase().includes('ultrasound')).length,
                mri: quizData.filter(q => q.question.toLowerCase().includes('mri')).length,
                ecg: quizData.filter(q => q.question.toLowerCase().includes('ecg')).length,
                electrophoresis: quizData.filter(q => q.question.toLowerCase().includes('electrophoresis')).length
            }
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error getting statistics'
        });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server (only if not in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎓 Medical Biophysics Quiz Server                       ║
║   📍 Osh State University                                 ║
║                                                            ║
║   🚀 Server running on: http://localhost:${PORT}          ║
║   📊 Total Questions: ${quizData.length}                           ║
║   ⏰ Started at: ${new Date().toLocaleString()}           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
        `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('👋 SIGTERM received. Shutting down gracefully...');
        process.exit(0);
    });
}

// Export the Express app for Vercel serverless
module.exports = app;
