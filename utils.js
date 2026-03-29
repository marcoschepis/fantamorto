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

function aggiornaPrezzoAutomatico(nomeInserito, inputElement) {
    const prezzoInput = document.getElementById(inputElement);
    
    // Cerchiamo nel catalogo se il nome inserito corrisponde esattamente a uno esistente
    const trovato = catalogoMorituri.find(m => m.nome.toLowerCase() === nomeInserito.toLowerCase());
    
    if (trovato) {
        // Se lo trova, aggiorna la casella del prezzo con il valore ufficiale
        prezzoInput.value = trovato.prezzo;
        prezzoInput.style.borderColor = "#44ff44";
    } else {
        // Se non lo trova (sta ancora scrivendo o è un nome nuovo), resetta
        prezzoInput.value = '?';
        prezzoInput.style.borderColor = "#444";
    }
}

function numeroMaxPartecipanti(squadra) {
    const conteggioMorti = squadra.partecipanti.filter(p => {
        const m = getMortoByName(p.nome);
        return m && m.status === 'morto';
    }).length;
    return 13 + conteggioMorti;
}

function aggiungiADb(tIdx, fonteInputId) {
    const inputElement = document.getElementById(fonteInputId);
    const nomeSelezionato = inputElement.value.trim();
    
    if (!nomeSelezionato || nomeSelezionato.startsWith("--")) {
        alert("Seleziona o inserisci un nome valido.");
        return;
    }

    const squadra = db.campionato[tIdx];
    // Cerchiamo le info nel catalogo generale (morituri.json)
    const infoMorituro = catalogoMorituri.find(m => m.nome.toLowerCase() === nomeSelezionato.toLowerCase());

    if (!infoMorituro) {
        alert("Errore: Il personaggio non è presente nel listino ufficiale.");
        return;
    }

    // --- CONTROLLO 1: Già in squadra ---
    if (squadra.partecipanti.find(p => p.nome.toLowerCase() === infoMorituro.nome.toLowerCase())) {
        alert(`⚠️ ${infoMorituro.nome} è già presente in questa squadra.`);
        return;
    }

    // --- CONTROLLO 2: Limite 13 partecipanti ---
    const conteggioMorti = squadra.partecipanti.filter(p => {
        const m = getMortoByName(p.nome);
        return m && m.status === 'morto';
    }).length;
    if (squadra.partecipanti.length >= numeroMaxPartecipanti(squadra)) {
        alert(`⚠️ Limite raggiunto! ${squadra.nome_squadra} ha raggiunto il limite di morituri.`);
        return;
    }

    // --- CONTROLLO 3: Budget ---
    const costo = infoMorituro.prezzo;
    const residui = calculateCreditiResidui(squadra);
    if (costo > residui) {
        alert(`💰 Budget insufficiente!\n${infoMorituro.nome} costa ${costo} BS, ma ne hai solo ${residui} residui.`);
        return;
    }

    // --- ESECUZIONE ---
    // 1. Se il morto non esiste ancora nel DB globale dei punteggi, lo aggiungiamo come 'vivo'
    if (!getMortoByName(infoMorituro.nome)) {
        db.morituri.push({
            nome: infoMorituro.nome,
            prezzo: infoMorituro.prezzo,
            status: 'vivo',
            punti: 0,
            rimborso: 0
        });
    }

    // 2. Aggiungiamo il partecipante alla squadra
    squadra.partecipanti.push({ nome: infoMorituro.nome });
    
    // Reset input (se è un text input)
    if (inputElement.tagName === "INPUT") inputElement.value = "";
    
    render();
}

function setCapitano(tIdx, pIdx) {
    const squadra = db.campionato[tIdx];
    
    // Impostiamo il nuovo capitano
    squadra.capitano = squadra.partecipanti[pIdx].nome;
    
    render();
}

function puntiMorto(s, p) {
    const morto = getMortoByName(p.nome);
    let puntiBase = morto ? morto.punti : 0;

    return puntiBase;
}

function puntiCapitano(s, p) {
    const morto = getMortoByName(p.nome);

    let bonusCapitano = 0;
    if (p.nome === s.capitano && morto && morto.status === 'morto') {
        bonusCapitano = 10;
    }

    return bonusCapitano;
}

function puntiMortoTot(s, p) {
    return puntiMorto(s, p) + puntiCapitano(s, p);
}

function puntiSquadra(s, p){
    s.totPunti = s.partecipanti.reduce((acc, p) => {
        return acc + puntiMorto(s, p) + puntiCapitano(s, p);
    }, 0);
}

async function saveToGitHub() {
    // Chiediamo il codice segreto agli amici (il tuo Token)
    // Lo metteranno una volta sola, poi il browser lo ricorda
    const sel = document.getElementById('user-team-select');
    autore = sel.options[sel.selectedIndex].text || 'utente';

    if (autore == "-- Seleziona la tua squadra --") autore = "ADMIN";
    
    let token = localStorage.getItem('fantamorto_access_token');
    
    if (!token) {
        token = prompt("🔑 Inserisci il codice segreto per autorizzare il salvataggio:");
        if (token) localStorage.setItem('fantamorto_access_token', token);
        else return;
    }

    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "⏳ Invio in corso...";
    btn.disabled = true;

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_INFO.OWNER}/${REPO_INFO.REPO}/dispatches`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                event_type: "update_json",
                client_payload: {
                    autore: autore,
                    db: JSON.stringify(db, null, 2)
                }
            })
        });

        if (response.ok) {
            btn.innerText = "🚀 Richiesta inviata! Il sito si aggiornerà tra circa 30 secondi.";
            btn.style.backgroundColor = "#28a745"; // Opzionale: diventa verde
            
            // Dopo 5 secondi lo facciamo tornare normale se vuoi
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = ""; 
            }, 5000);
        } else {
            const err = await response.json();
            if (response.status === 401 || response.status === 403) {
                alert("❌ Accesso negato o Token scaduto.");
                localStorage.removeItem('fantamorto_access_token'); // Rimuove il token sbagliato
            } else {
                const err = await response.json();
                alert("❌ Errore: " + err.message);
            }
        }
    } catch (e) {
        alert("❌ Errore di connessione.");
    }
}