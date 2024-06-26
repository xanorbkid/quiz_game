document.addEventListener('DOMContentLoaded', () => {
    const startQuizButton = document.getElementById('start-quiz');
    const submitQuizButton = document.getElementById('submit-quiz');
    let timer;
    let timeLeft;
    let score = 0;
    let questions = [];

    startQuizButton.addEventListener('click', async () => {
        const questionType = document.getElementById('question-type').value;
        const questionCount = document.getElementById('question-count').value;
        questions = await getRandomQuestions(questionType, questionCount);
        displayQuestions(questions);
        startTimer(questions.length * 30); // 30 seconds per question
        document.getElementById('quiz-settings').style.display = 'none';
        document.getElementById('quiz-questions').style.display = 'block';
        document.getElementById('quiz-timer').style.display = 'block';
        document.getElementById('submit-quiz').style.display = 'block';
    });

    submitQuizButton.addEventListener('click', () => {
        clearInterval(timer);
        calculateScore();
        displayResult();
    });

    // Read the Question.json file
    async function readJSONFile(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    // Randomize the questions
    async function getRandomQuestions(type, num) {
        const data = await readJSONFile('questions.json');
        let questions = [];
        if (type === 'all') {
            Object.values(data).forEach(category => {
                questions = questions.concat(Object.values(category));
            });
        } else {
            questions = Object.values(data[type]);
        }
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, num);

        return questions;
    }

    // Function to display questions
    function displayQuestions(questions) {
        const quizQuestionsDiv = document.getElementById('quiz-questions');
        quizQuestionsDiv.innerHTML = '';
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');
            questionDiv.innerHTML = `
                <h5>Question ${index + 1}: ${question.question}</h5>
                ${Object.entries(question.choices).map(([key, value]) => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="question${index}" id="question${index}-${key}" value="${key}">
                        <label class="form-check-label" for="question${index}-${key}">
                            ${value}
                        </label>
                    </div>
                `).join('')}
                <input type="hidden" name="correctAnswer${index}" value="${question.correctAnswer}">
            `;
            quizQuestionsDiv.appendChild(questionDiv);
        });
    }

    function startTimer(duration) {
        const timeLeftSpan = document.getElementById('time-left');
        timeLeft = duration;
        timeLeftSpan.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                calculateScore();
                displayResult();
            }
        }, 1000);
    }

    function calculateScore() {
        const questions = document.querySelectorAll('.question');
        score = 0;  // Reset the score before calculating
        questions.forEach((question, index) => {
            const selectedAnswer = question.querySelector(`input[name="question${index}"]:checked`);
            const correctAnswerElement = question.querySelector(`input[name="correctAnswer${index}"]`);
            if (selectedAnswer && correctAnswerElement) {
                const correctAnswer = correctAnswerElement.value;
                if (selectedAnswer.value === correctAnswer) {
                    score++;
                }
            } else {
                console.error(`Correct answer input not found for question ${index} or no answer selected.`);
            }
        });
    }

    function displayResult() {
        const quizResultDiv = document.getElementById('quiz-result');
        const totalQuestions = questions.length;
        quizResultDiv.innerHTML = `Your score is <b>${score}</b> out of <b>${totalQuestions}</b> <br>
            <div class="mt-4">
                <a href="index.html" class="btn btn-info ">Go to Home</a>
            </div> `;
        quizResultDiv.style.display = 'block';
        document.getElementById('quiz-questions').style.display = 'none';
        document.getElementById('quiz-timer').style.display = 'none';
        document.getElementById('submit-quiz').style.display = 'none';
    }
});
