// Quiz Application
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let quizQuestions = [];

// Utility function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const reviewScreen = document.getElementById('reviewScreen');

const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const reviewBtn = document.getElementById('reviewBtn');
const restartBtn = document.getElementById('restartBtn');
const backToResultsBtn = document.getElementById('backToResultsBtn');

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const currentQuestionEl = document.getElementById('currentQuestion');
const totalQuestionsCounter = document.getElementById('totalQuestionsCounter');
const progressFill = document.getElementById('progressFill');
const currentScoreEl = document.getElementById('currentScore');

const quizModeRadios = document.getElementsByName('quizMode');
const customRangeDiv = document.getElementById('customRange');
const startQuestionInput = document.getElementById('startQuestion');
const endQuestionInput = document.getElementById('endQuestion');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuizData();
    setupEventListeners();
});

// Load quiz data from JSON
async function loadQuizData() {
    try {
        const response = await fetch('quiz_data.json');
        quizData = await response.json();
        document.getElementById('totalQuestions').textContent = quizData.length;
        console.log(`Loaded ${quizData.length} questions`);
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('Error loading quiz data. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startQuiz);
    exitBtn.addEventListener('click', exitQuiz);
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitQuiz);
    reviewBtn.addEventListener('click', showReview);
    restartBtn.addEventListener('click', restartQuiz);
    backToResultsBtn.addEventListener('click', backToResults);

    quizModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customRangeDiv.classList.remove('hidden');
            } else {
                customRangeDiv.classList.add('hidden');
            }
        });
    });
}

// Start quiz
function startQuiz() {
    const selectedMode = document.querySelector('input[name="quizMode"]:checked').value;
    
    if (selectedMode === 'all') {
        quizQuestions = [...quizData];
    } else {
        const start = parseInt(startQuestionInput.value) - 1;
        const end = parseInt(endQuestionInput.value);
        
        if (start < 0 || end > quizData.length || start >= end) {
            alert('Please enter valid question range');
            return;
        }
        
        quizQuestions = quizData.slice(start, end);
    }

    // Shuffle questions randomly
    quizQuestions = shuffleArray(quizQuestions);
    
    // Shuffle options for each question while maintaining correct answer tracking
    quizQuestions = quizQuestions.map(question => {
        // Get all options as array of [key, value] pairs
        const optionsArray = Object.entries(question.options);
        
        // Shuffle the options
        const shuffledOptions = shuffleArray(optionsArray);
        
        // Create new options object with A, B, C, D keys in new shuffled order
        const newOptions = {};
        const letters = ['A', 'B', 'C', 'D'];
        let newCorrectAnswer = '';
        
        // Map shuffled options to new letters and find new correct answer position
        shuffledOptions.forEach(([originalKey, value], index) => {
            const newKey = letters[index];
            newOptions[newKey] = value;
            
            // If this was the original correct answer, store its new position
            if (originalKey === question.correct_answer) {
                newCorrectAnswer = newKey;
            }
        });
        
        // Return question with shuffled options and updated correct answer
        return {
            ...question,
            options: newOptions,
            correct_answer: newCorrectAnswer,
            original_correct_answer: question.correct_answer // Keep for debugging if needed
        };
    });

    currentQuestionIndex = 0;
    userAnswers = new Array(quizQuestions.length).fill(null);
    score = 0;

    totalQuestionsCounter.textContent = quizQuestions.length;
    
    switchScreen(quizScreen);
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    questionText.textContent = question.question;
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Display options
    optionsContainer.innerHTML = '';
    
    Object.entries(question.options).forEach(([key, value]) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.option = key;
        
        if (userAnswers[currentQuestionIndex] === key) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-letter">${key}</div>
            <div class="option-text">${value}</div>
        `;
        
        optionDiv.addEventListener('click', () => selectOption(key));
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update button states
    updateNavigationButtons();
}

// Select option
function selectOption(selectedKey) {
    userAnswers[currentQuestionIndex] = selectedKey;
    
    // Update UI
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.option === selectedKey) {
            opt.classList.add('selected');
        }
    });
    
    updateNavigationButtons();
}

// Update navigation buttons
function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
    
    if (isLastQuestion) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// Submit quiz
function submitQuiz() {
    const unanswered = userAnswers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirmSubmit = confirm(
            `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirmSubmit) return;
    }
    
    calculateScore();
    showResults();
}

// Calculate score
function calculateScore() {
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correct_answer) {
            score++;
        }
    });
    
    currentScoreEl.textContent = score;
}

// Show results
function showResults() {
    const correct = score;
    const incorrect = quizQuestions.length - score;
    const percentage = ((score / quizQuestions.length) * 100).toFixed(1);
    
    document.getElementById('finalScore').textContent = `${score}/${quizQuestions.length}`;
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('incorrectAnswers').textContent = incorrect;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    switchScreen(resultsScreen);
}

// Show review
function showReview() {
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct_answer;
        const isCorrect = userAnswer === correctAnswer;
        
        const reviewDiv = document.createElement('div');
        reviewDiv.className = `review-question ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let optionsHTML = '';
        Object.entries(question.options).forEach(([key, value]) => {
            let optionClass = 'review-option';
            
            if (key === correctAnswer) {
                optionClass += ' correct-answer';
            }
            if (key === userAnswer && key !== correctAnswer) {
                optionClass += ' user-answer';
            }
            
            optionsHTML += `
                <div class="${optionClass}">
                    <div class="review-option-letter">${key}</div>
                    <div class="option-text">
                        ${value}
                        ${key === correctAnswer ? ' ✓ Correct Answer' : ''}
                        ${key === userAnswer && key !== correctAnswer ? ' ✗ Your Answer' : ''}
                    </div>
                </div>
            `;
        });
        
        reviewDiv.innerHTML = `
            <div class="review-header-row">
                <div class="review-question-number">Question ${index + 1}</div>
                <div class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
            </div>
            <div class="review-question-text">${question.question}</div>
            <div class="review-options">${optionsHTML}</div>
        `;
        
        reviewContainer.appendChild(reviewDiv);
    });
    
    switchScreen(reviewScreen);
}

// Back to results
function backToResults() {
    switchScreen(resultsScreen);
}

// Restart quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    quizQuestions = [];
    switchScreen(welcomeScreen);
}

// Exit quiz
function exitQuiz() {
    const confirmExit = confirm('Are you sure you want to exit? Your progress will be lost.');
    if (confirmExit) {
        restartQuiz();
    }
}

// Switch screen
function switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (quizScreen.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            previousQuestion();
        } else if (e.key === 'ArrowRight') {
            if (currentQuestionIndex < quizQuestions.length - 1) {
                nextQuestion();
            }
        } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
            selectOption(e.key.toUpperCase());
        }
    }
});

// Auto-save progress to localStorage
function saveProgress() {
    localStorage.setItem('quizProgress', JSON.stringify({
        currentQuestionIndex,
        userAnswers,
        score,
        quizQuestions
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('quizProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        const resume = confirm('Do you want to resume your previous quiz?');
        if (resume) {
            currentQuestionIndex = progress.currentQuestionIndex;
            userAnswers = progress.userAnswers;
            score = progress.score;
            quizQuestions = progress.quizQuestions;
            switchScreen(quizScreen);
            displayQuestion();
        }
    }
}

// Smooth scrolling for review
reviewScreen.addEventListener('scroll', () => {
    const header = document.querySelector('.review-header');
    if (reviewScreen.scrollTop > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    } else {
        header.style.boxShadow = 'none';
    }
});
