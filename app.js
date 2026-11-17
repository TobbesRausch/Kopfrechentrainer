const settingsCard = document.querySelector('.settings');
const trainingCard = document.querySelector('#training');
const startButton = document.querySelector('#start-button');
const backButton = document.querySelector('#back-button');
const answerForm = document.querySelector('#answer-form');
const answerInput = document.querySelector('#answer');
const errorMessage = document.querySelector('#settings-error');
const feedback = document.querySelector('#feedback');
const operationGlyph = { '+': '+', '-': '−', '*': '×', '/': '÷' };
let currentAnswer = 0;
let questionNumber = 0;
let correctCount = 0;
let range = { min: 1, max: 20 };
let operations = [];
let nextQuestionTimer;

function playTone(isCorrect) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = new AudioContextClass();
  const notes = isCorrect ? [660, 880] : [240, 180];
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const startAt = audio.currentTime + index * 0.13;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.11);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.12);
  });
  window.setTimeout(() => audio.close(), 500);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newQuestion() {
  window.clearTimeout(nextQuestionTimer);
  const operation = operations[randomInt(0, operations.length - 1)];
  let a = randomInt(range.min, range.max);
  let b = randomInt(range.min, range.max);
  if (operation === '-' && b > a) [a, b] = [b, a];
  if (operation === '/') {
    // Keep division friendly: every division has a whole-number answer.
    const divisor = Math.max(1, b);
    const maxMultiplier = Math.floor(range.max / divisor);
    if (maxMultiplier < 1) {
      b = 1;
      a = randomInt(range.min, range.max);
      currentAnswer = a;
    } else {
      const multiplier = randomInt(1, maxMultiplier);
      a = divisor * multiplier;
      currentAnswer = multiplier;
    }
  } else if (operation === '+') currentAnswer = a + b;
  else if (operation === '-') currentAnswer = a - b;
  else currentAnswer = a * b;

  document.querySelector('#question').textContent = `${a} ${operationGlyph[operation]} ${b} = ?`;
  document.querySelector('#progress').textContent = `Aufgabe ${questionNumber}`;
  answerInput.value = '';
  feedback.textContent = '';
  feedback.classList.remove('wrong');
  answerInput.focus();
}

startButton.addEventListener('click', () => {
  operations = [...document.querySelectorAll('input[name="operation"]:checked')].map(input => input.value);
  const min = Number(document.querySelector('#min-number').value);
  const max = Number(document.querySelector('#max-number').value);
  errorMessage.hidden = true;
  if (!operations.length) {
    errorMessage.textContent = 'Wähle mindestens eine Rechenart aus.';
    errorMessage.hidden = false;
    return;
  }
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min || max > 9999) {
    errorMessage.textContent = 'Gib einen gültigen Bereich von 0 bis 9999 ein.';
    errorMessage.hidden = false;
    return;
  }
  range = { min, max };
  questionNumber = 1;
  correctCount = 0;
  document.querySelector('#score').textContent = correctCount;
  settingsCard.hidden = true;
  trainingCard.hidden = false;
  newQuestion();
});

answerForm.addEventListener('submit', event => {
  event.preventDefault();
  if (Number(answerInput.value) === currentAnswer) {
    correctCount++;
    document.querySelector('#score').textContent = correctCount;
    feedback.textContent = 'Richtig! Gut gemacht.';
    feedback.classList.remove('wrong');
    playTone(true);
    questionNumber++;
    nextQuestionTimer = window.setTimeout(newQuestion, 650);
  } else {
    feedback.textContent = 'Noch nicht ganz – probier es nochmal.';
    feedback.classList.add('wrong');
    playTone(false);
    answerInput.select();
  }
});

document.querySelector('#skip-button').addEventListener('click', () => {
  questionNumber++;
  newQuestion();
});

backButton.addEventListener('click', () => {
  trainingCard.hidden = true;
  settingsCard.hidden = false;
  document.querySelector('#start-button').focus();
});
