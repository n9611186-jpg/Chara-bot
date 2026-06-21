const screamSound = new Audio("scream.mp3");
screamSound.preload = "auto";
// Замедляем трек, чтобы он тянулся дольше, стал басовее и не давал провалов
screamSound.playbackRate = 0.72; 

const phrases = ["* Приветствую.", "* Я Чара.", "* Спасибо тебе.", "* Твоя сила пробудила меня от смерти.", "* Давай сотрем этот бесполезный мир..."];
let currentLine = 0, isTyping = false, typingTimeout, dialogStarted = false, isChoicePhase = false, finalBranch = "", finalStep = 0;
const dialogBox = document.getElementById('dialogBox'), dialogText = document.getElementById('dialogText'), choicesBox = document.getElementById('choicesBox'), charaImg = document.getElementById('charaImg');

function typeText(t, i = 0, c = null) {
    if (i < t.length) { isTyping = true; dialogText.textContent += t[i]; typingTimeout = setTimeout(() => typeText(t, i + 1, c), 40); }
    else { isTyping = false; if (c) c(); }
}
function handleCharaClick() {
    if (isChoicePhase) return;
    if (!dialogStarted) { dialogStarted = true; dialogBox.style.display = "block"; choicesBox.style.display = "none"; dialogText.textContent = ""; currentLine = 0; typeText(phrases); }
    else { advanceDialog(); }
}
function advanceDialog() {
    if (isChoicePhase) return;
    if (isTyping) { clearTimeout(typingTimeout); dialogText.textContent = phrases[currentLine]; isTyping = false; if (currentLine === phrases.length - 1) showChoices(); return; }
    currentLine++;
    if (currentLine < phrases.length) { dialogText.textContent = ""; typeText(phrases[currentLine], 0, () => { if (currentLine === phrases.length - 1) showChoices(); }); }
}
function showChoices() { isChoicePhase = true; choicesBox.style.display = "flex"; }
function makeChoice(a) {
    choicesBox.style.display = "none"; dialogText.textContent = ""; finalBranch = a; finalStep = 1;
    screamSound.volume = 0; screamSound.play().then(() => { screamSound.pause(); screamSound.currentTime = 0; }).catch(e => console.log(e));
    if (a === 'erase') { typeText("* Именно. Ты отличный партнер."); } else { typeText("* Нет?..."); }
}
function handleDialogClick() {
    if (!isChoicePhase) { advanceDialog(); return; }
    if (isTyping) {
        clearTimeout(typingTimeout);
        if (finalBranch === 'erase') dialogText.textContent = "* Именно. Ты отличный партнер.";
        else if (finalBranch === 'do_not' && finalStep === 1) dialogText.textContent = "* Нет?...";
        else if (finalBranch === 'do_not' && finalStep === 2) dialogText.textContent = "* С каких это пор ты здесь главный?";
        isTyping = false; return;
    }
    if (finalBranch === 'erase' && finalStep === 1) { triggerChaos(); }
    else if (finalBranch === 'do_not') {
        if (finalStep === 1) { finalStep = 2; dialogText.textContent = ""; typeText("* С каких это пор ты здесь главный?"); }
        else if (finalStep === 2) { triggerChaos(); }
    }
}
function triggerChaos() {
    screamSound.volume = 1; 
    screamSound.play().catch(err => console.log(err));
    
    dialogBox.style.display = "none"; 
    choicesBox.style.display = "none"; 
    charaImg.src = "Scary.webp";
    
    let scale = 1.0; 
    const maxScale = 3.5, step = 0.03;
    const zoomInterval = setInterval(() => { if (scale < maxScale) { scale += step; charaImg.style.transform = `scale(${scale})`; } else { clearInterval(zoomInterval); } }, 50);
    
    setTimeout(() => { document.body.classList.add("flash-red", "shake-screen"); }, 250);
    
    setTimeout(() => { 
        clearInterval(zoomInterval); 
        screamSound.pause(); 
        screamSound.currentTime = 0; 
        document.body.classList.remove("flash-red", "shake-screen"); 
        charaImg.style.transform = "scale(1)"; 
        charaImg.src = "Chara.png"; 
        document.body.style.backgroundColor = "black"; 
        resetGame(); 
    }, 4000); // 4 секунды тотального хоррора
}
function resetGame() { currentLine = 0; isTyping = false; dialogStarted = false; isChoicePhase = false; finalBranch = ""; finalStep = 0; dialogBox.style.display = "none"; choicesBox.style.display = "none"; }
