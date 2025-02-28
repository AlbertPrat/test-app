let preguntes = [];
let preguntaActual = 0;
let puntuacio = 0;

async function carregarTest() {
    const resposta = await fetch('tests.json');
    const tests = await resposta.json();
    preguntes = tests[0].preguntes; // Carrega el primer test
    preguntaActual = 0;
    puntuacio = 0;
    mostrarPregunta();
}

function mostrarPregunta() {
    if (preguntaActual >= preguntes.length) {
        document.getElementById("quiz-container").innerHTML = `<h2>Has encertat ${puntuacio} de ${preguntes.length} preguntes!</h2>`;
        return;
    }
    
    const pregunta = preguntes[preguntaActual];
    document.getElementById("pregunta").innerText = pregunta.text;
    
    let opcionsHTML = "";
    pregunta.opcions.forEach((opcio, index) => {
        opcionsHTML += `<button onclick="comprovarResposta(${index})">${opcio}</button>`;
    });

    document.getElementById("opcions").innerHTML = opcionsHTML;
    document.getElementById("següent").style.display = "none";
}

function comprovarResposta(index) {
    if (index === preguntes[preguntaActual].correcta) {
        puntuacio++;
    }
    document.getElementById("següent").style.display = "block";
}

function següentPregunta() {
    preguntaActual++;
    mostrarPregunta();
}
