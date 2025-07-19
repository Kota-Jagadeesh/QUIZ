let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let totalTime = 0;
let timer;
let timeLeft = 15;

// fetchess the questions from json file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        questions = await response.json();
        selectRandomQuestions();
        startQuiz();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question').textContent = 'Error loading questions. Please check the questions.json file.';
        document.getElementById('options').innerHTML = '';
        document.getElementById('next-btn').style.display = 'none';
    }
}

// selects 10 random unique questions
function selectRandomQuestions() {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 10);
}

// startss the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    totalTime = 0;
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('question').style.display = 'block';
    document.getElementById('options').style.display = 'block';
    document.getElementById('feedback').style.display = 'block';
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('next-btn').disabled = true; // Ensure button is disabled at start
    showQuestion();
}

// displays  the current question
function showQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        showResults();
        return;
    }
    const question = selectedQuestions[currentQuestionIndex];
    document.getElementById('question').textContent = question.question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('next-btn').disabled = true;

    question.options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => checkAnswer(option, question.answer));
        optionsDiv.appendChild(button);
    });

    startTimer();
}

// starts the timer for each question
function startTimer() {
    timeLeft = 15;
    document.getElementById('time').textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(null, selectedQuestions[currentQuestionIndex].answer);
        }
    }, 1000);
}

// cheks for the user's answer
function checkAnswer(selectedOption, correctAnswer) {
    clearInterval(timer);
    totalTime += (15 - timeLeft);
    const options = document.querySelectorAll('.option');
    options.forEach(button => {
        button.disabled = true;
        const buttonText = button.textContent;
        if (buttonText === correctAnswer) {
            button.classList.add('correct');
        }
        if (buttonText === selectedOption && selectedOption !== correctAnswer) {
            button.classList.add('incorrect');
        }
    });

    if (selectedOption === correctAnswer || (selectedOption === null && timeLeft <= 0)) {
        if (selectedOption === correctAnswer) {
            document.getElementById('feedback').textContent = 'Correct!';
            correctAnswers++;
        } else {
            document.getElementById('feedback').textContent = `Time's up! Correct answer: ${correctAnswer}`;
            incorrectAnswers++;
        }
    } else {
        document.getElementById('feedback').textContent = `Incorrect! Correct answer: ${correctAnswer}`;
        incorrectAnswers++;
    }

    document.getElementById('next-btn').disabled = false;
}

// movess to the next question
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

// Shows the final results
function showResults() {
    document.getElementById('question').style.display = 'none';
    document.getElementById('options').style.display = 'none';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').textContent = `Correct: ${correctAnswers} | Incorrect: ${incorrectAnswers}`;
    document.getElementById('total-time').textContent = `Total Time: ${totalTime} seconds`;
    document.getElementById('questions-answered').textContent = `Questions Answered: ${correctAnswers + incorrectAnswers}`;
}

// Restarts the quiz
document.getElementById('restart-btn').addEventListener('click', () => {
    selectRandomQuestions();
    startQuiz();
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('next-btn').disabled = true; // resets to disabled state
});

// loads the questions when the page loads
if (document.getElementById('question')) {
    window.onload = loadQuestions;
}