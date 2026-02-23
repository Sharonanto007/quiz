// Quiz Application with API Integration
const API_URL = window.location.origin;

let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let quizQuestions = [];
let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;

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

// Load quiz data from API
async function loadQuizData() {
    try {
        showLoading('Loading quiz data...');
        const response = await fetch(`${API_URL}/api/questions`);
        const data = await response.json();
        
        if (data.success) {
            quizData = data.data;
            document.getElementById('totalQuestions').textContent = quizData.length;
            console.log(`✅ Loaded ${quizData.length} questions from API`);
        } else {
            throw new Error('Failed to load quiz data');
        }
        hideLoading();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        hideLoading();
        alert('Error loading quiz data. Please refresh the page.');
    }
}

// Show loading indicator
function showLoading(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(15, 23, 42, 0.95);
        padding: 30px 50px;
        border-radius: 16px;
        border: 2px solid #3b82f6;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    `;
    loadingDiv.innerHTML = `
        <div style="color: #3b82f6; font-size: 40px; margin-bottom: 15px;">⏳</div>
        <div style="color: #f1f5f9; font-size: 18px; font-weight: 600;">${message}</div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
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
async function startQuiz() {
    const selectedMode = document.querySelector('input[name="quizMode"]:checked').value;
    
    try {
        showLoading('Preparing your quiz...');
        
        if (selectedMode === 'all') {
            quizQuestions = [...quizData];
        } else {
            const start = parseInt(startQuestionInput.value);
            const end = parseInt(endQuestionInput.value);
            
            if (start < 1 || end > quizData.length || start >= end) {
                hideLoading();
                alert('Please enter valid question range');
                return;
            }
            
            // Fetch range from API
            const response = await fetch(`${API_URL}/api/questions/range/${start}/${end}`);
            const data = await response.json();
            
            if (data.success) {
                quizQuestions = data.data;
            } else {
                throw new Error('Failed to load question range');
            }
        }

        // Shuffle questions
        quizQuestions = shuffleArray(quizQuestions);
        
        // Shuffle options for each question and track correct answers
        quizQuestions = quizQuestions.map(question => {
            const optionsArray = Object.entries(question.options);
            const shuffledOptions = shuffleArray(optionsArray);
            
            const newOptions = {};
            const letters = ['A', 'B', 'C', 'D'];
            let newCorrectAnswer = '';
            
            shuffledOptions.forEach(([originalKey, value], index) => {
                const newKey = letters[index];
                newOptions[newKey] = value;
                
                if (originalKey === question.correct_answer) {
                    newCorrectAnswer = newKey;
                }
            });
            
            return {
                ...question,
                options: newOptions,
                correct_answer: newCorrectAnswer
            };
        });

        currentQuestionIndex = 0;
        userAnswers = new Array(quizQuestions.length).fill(null);
        score = 0;
        elapsedSeconds = 0;

        totalQuestionsCounter.textContent = quizQuestions.length;
        
        hideLoading();
        startTimer();
        createQuestionTracker();
        switchScreen(quizScreen);
        displayQuestion();
    } catch (error) {
        hideLoading();
        console.error('Error starting quiz:', error);
        alert('Error starting quiz. Please try again.');
    }
}

// Display current question
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    
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
        
        optionDiv.innerHTML = `
            <div class="option-letter">${key}</div>
            <div class="option-text">${value}</div>
        `;
        
        // If already answered, show the result
        if (!isAnswered) {
            optionDiv.addEventListener('click', () => selectOption(key));
        } else {
            optionDiv.style.pointerEvents = 'none';
            // Show previous answer with correct/incorrect styling
            checkAndDisplayPreviousAnswer(key, optionDiv);
        }
        
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update button states
    updateNavigationButtons();
    updateQuestionTracker();
}

// Check and display previous answer when navigating back
async function checkAndDisplayPreviousAnswer(optionKey, optionDiv) {
    const userAnswer = userAnswers[currentQuestionIndex];
    const questionId = quizQuestions[currentQuestionIndex].id;
    
    try {
        const response = await fetch(`${API_URL}/api/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionId: questionId,
                answer: userAnswer
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const correctAnswer = result.data.correctAnswer;
            const isCorrect = result.data.isCorrect;
            
            if (optionKey === userAnswer) {
                optionDiv.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            
            if (optionKey === correctAnswer) {
                optionDiv.classList.add('correct');
            }
        }
    } catch (error) {
        console.error('Error checking previous answer:', error);
        if (optionKey === userAnswer) {
            optionDiv.classList.add('selected');
        }
    }
}

// Select option and check answer immediately
async function selectOption(selectedKey) {
    // Prevent multiple selections
    if (userAnswers[currentQuestionIndex] !== null) {
        return; // Already answered
    }
    
    userAnswers[currentQuestionIndex] = selectedKey;
    
    try {
        // Check answer with API
        const questionId = quizQuestions[currentQuestionIndex].id;
        const response = await fetch(`${API_URL}/api/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionId: questionId,
                answer: selectedKey
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const isCorrect = result.data.isCorrect;
            const correctAnswer = result.data.correctAnswer;
            
            // Update score if correct
            if (isCorrect) {
                score++;
                currentScoreEl.textContent = score;
            }
            
            // Update UI with feedback
            document.querySelectorAll('.option').forEach(opt => {
                opt.style.pointerEvents = 'none'; // Disable further clicks
                
                if (opt.dataset.option === selectedKey) {
                    if (isCorrect) {
                        opt.classList.add('correct');
                    } else {
                        opt.classList.add('incorrect');
                    }
                }
                
                // Always show the correct answer
                if (opt.dataset.option === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
            
            // Show feedback message
            showFeedbackMessage(isCorrect, correctAnswer);
        }
    } catch (error) {
        console.error('Error checking answer:', error);
        // Fallback: just mark as selected
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.option === selectedKey) {
                opt.classList.add('selected');
            }
        });
    }
    
    updateQuestionTracker();
    updateNavigationButtons();
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Question Tracker functions
function createQuestionTracker() {
    const questionGrid = document.getElementById('questionGrid');
    questionGrid.innerHTML = '';
    
    quizQuestions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'question-tracker-btn';
        btn.textContent = index + 1;
        btn.dataset.questionIndex = index;
        
        btn.addEventListener('click', () => {
            currentQuestionIndex = index;
            displayQuestion();
            updateQuestionTracker();
        });
        
        questionGrid.appendChild(btn);
    });
    
    updateQuestionTracker();
}

function updateQuestionTracker() {
    const buttons = document.querySelectorAll('.question-tracker-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('answered', 'current', 'unanswered');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        } else if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        } else {
            btn.classList.add('unanswered');
        }
    });
}

// Show feedback message
function showFeedbackMessage(isCorrect, correctAnswer) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-message';
    feedbackDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isCorrect ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)'};
        color: white;
        padding: 20px 40px;
        border-radius: 12px;
        font-size: 20px;
        font-weight: 700;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        animation: fadeInOut 2s ease-in-out;
    `;
    feedbackDiv.innerHTML = isCorrect 
        ? '✅ Correct!' 
        : `❌ Incorrect! Correct answer: ${correctAnswer}`;
    
    document.body.appendChild(feedbackDiv);
    
    setTimeout(() => {
        feedbackDiv.remove();
    }, 2000);
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

// Submit quiz to API
async function submitQuiz() {
    const unanswered = userAnswers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirmSubmit = confirm(
            `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirmSubmit) return;
    }
    
    stopTimer();
    
    try {
        showLoading('Submitting your quiz...');
        
        // Submit to API
        const response = await fetch(`${API_URL}/api/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answers: userAnswers
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            score = result.data.score;
            currentScoreEl.textContent = score;
            
            // Store results for review
            window.quizResults = result.data.results;
            
            hideLoading();
            showResults();
        } else {
            throw new Error('Failed to submit quiz');
        }
    } catch (error) {
        hideLoading();
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
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
    
    const results = window.quizResults || [];
    
    results.forEach((result, index) => {
        const question = quizQuestions[index];
        const isCorrect = result.isCorrect;
        
        const reviewDiv = document.createElement('div');
        reviewDiv.className = `review-question ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let optionsHTML = '';
        Object.entries(question.options).forEach(([key, value]) => {
            let optionClass = 'review-option';
            
            if (key === result.correctAnswer) {
                optionClass += ' correct-answer';
            }
            if (key === result.userAnswer && key !== result.correctAnswer) {
                optionClass += ' user-answer';
            }
            
            optionsHTML += `
                <div class="${optionClass}">
                    <div class="review-option-letter">${key}</div>
                    <div class="option-text">
                        ${value}
                        ${key === result.correctAnswer ? ' ✓ Correct Answer' : ''}
                        ${key === result.userAnswer && key !== result.correctAnswer ? ' ✗ Your Answer' : ''}
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
    stopTimer();
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    quizQuestions = [];
    elapsedSeconds = 0;
    window.quizResults = null;
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
        quizQuestions: quizQuestions.map(q => q.id) // Save only IDs
    }));
}

// Smooth scrolling for review
if (reviewScreen) {
    reviewScreen.addEventListener('scroll', () => {
        const header = document.querySelector('.review-header');
        if (header && reviewScreen.scrollTop > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else if (header) {
            header.style.boxShadow = 'none';
        }
    });
}

console.log('🎓 Quiz Application Initialized');
