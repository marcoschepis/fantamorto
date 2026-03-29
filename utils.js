function updateMortoStatus(idx) {
    db.morituri[idx].status = db.morituri[idx].status === 'vivo' ? 'morto' : 'vivo';
    render();
}

function updateMortoPoints(idx, points) {
    db.morituri[idx].punti = parseInt(points) || 0;
    render();
}

function updateMortoPrezzo(idx, prezzo) {
    db.morituri[idx].prezzo = parseInt(prezzo) || 0;
    render();
}

function updateMortoRimborso(idx, val) {
    db.morituri[idx].rimborso = parseInt(val) || 0;
    render();
}

function getMortoByName(nome) {
    return db.morituri.find(m => m.nome === nome);
}

function removeMorto(idx) {
    if (confirm('Rimuovere ' + db.morituri[idx].nome + '?')) {
        db.morituri.splice(idx, 1);
        render();
    }
}

function addMorto() {
    const nome = document.getElementById('new-morto-nome').value.trim();
    
    if (!nome) { alert('Inserisci un nome'); return; }

    if (db.morituri.find(m => m.nome === nome)) { alert('Morto già esistente'); return; }

    const infoDalCatalogo = catalogoMorituri.find(m => m.nome.toLowerCase() === nome.toLowerCase());

    if (infoDalCatalogo) {
        db.morituri.push({
            nome: infoDalCatalogo.nome,
            prezzo: infoDalCatalogo.prezzo,
            status: 'vivo',
            punti: 0,
            rimborso: 0
        });
    } else {
        // Se non lo trova usa il prezzo inserito manualmente nell'input
        const prezzoManuale = parseInt(document.getElementById('new-morto-prezzo').value) || 0;
        
        db.morituri.push({
            nome: nomeInput,
            prezzo: prezzoManuale,
            nascita: "",
            descrizione: "Inserimento manuale",
            status: 'vivo',
            punti: 0,
            rimborso: 0
        });
    }

    document.getElementById('new-morto-nome').value = '';
    document.getElementById('new-morto-prezzo').value = '0';
    render();
}

function addSquadra() {
    db.campionato.push({
        nome_squadra: "Nuova Squadra",
        proprietario: "Proprietario",
        partecipanti: [],
        totPunti: 0
    });
    render();
}
function removeSquadra(idx) {
    const nome = db.campionato[idx].nome_squadra;
    if (confirm(`Sei sicuro di voler eliminare definitivamente la squadra "${nome}"?`)) {
        db.campionato.splice(idx, 1);
        render();
    }
}

function calculateCreditiSquadra(squadra) {
    return squadra.partecipanti.reduce((acc, p) => {
        const morto = getMortoByName(p.nome);
        const costo = morto ? morto.prezzo : 0;
        let rimborso = 0;
        if (morto && morto.status === 'morto') {
            rimborso = (morto.rimborso || 0);
        }
        else {
            rimborso = 0;
        }

        return acc + costo - rimborso;
    }, 0);
}

function calculateCreditiInizialiSquadra(squadra) {
    return squadra.partecipanti.reduce((acc, p) => {
        const morto = getMortoByName(p.nome);
        const costo = morto ? morto.prezzo : 0;

        return acc + costo;
    }, 0);
}

function calculateRimborsoCreditiSquadra(squadra) {
    return squadra.partecipanti.reduce((acc, p) => {
        const morto = getMortoByName(p.nome);
        let rimborso = 0;
        if (morto && morto.status === 'morto') {
            rimborso = (morto.rimborso || 0);
        }
        else {
            rimborso = 0;
        }

        return acc + rimborso;
    }, 0);
}

function calculateCreditiResidui(squadra) {
    const spesa = calculateCreditiSquadra(squadra);
    return (db.config.crediti_iniziali || 330) - spesa;
}