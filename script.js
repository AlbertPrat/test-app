let preguntes = [];
let preguntaActual = 0;
let puntuacio = 0;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Variables d'entorn per Firebase, que són carregades des de Netlify
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Inicialitzem Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Aquí van les funcions d'autenticació
document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById("login").style.display = "none";
            document.getElementById("contingut").style.display = "block";
        })
        .catch(error => {
            document.getElementById("error").innerText = "Error: " + error.message;
        });
});

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
