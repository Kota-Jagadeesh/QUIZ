let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let timedOutCount = 0;
let totalTimeTaken = 0;
let timer;
let timeLeft = 15;
let answeredQuestionsCount = 0;

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

function selectRandomQuestions() {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 10);
}

function startQuiz() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    timedOutCount = 0;
    totalTimeTaken = 0;
    answeredQuestionsCount = 0;

    document.getElementById('quiz-container').style.display = 'flex';
    document.getElementById('result-container').style.display = 'none';

    document.getElementById('question').style.display = 'block';
    document.getElementById('options').style.display = 'flex';
    document.getElementById('feedback').style.display = 'block';
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('next-btn').disabled = true;

    showQuestion();
}

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

function startTimer() {
    timeLeft = 15;
    const timeSpan = document.getElementById('time');
    timeSpan.textContent = timeLeft;
    timeSpan.classList.remove('time-yellow', 'time-red');
    timeSpan.classList.add('time-green');

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timeSpan.textContent = timeLeft;

        timeSpan.classList.remove('time-green', 'time-yellow', 'time-red');
        if (timeLeft > 10) {
            timeSpan.classList.add('time-green');
        } else if (timeLeft <= 10 && timeLeft > 5) {
            timeSpan.classList.add('time-yellow');
        } else if (timeLeft <= 5 && timeLeft >= 0) {
            timeSpan.classList.add('time-red');
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(null, selectedQuestions[currentQuestionIndex].answer);
        }
    }, 1000);
}

function checkAnswer(selectedOption, correctAnswer) {
    clearInterval(timer);
    totalTimeTaken += (15 - timeLeft);

    const options = document.querySelectorAll('.option');
    options.forEach(button => {
        button.disabled = true;
        const buttonText = button.textContent;
        if (buttonText === correctAnswer) {
            button.classList.add('correct');
        }
        if (selectedOption !== null && buttonText === selectedOption && selectedOption !== correctAnswer) {
            button.classList.add('incorrect');
        }
    });

    if (selectedOption === correctAnswer) {
        document.getElementById('feedback').textContent = 'Correct! Great job!';
        correctAnswers++;
        answeredQuestionsCount++;
    } else if (selectedOption === null) {
        document.getElementById('feedback').textContent = `Time's up! The correct answer was: ${correctAnswer}`;
        timedOutCount++;
    } else {
        document.getElementById('feedback').textContent = `Incorrect! The correct answer was: ${correctAnswer}`;
        incorrectAnswers++;
        answeredQuestionsCount++;
    }

    document.getElementById('next-btn').disabled = false;
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';

    const totalQuestions = selectedQuestions.length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const avgTimePerQuestion = answeredQuestionsCount + timedOutCount > 0 ? (totalTimeTaken / (answeredQuestionsCount + timedOutCount)).toFixed(2) : 0;
    const questionsMissed = totalQuestions - correctAnswers - incorrectAnswers;

    let grade = 'Needs Practice';
    if (accuracy >= 90) {
        grade = 'Excellent!';
    } else if (accuracy >= 70) {
        grade = 'Good Job!';
    } else if (accuracy >= 50) {
        grade = 'Fair Attempt';
    }

    document.getElementById('score-correct').textContent = `${correctAnswers} / ${totalQuestions}`;
    document.getElementById('accuracy-percentage').textContent = `${accuracy.toFixed(2)}%`;
    document.getElementById('avg-time-per-q').textContent = `${avgTimePerQuestion}s`;
    document.getElementById('questions-answered').textContent = `${answeredQuestionsCount} / ${totalQuestions}`;
    document.getElementById('questions-missed').textContent = `${timedOutCount} / ${totalQuestions}`;
    document.getElementById('quiz-grade').textContent = grade;
}

document.getElementById('restart-btn').addEventListener('click', () => {
    selectRandomQuestions();
    startQuiz();
});

if (document.getElementById('quiz-container')) {
    window.onload = loadQuestions;
}