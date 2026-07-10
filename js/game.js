/* ==========================================================================
   SISTEMA DE PARTÍCULAS DEL FONDO
   ========================================================================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * -0.8 - 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(0, 255, 102, 0.3)' : 'rgba(0, 210, 255, 0.3)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 60; i++) {
        particlesArray.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!document.body.classList.contains('game2-active') && document.getElementById('welcome-screen').classList.contains('hidden')) {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================================================
   SISTEMA DE NAVEGACIÓN ENTRE PANTALLAS
   ========================================================================== */
function selectGame(gameId) {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-content').classList.remove('hidden');
    document.getElementById('btn-back').classList.remove('hidden');
    // Dentro de selectGame (para el Juego 1) y en goToMenu:
    document.body.style.background = "linear-gradient(125deg, #0f111a, #191b2a, #0b2b30, #121324)";
    document.body.style.backgroundSize = "400% 400%";

    document.querySelectorAll('.game-interface').forEach(g => g.classList.add('hidden'));

    const activeGame = document.getElementById(gameId);
    activeGame.classList.remove('hidden');

    if (gameId === 'game1-container') {
        document.getElementById('clouds').style.display = 'none';
        document.getElementById('landscape').style.display = 'none';
        document.querySelectorAll('.animal-decoration').forEach(a => a.style.display = 'none');
        document.body.classList.remove('game2-active');

        iniciarEfectosJuego1();
        lanzarMensajeSorpresa();
    } else {
        clearGame1Elements();
        document.body.classList.add('game2-active');
        document.getElementById('clouds').style.display = 'block';
        document.getElementById('landscape').style.display = 'block';

        initGame2();
        lanzarMensajeSorpresaJ2();
    }
}

function clearGame1Elements() {
    const capa = document.getElementById('animacionJuego1');
    if (capa) capa.innerHTML = '';
}

function lanzarMensajeSorpresa() {
    const juegoContainer = document.getElementById('game1-container');
    const cartelViejo = document.querySelector('.bienvenida-popup');
    if (cartelViejo) cartelViejo.remove();

    const cartel = document.createElement('div');
    cartel.className = 'bienvenida-popup';
    cartel.innerHTML = `
        <h2>¡ISLA DE LAS FRUTAS! 🍓🍍</h2>
        <p>¡Prepárate para contar y divertirte! ⭐</p>
    `;
    juegoContainer.appendChild(cartel);
    setTimeout(() => { cartel.remove(); }, 2500);
}

function lanzarMensajeSorpresaJ2() {
    const cartelViejo = document.querySelector('.bienvenida-popup-j2');
    if (cartelViejo) cartelViejo.remove();

    const cartel = document.createElement('div');
    cartel.className = 'bienvenida-popup-j2';
    cartel.innerHTML = `
        <h2>¡SAFARI MÁGICO! 🦁🌍</h2>
        <p>¡Acierta para cambiar el clima! ☀️❄️</p>
    `;
    document.body.appendChild(cartel);
    setTimeout(() => { cartel.remove(); }, 2500);
}

function goToMenu() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('btn-back').classList.add('hidden');

    clearGame1Elements();
    document.body.classList.remove('game2-active');
    document.getElementById('clouds').style.display = 'none';
    document.getElementById('landscape').style.display = 'none';
    document.querySelectorAll('.animal-decoration').forEach(a => a.style.display = 'none');
    document.getElementById('weatherLayer').innerHTML = '';
}

/* ==========================================================================
   LÓGICA JUEGO 1: DRAG & DROP CON FRUTAS
   ========================================================================== */
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("src", ev.target.src);
    ev.dataTransfer.setData("alt", ev.target.alt);
}

function drop(ev) {
    ev.preventDefault();
    const dataSrc = ev.dataTransfer.getData("src");
    const dataAlt = ev.dataTransfer.getData("alt");
    const src = dataSrc || "https://img.icons8.com/color/96/strawberry.png";

    const cuadro = ev.target.closest(".cuadro");
    if (cuadro && cuadro.querySelectorAll("img").length < 10) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = dataAlt || "fruta";
        cuadro.appendChild(img);
        cuadro.classList.add("agregado");
        setTimeout(() => cuadro.classList.remove("agregado"), 500);
        calcular();
    }
}

function cambiarOperacion() {
    const signo = document.getElementById('signo');
    signo.textContent = signo.textContent === '+' ? '-' : '+';
    calcular();
}

function calcular() {
    const c1 = document.getElementById('c1').querySelectorAll("img").length;
    const c2 = document.getElementById('c2').querySelectorAll("img").length;
    const signo = document.getElementById('signo').textContent;

    if (c1 === 0 && c2 === 0) {
        document.getElementById('c3').textContent = "";
        document.getElementById('resultado').textContent = "Esperando frutas...";
        return;
    }
    let resultado = signo === '+' ? c1 + c2 : c1 - c2;
    document.getElementById('c3').textContent = resultado;
    document.getElementById('resultado').textContent = "Resultado: " + resultado;
}

function vaciarCuadros() {
    const cuadros = [document.getElementById('c1'), document.getElementById('c2')];
    cuadros.forEach(cuadro => {
        const frutas = cuadro.querySelectorAll("img");
        frutas.forEach(fruta => {
            fruta.style.animation = "flyAway 0.7s forwards";
            setTimeout(() => fruta.remove(), 700);
        });
    });
    setTimeout(() => {
        document.getElementById('c3').textContent = "";
        document.getElementById('resultado').textContent = "Esperando frutas...";
    }, 700);
}

function iniciarEfectosJuego1() {
    const capa = document.getElementById('animacionJuego1');
    if (!capa) return;
    capa.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const nube = document.createElement('div');
        nube.className = 'nube-j1';
        nube.style.top = (Math.random() * 50 + 10) + '%';
        nube.style.animationDuration = (Math.random() * 15 + 15) + 's';
        nube.style.animationDelay = (Math.random() * -10) + 's';
        capa.appendChild(nube);
    }

    for (let i = 0; i < 6; i++) {
        const estrella = document.createElement('span');
        estrella.className = 'estrella-j1';
        estrella.innerText = '⭐';
        estrella.style.top = (Math.random() * 80 + 5) + '%';
        estrella.style.left = (Math.random() * 90 + 5) + '%';
        estrella.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        estrella.style.animationDelay = (Math.random() * 3) + 's';
        capa.appendChild(estrella);
    }
}

/* ==========================================================================
   LÓGICA JUEGO 2: SAFARI MÁGICO / ENTRENADOR MATEMÁTICO
   ========================================================================== */
let correct = 0;
let input = "";
let streak = 0;
const fruitEmojis = ['🍎', '🍌', '🍇', '🍉', '🍊', '🍍', '🍓', '🍒', '🥝', '🍐'];

function drawFruits(containerId, count, emoji) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.innerText = emoji;
        container.appendChild(span);
    }
}

function initGame2() {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    const isSuma = Math.random() > 0.3;
    if (!isSuma && n1 < n2) return initGame2();

    const randomEmoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
    document.getElementById('n1').innerText = n1;
    document.getElementById('n2').innerText = n2;
    document.getElementById('op').innerText = isSuma ? '+' : '-';
    correct = isSuma ? n1 + n2 : n1 - n2;

    drawFruits('f1', n1, randomEmoji);
    drawFruits('f2', n2, randomEmoji);
    drawFruits('fRes', correct, randomEmoji);

    input = "";
    document.getElementById('display').innerText = "";
    document.getElementById('overlay').style.display = "none";

    if (document.body.classList.contains('game2-active')) {
        updateEnvironment();
    }
}

function addNum(n) {
    if (input.length < 2) {
        input += n;
        document.getElementById('display').innerText = input;
    }
}

function clearAll() {
    input = "";
    document.getElementById('display').innerText = "";
}

function checkAnswer() {
    if (input === "") return;
    const userAns = parseInt(input);
    const msg = document.getElementById('msg');

    if (userAns === correct) {
        streak++;
        msg.innerText = "¡ERES UN CAMPEÓN! 🌟";
        msg.style.color = "#2ed573";
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
    } else {
        streak = 0;
        msg.innerText = "¡UY! ERA " + correct + " 🙊";
        msg.style.color = "#ff4757";
    }
    document.getElementById('streak').innerText = streak;
    document.getElementById('overlay').style.display = "flex";
}

function next() {
    initGame2();
}

function updateEnvironment() {
    const body = document.body;
    const landscape = document.getElementById('landscape');
    const tree1 = document.getElementById('tree1');
    const tree2 = document.getElementById('tree2');
    const safari1 = document.getElementById('safari1');
    const safari2 = document.getElementById('safari2');
    const polar1 = document.getElementById('polar1');
    const polar2 = document.getElementById('polar2');
    const weatherLayer = document.getElementById('weatherLayer');

    weatherLayer.innerHTML = '';

    if (streak < 3) {
        body.style.background = "var(--sky-blue)";
        landscape.style.background = "var(--grass-green)";
        landscape.style.borderColor = "#26af5a";
        tree1.style.color = "#26af5a";
        tree2.style.color = "#26af5a";
        safari1.className = "animal-decoration safari-animal";
        safari2.className = "animal-decoration safari-animal";
        polar1.className = "animal-decoration polar-animal";
        polar2.className = "animal-decoration polar-animal";
        addLeaves(5, '🍂');
    } else if (streak >= 3 && streak < 6) {
        body.style.background = "#57606f";
        landscape.style.background = "var(--autumn-grass)";
        landscape.style.borderColor = "#a84300";
        tree1.style.color = "#a84300";
        tree2.style.color = "#a84300";
        addWeather('drop', 100);
        addLeaves(15, '🍁');
    } else if (streak >= 6 && streak < 9) {
        body.style.background = "#ced6e0";
        landscape.style.background = "var(--winter-white)";
        landscape.style.borderColor = "#b2bec3";
        tree1.style.color = "#b2bec3";
        tree2.style.color = "#b2bec3";
        safari1.classList.add('hide-safari');
        safari2.classList.add('hide-safari');
        polar1.classList.add('show-polar');
        polar2.classList.add('show-polar');
        addWeather('snow', 80);
    } else {
        body.style.background = "linear-gradient(to bottom, var(--sunset-orange), #a55eea)";
        landscape.style.background = "#a55eea";
        landscape.style.borderColor = "#8854d0";
        tree1.style.color = "#ffffff";
        tree2.style.color = "#ffffff";
        safari1.className = "animal-decoration safari-animal";
        safari2.className = "animal-decoration safari-animal";
        polar1.className = "animal-decoration polar-animal";
        polar2.className = "animal-decoration polar-animal";
        confetti({ particleCount: 50, spread: 60 });
    }
}

function addWeather(type, count) {
    const weatherLayer = document.getElementById('weatherLayer');
    for (let i = 0; i < count; i++) {
        const element = document.createElement('div');
        element.className = type;
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDelay = Math.random() * 2 + 's';
        element.style.animationDuration = (Math.random() * 1 + (type === 'drop' ? 0.5 : 2)) + 's';
        weatherLayer.appendChild(element);
    }
}

function addLeaves(count, emoji) {
    const container = document.getElementById('clouds');
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.innerText = emoji;
        leaf.style.top = Math.random() * 50 + '%';
        leaf.style.left = Math.random() * -100 + 'px';
        leaf.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(leaf);
    }
}

function exitPage() {
    if (confirm("¿Estás seguro de que deseas salir del juego? Perderás tu progreso actual.")) {
        window.location.href = "about:blank";
    }
}

/* ==========================================================================
   MODAL INTERACTIVO DE NUEVO JUEGO (POPUPS)
   ========================================================================== */
let selectedGame = '';

function showGamePopup(gameId) {
    selectedGame = gameId;
    const popup = document.getElementById('game-popup');
    popup.classList.remove('hidden');

    const popupTitle = document.querySelector('.popup-box h2');
    const popupText = document.getElementById('popup-text');
    const popupGif = document.querySelector('.popup-gif img');

    if (gameId === 'game1-container') {
        popupTitle.innerHTML = '¡suma y resta con frutas, te invito ah jugar!';
        popupText.innerHTML = '';
        popupGif.src = 'img/gifP1.png';
    } else {
        popupTitle.innerHTML = '¡🔮El rey león necesita tus superpoderes🔮!';
        popupText.innerHTML = '';
        popupGif.src = 'img/leonM.png';
    }
}

function closePopup() {
    document.getElementById('game-popup').classList.add('hidden');
}

document.getElementById('popup-play-btn').addEventListener('click', () => {
    closePopup();
    selectGame(selectedGame);
});

/* ==========================================================================
   CONFETTI DE PAPEL PICADO (PORTADA)
   ========================================================================== */
window.onload = () => {
    initGame2();

    const confettiContainer = document.querySelector('.floating-confetti');
    const colors = ['#ff3b30', '#ffcc00', '#34c759', '#007aff', '#ff2d55', '#af52de', '#ff9500'];

    for (let i = 0; i < 80; i++) {
        const paper = document.createElement('span');
        paper.style.left = Math.random() * 100 + '%';
        paper.style.background = colors[Math.floor(Math.random() * colors.length)];
        paper.style.animationDuration = (Math.random() * 10 + 8) + 's';
        paper.style.animationDelay = Math.random() * 1 + 's';
        paper.style.transform = `scale(${Math.random() + 0.5})`;
        confettiContainer.appendChild(paper);
    }
};