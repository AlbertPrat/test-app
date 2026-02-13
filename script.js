let preguntes = [];
let preguntaActual = 0;
let puntuacio = 0;
let respostesUsuari = [];
let tests = [];

const spreadsheetId = "1JlkoAelfAG8ohE8mnr9d0-_ZIe3V_x_EzSo0MY4pJJM"; // l’ID del teu Google Sheet
const apiKey = "AIzaSyCZOjFQuOh9V2jXK6DjJfWmtYCfLYtiOys";

const rangeTemes = "Temes!A1:C100";      // Full amb els temes
const rangePreguntes = "Preguntes!A1:G5000"; // Full amb les preguntes


// 🔹 Carregar els tests
async function carregarTemes() {
  const urlTemes = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeTemes}?key=${apiKey}`;
  const urlPreguntes = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangePreguntes}?key=${apiKey}`;

  const [resTemes, resPreguntes] = await Promise.all([
    fetch(urlTemes).then(r => r.json()),
    fetch(urlPreguntes).then(r => r.json())
  ]);

  const filesTemes = resTemes.values.slice(1); // sense capçalera
  const filesPreguntes = resPreguntes.values.slice(1);

  // Convertim en objectes
  const temes = filesTemes.map(([idTema, numero, tema]) => ({
    idTema, numero, tema, preguntes: []
  }));

  filesPreguntes.forEach(([idTema, text, opcio1, opcio2, opcio3, opcio4, correcta]) => {
    const tema = temes.find(t => t.idTema === idTema);
    if (tema) {
      tema.preguntes.push({
        text,
        opcions: [opcio1, opcio2, opcio3, opcio4].filter(Boolean),
        correcta: parseInt(correcta)
      });
    }
  });

  tests = temes;

  // Omplim el desplegable
  const selectTema = document.getElementById("tema");
  selectTema.innerHTML = `<option value="" disabled selected>Selecciona un tema</option>`;

  tests.forEach((test, index) => {
    const opcio = document.createElement("option");
    opcio.value = index;
    opcio.textContent = `${test.numero} (${test.preguntes.length} preguntes)`;
    selectTema.appendChild(opcio);
  });

  // Afegim el test aleatori
  const totalPreguntes = tests.reduce((acc, t) => acc + t.preguntes.length, 0);
  const opcioAleatori = document.createElement("option");
  opcioAleatori.value = "aleatori";
  opcioAleatori.textContent = `Test Aleatori (${totalPreguntes} preguntes)`;
  selectTema.appendChild(opcioAleatori);
}


function barrejarIPrendre(array,max){
    const limit = Math.min(max, array.length);
    if (max > array.length) {
    alert(`Només hi ha ${array.length} preguntes disponibles. Se n'utilitzaran totes.`);
  }
    return array
    .sort(()=> Math.random()-0.5)
    .slice(0,limit);
}

// 🔹 Quan l'usuari clica "Començar Test"
function començarTest() {
    const selectTema = document.getElementById("tema");
    const indexTema = selectTema.value;
    const numPreguntes = parseInt(document.getElementById("numPreguntes").value) || 15;

    if (indexTema === "") {
        alert("Si us plau, selecciona un tema.");
        return;
    }

    // Reiniciar les variables globals per començar un nou test
    preguntaActual = 0;
    puntuacio = 0;
    respostesUsuari = [];

    // Si l'usuari ha seleccionat "Test Aleatori"
    if (indexTema === "aleatori") {
        crearTestAleatori(numPreguntes); // Cridem la funció per crear el test aleatori
    } else {
        preguntes = barrejarIPrendre(tests[indexTema].preguntes, numPreguntes);
    }

    // Amaguem la pantalla inicial i mostrem el test
    document.getElementById("inici-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    mostrarPregunta();
}

// 🔹 Crear test aleatori agafant preguntes de tots els temes
function crearTestAleatori(maxPreguntes = 15) {
  const totes = [];
  tests.forEach(t => totes.push(...t.preguntes));
  preguntes = barrejarIPrendre(totes, maxPreguntes);
}

// 🔹 Mostra la pregunta actual
function mostrarPregunta() {
    if (preguntaActual >= preguntes.length) {
        mostrarResum();
        return;
    }

    const total = preguntes.length;
    const actual = preguntaActual + 1;
    const percentatge = Math.round((actual / total) * 100);

    document.getElementById("progres-text").innerText = `${actual} / ${total}`;
    document.getElementById("progres-bar").style.width = percentatge + "%";

    const pregunta = preguntes[preguntaActual];
    document.getElementById("pregunta").innerText = pregunta.text;

    let opcionsHTML = "";
    pregunta.opcions.forEach((opcio, index) => {
        opcionsHTML += `<button class="opcio" onclick="comprovarResposta(${index}, this)">${opcio}</button>`;
    });

    document.getElementById("opcions").innerHTML = opcionsHTML;
    document.getElementById("següent").style.display = "block";

    respostaSeleccionada = false;
}

let respostaSeleccionada=false;
// 🔹 Comprovar si la resposta és correcta o incorrecta
function comprovarResposta(index, boto) {
    if (respostaSeleccionada) return;
    respostaSeleccionada=true;

    const botons = document.querySelectorAll(".opcio");
    botons.forEach(btn => btn.disabled = true); // Desactivem els botons després de respondre

    const correctaIndex = preguntes[preguntaActual].correcta;
    const botoCorrecte = botons[correctaIndex];

    let correcte = false;
    if (index === correctaIndex) {
        puntuacio++;
        correcte = true;
        boto.classList.add("correcte");
    } else {
        boto.classList.add("incorrecte");
        botoCorrecte.classList.add("correcte");
    }

    // Guardem la resposta de l'usuari
    respostesUsuari.push({
        pregunta: preguntes[preguntaActual].text,
        respostaUsuari: preguntes[preguntaActual].opcions[index],
        correcte: correcte,
        respostaCorrecta: preguntes[preguntaActual].opcions[correctaIndex]
    });

    document.getElementById("següent").style.display = "block";
}

// 🔹 Passar a la següent pregunta
function següentPregunta() {
    if(!respostaSeleccionada){
        respostesUsuari.push({
            pregunta: preguntes[preguntaActual].text,
            respostaUsuari: "No respost",
            correcte: null,
            respostaCorrecta: preguntes[preguntaActual].opcions[preguntes[preguntaActual].correcta]
        });
    }
    preguntaActual++;
    mostrarPregunta();
}

// 🔹 Mostrar el resum final
function mostrarResum() {
    let resultatHTML = `<h2>Resultats del test</h2>`;
    resultatHTML += `<p>Has encertat ${puntuacio} de ${preguntes.length} preguntes.</p>`;
    
    // 🔹 Càlcul de la nota
    let puntuacioBruta = 0;
    respostesUsuari.forEach(r => {
        if (r.correcte === true) puntuacioBruta += 1;
        else if (r.correcte === false) puntuacioBruta -= 0.25;
    });

    // Escalar sobre 10
    let nota = (puntuacioBruta / preguntes.length) * 10;
    if (nota < 0) nota = 0; // mai per sota de 0

    resultatHTML += `<p><strong>Nota: ${nota.toFixed(2)} / 10</strong></p>`;
    resultatHTML += `<h3>Detall de respostes:</h3><ul>`;

    respostesUsuari.forEach((resposta, index) => {
        let numeroPregunta = index + 1;
        if (resposta.correcte==true) {
            resultatHTML += `<li class="correcte"> <strong>${numeroPregunta}</strong> ${resposta.pregunta} <br> Resposta: <strong>${resposta.respostaUsuari}</strong>✅</li>`;
        } else if (resposta.correcte == false) {
            resultatHTML += `<li class="incorrecte"><strong>${numeroPregunta}</strong> ${resposta.pregunta} <br> Resposta triada: <strong>${resposta.respostaUsuari}</strong> ❌ <br> Correcta: <strong>${resposta.respostaCorrecta}</strong></li>`;
        } else {
            resultatHTML += `<li class="no-respost"><strong>${numeroPregunta}</strong> ${resposta.pregunta} <br> <em>No has respost aquesta pregunta</em> <br> Correcta: <strong>${resposta.respostaCorrecta}</strong>⚪</li>`;
        }
    });

    resultatHTML += `</ul>`;
    resultatHTML += `<button class="reiniciar" onclick="reiniciarTest()">🔄 Torna a començar</button>`;

    // Mostrem el resum final i amaguem el test
    document.getElementById("quiz-container").innerHTML = resultatHTML;
}

// 🔹 Funció per reiniciar completament el test
function reiniciarTest() {
    preguntaActual = 0;
    puntuacio = 0;
    respostesUsuari = [];

    // Assegurar-se que el contenidor del test està buit abans de carregar un nou test
    document.getElementById("quiz-container").innerHTML = `
        <h2 id="pregunta"></h2>
        <div id="opcions"></div>
        <button id="següent" onclick="següentPregunta()" style="display: none;">Següent</button>
    `;

    // Mostrar la pantalla d'inici i amagar el test
    document.getElementById("inici-container").style.display = "block";
    document.getElementById("quiz-container").style.display = "none";
}

// 🔹 Carreguem els temes quan la pàgina es carrega
window.onload = carregarTemes;

