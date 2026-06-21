const screamSound = new Audio("scream.mp3");
screamSound.preload = "auto";

const phrases = [
    "* Приветствую.",
    "* Я Чара.",
    "* Спасибо тебе.",
    "* Твоя сила пробудила меня от смерти.",
    "* Давай сотрем этот бесполезный мир..."
];

let currentLine = 0, isTyping = false, typingTimeout, dialogStarted = false, isChoicePhase = false, finalBranch = "", finalStep = 0;
const dialogBox = document.getElementById('dialogBox'), dialogText = document.getElementById('dialogText'), choicesBox = document.getElementById('choicesBox'), charaImg = document.getElementById('charaImg');
const charaBtn = document.getElementById('charaBtn'), eraseBtn = document.getElementById('eraseBtn'), dontBtn = document.getElementById('dontBtn');

function typeText(text, index, callback) {
    if (index < text.length) {
        isTyping = true;
        dialogText.textContent += text[index];
        typingTimeout = setTimeout(() => typeText(text, index + 1, callback), 40);
    } else {
        isTyping = false;
        if (callback) callback();
    }
}

function handleCharaClick() {
    if (isChoicePhase) return;
    if (!dialogStarted) {
        dialogStarted = true;
        dialogBox.style.display = "block";
        choicesBox.style.display = "none";
        dialogText.textContent = "";
        currentLine = 0;
        typeText(phrases[currentLine], 0, null); 
    } else {
        advanceDialog();
    }
}

function advanceDialog() {
    if (isChoicePhase) return;
    if (isTyping) {
        clearTimeout(typingTimeout);
        dialogText.textContent = phrases[currentLine];
        isTyping = false;
        if (currentLine === phrases.length - 1) showChoices();
        return;
    }
    currentLine++;
    if (currentLine < phrases.length) {
        dialogText.textContent = "";
        typeText(phrases[currentLine], 0, () => {
            if (currentLine === phrases.length - 1) showChoices();
        });
    }
}

function showChoices() {
    isChoicePhase = true;
    choicesBox.style.display = "flex";
}

function makeChoice(answer) {
    choicesBox.style.display = "none";
    dialogText.textContent = "";
    finalBranch = answer;
    finalStep = 1;

    screamSound.volume = 0;
    screamSound.play().then(() => {
        screamSound.pause();
        screamSound.currentTime = 0;
    }).catch(e => console.log(e));

    if (answer === 'erase') {
        typeText("* Именно. Ты отличный партнер.", 0, null);
    } else {
        typeText("* Нет?...", 0, null);
    }
}

function handleDialogClick() {
    if (!isChoicePhase) {
        advanceDialog();
        return;
    }
    if (isTyping) {
        clearTimeout(typingTimeout);
        if (finalBranch === 'erase') dialogText.textContent = "* Именно. Ты отличный партнер.";
        else if (finalBranch === 'do_not' && finalStep === 1) dialogText.textContent = "* Нет?...";
        else if (finalBranch === 'do_not' && finalStep === 2) dialogText.textContent = "* С каких это пор ты здесь главный?";
        isTyping = false;
        return;
    }
    if (finalBranch === 'erase' && finalStep === 1) {
        triggerChaos();
    } else if (finalBranch === 'do_not') {
        if (finalStep === 1) {
            finalStep = 2;
            dialogText.textContent = "";
            typeText("* С каких это пор ты здесь главный?", 0, null);
        } else if (finalStep === 2) {
            triggerChaos();
        }
    }
}

function triggerChaos() {
    screamSound.volume = 1; 
    screamSound.play().catch(err => console.log(err));
    dialogBox.style.display = "none"; 
    choicesBox.style.display = "none"; 
    charaImg.src = "Scary.webp";
    
    let scale = 1.0; const maxScale = 3.5, step = 0.045; 
    const zoomInterval = setInterval(() => { if (scale < maxScale) { scale += step; charaImg.style.transform = `scale(${scale})`; } else { clearInterval(zoomInterval); } }, 50);
    setTimeout(() => { document.body.classList.add("flash-red", "shake-screen"); }, 250);
    setTimeout(() => { 
        clearInterval(zoomInterval); 
        screamSound.pause(); screamSound.currentTime = 0; 
        document.body.classList.remove("flash-red", "shake-screen"); 
        charaImg.style.transform = "scale(1)"; charaImg.src = "Chara.png"; 
        document.body.style.backgroundColor = "black"; 
        resetGame(); 
    }, 3000);
}

function resetGame() {
    currentLine = 0; isTyping = false; dialogStarted = false; isChoicePhase = false; finalBranch = ""; finalStep = 0;
    dialogBox.style.display = "none"; choicesBox.style.display = "none"; dialogText.textContent = "";
}

// Связываем кнопки и клики напрямую через скрипт
charaBtn.addEventListener('click', handleCharaClick);
dialogBox.addEventListener('click', handleDialogClick);
eraseBtn.addEventListener('click', () => makeChoice('erase'));
dontBtn.addEventListener('click', () => makeChoice('do_not'));
