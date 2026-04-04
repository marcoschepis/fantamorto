let db = { config: { crediti_iniziali: 330 }, campionato: [] };

// Configurazione GitHub
const REPO_INFO = {
    OWNER: 'marcoschepis',
    REPO: 'fantamorto',
    PATH: 'squadre.json',
    MORITURI: 'morituri.json'
};

// Hash della password
const SECRET_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
let isAuthorized = false;

let rankCont = document.getElementById('rank-container');
let teamsCont = document.getElementById('teams-container');
let pointsCont = document.getElementById('points-container');
let adminCont = document.getElementById('admin-container');

const datalist = document.getElementById('lista-suggerimenti');

let btnMercato = document.getElementById('btn-mercato');
let userIdx = document.getElementById('user-team-select').value;
let mercatoEditor = document.getElementById('mercato-editor');
let morituriDisplay = document.getElementById('mercato-morituri-display');
let budgetDisplay = document.getElementById('mercato-budget-display');
let userSelect = document.getElementById('user-team-select');
let headerMercato = document.querySelector('#view-mercato .card > div:first-child');
let saveBtnMercato = document.querySelector('#view-mercato button[onclick*="saveToGitHub"]');

let currentView = 'rank';

// Entry point
verifyAdmin().then(loadData);

async function verifyAdmin() {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('admin');
    if (!key) return;

    const msg = new TextEncoder().encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msg);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashedKey === SECRET_HASH) {
        isAuthorized = true;
        document.getElementById('btn-admin').style.display = 'block';
    }
}

function loadElements() {
    rankCont = document.getElementById('rank-container');
    teamsCont = document.getElementById('teams-container');
    pointsCont = document.getElementById('points-container');
    adminCont = document.getElementById('admin-container');

    btnMercato = document.getElementById('btn-mercato');
    userIdx = document.getElementById('user-team-select').value;
    mercatoEditor = document.getElementById('mercato-editor');
    morituriDisplay = document.getElementById('mercato-morituri-display');
    budgetDisplay = document.getElementById('mercato-budget-display');
    userSelect = document.getElementById('user-team-select');
    headerMercato = document.querySelector('#view-mercato .card > div:first-child');
    saveBtnMercato = document.querySelector('#view-mercato button[onclick*="saveToGitHub"]');
}

function loadData() {
    loadElements();

    fetch(REPO_INFO.PATH + '?' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            db = data;
            return fetch(REPO_INFO.MORITURI + '?' + new Date().getTime());
        })
        .then(r => r.json())
        .then(lista => {
            catalogoMorituri = lista;
            
            const dl = document.getElementById('lista-suggerimenti');
            if (dl) {
                dl.innerHTML = catalogoMorituri.map(m => `<option value="${m.nome}">`).join('');
            }
            
            render();
        })
        .catch(e => console.error("Errore caricamento dati:", e));
}

function switchView(name) {
    if (name === 'admin' && !isAuthorized) return;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    document.getElementById('btn-' + name).classList.add('active');

    currentView = name;
    render();
}

function render() {
    loadElements();

    rankCont.innerHTML = '';
    teamsCont.innerHTML = '';
    adminCont.innerHTML = '';

    // Calcoli totali per squadra e ordinamento classifica
    const sortedTeams = [...db.campionato].sort((a, b) => puntiSquadra(b) - puntiSquadra(a));

    switch (currentView) {
        case 'rank':
            rankCont.innerHTML = renderClassifica(sortedTeams);
            break;
            
        case 'teams':
            teamsCont.innerHTML = renderSquadre(sortedTeams);
            break;

        case 'points':
            pointsCont.innerHTML = renderPunti();
            break;
            
        case 'admin':
            if (isAuthorized) {
                adminCont.innerHTML = renderAdmin();
            }
            break;
            
        case 'mercato':
            renderMercato();
            break;
    }
}