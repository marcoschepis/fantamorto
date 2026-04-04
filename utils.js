function isPDead(p) {
    return p && p.status === 'morto';
}

function addSquadra() {
    db.campionato.push({
        nome_squadra: "Nuova Squadra",
        proprietario: "Proprietario",
        partecipanti: []
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
        const costo = p ? p.prezzo : 0;

        return acc + costo;
    }, 0);
}

function calculateRimborsoCreditiSquadra(squadra) {
    return squadra.partecipanti.reduce((acc, p) => {
        let rimborso = 0;
        if (isPDead(p)) {
            rimborso = (p.rimborso || 0);
        }
        else {
            rimborso = 0;
        }

        return acc + rimborso;
    }, 0);
}

function calculateCreditiResidui(squadra) {
    const spesa = calculateCreditiSquadra(squadra);
    const rimborso = calculateRimborsoCreditiSquadra(squadra);
    return (db.config.crediti_iniziali || 330) + rimborso - spesa;
}

function numeroMaxPartecipanti(squadra) {
    const conteggioMorti = squadra.partecipanti.filter(p => {
        return isPDead(p);
    }).length;
    return 13 + conteggioMorti*2; // Ogni morto permette di avere 2 partecipanti extra (1 sostituto + 1 bonus)
}

function setCapitano(tIdx, pIdx) {
    const squadra = db.campionato[tIdx];
    const candidatoCapitano = squadra.partecipanti[pIdx];

    // 1. Controllo se il morituro che vuoi nominare ORA è già morto
    if (isPDead(candidatoCapitano)) {
        alert(`⚠️ Non puoi nominare ${candidatoCapitano.nome} come capitano perché è già morto.`);
        return;
    }

    // Impostiamo il nuovo capitano
    squadra.capitano = candidatoCapitano.nome;
    
    render();
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

function aggiornaNomeAutomatico(nomeInserito, inputElement) {
    const nomeInput = document.getElementById(inputElement);
    
    // Cerchiamo nel catalogo se il nome inserito corrisponde esattamente a uno esistente
    const trovato = catalogoMorituri.find(m => m.nome.toLowerCase() === nomeInserito.toLowerCase());
    
    if (trovato) {
        // Se lo trova, aggiorna la casella del prezzo con il valore ufficiale
        nomeInput.value = trovato.nome;
        nomeInput.style.borderColor = "#44ff44";
        return true;
    } else {
        // Se non lo trova (sta ancora scrivendo o è un nome nuovo), resetta
        nomeInput.style.borderColor = "#444";
        return false;
    }
}

function aggiungiADb(tIdx, fonteInputId) {
    const inputElement = document.getElementById(fonteInputId);
    const nomeSelezionato = inputElement.value.trim();
    
    if (!nomeSelezionato || nomeSelezionato.startsWith("--")) {
        alert("Seleziona un nome valido.");
        return;
    }

    const squadra = db.campionato[tIdx];
    // Cerchiamo le info nel catalogo generale (morituri.json)
    const infoMorituro = catalogoMorituri.find(m => m.nome.toLowerCase() === nomeSelezionato.toLowerCase());

    if (!infoMorituro) {
        alert("Errore: Il personaggio non è presente nel listino.");
        return;
    }

    // --- CONTROLLO 1: Già in squadra ---
    if (squadra.partecipanti.find(p => p.nome.toLowerCase() === infoMorituro.nome.toLowerCase())) {
        alert(`⚠️ ${infoMorituro.nome} è già presente in questa squadra.`);
        return;
    }

    // --- CONTROLLO 2: Limite 13 + morti ---
    if (squadra.partecipanti.length >= numeroMaxPartecipanti(squadra)) {
        alert(`⚠️ Limite raggiunto!\nPuoi avere al massimo ${numeroMaxPartecipanti(squadra)} partecipanti (13 + morti).`);
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
    // Aggiungiamo il partecipante alla squadra
    squadra.partecipanti.push({
        nome: infoMorituro.nome,
        prezzo: infoMorituro.prezzo,
        status: 'vivo',
        punti: 0,
        rimborso: 0
    });
    
    // Reset input
    if (inputElement.tagName === "INPUT") inputElement.value = "";
    
    render();
}

function removeFromDb(userIdx, i) {
    // Per rimuovere deve avere 0 punti
    const partecipante = db.campionato[userIdx].partecipanti[i];
    if (partecipante.punti !== 0) {
        alert(`⚠️ Non puoi rimuovere ${partecipante.nome} perché ha già accumulato punti!`);
        return;
    }

    // Se è il capitano rimuoviamo il capitano
    if (db.campionato[userIdx].capitano === partecipante.nome) {
        db.campionato[userIdx].capitano = "";
    }

    // Esegui
    db.campionato[userIdx].partecipanti.splice(i,1);
    render();
}

function puntiMorto(p) {
    let puntiBase = p ? p.punti : 0;

    return puntiBase;
}

function puntiCapitano(s, p) {
    let bonusCapitano = 0;
    if (p.nome === s.capitano && isPDead(p)) {
        bonusCapitano = 10;
    }

    return bonusCapitano;
}

function puntiMortoTot(s, p) {
    return puntiMorto(p) + puntiCapitano(s, p);
}

function puntiSquadra(s){
    return s.partecipanti.reduce((acc, p) => {
        return acc + puntiMortoTot(s, p);
    }, 0);
}

async function saveToGitHub(mode = 'user') {
    const btn = event.target;
    const originalText = btn.innerText;
    let payload = { autore: "" };

    // --- LOGICA PRE-INVIO ---
    if (mode === 'user') {
        const sel = document.getElementById('user-team-select');
        payload.autore = sel.options[sel.selectedIndex].text;
        if (payload.autore === "-- Seleziona la tua squadra --") return;

        const squadra = db.campionato[userIdx];
        if (squadra.partecipanti.length < 13) {
            alert(`⚠️ Aggiungi almeno 13 morituri!`);
            return;
        }
        if (!squadra.capitano || squadra.capitano === "") {
            alert("⚠️ ATTENZIONE: Non hai selezionato un Capitano per la tua squadra\nClicca sulla ⚪ accanto ad un nome per renderlo capitano.");
            return;
        }
        if (isPDead(squadra.partecipanti.find(p => p.nome === squadra.capitano))) {
            alert("⚠️ ATTENZIONE: Non puoi selezionare un capitano che è già morto.\nControlla di aver selezionato un capitano che è ancora vivo.");
            return;
        }
        payload.squadra = squadra;
        payload.tipo = "SQUADRA";
    } else {
        // Modalità ADMIN
        payload.autore = "Admin";
        payload.db = db;
        payload.tipo = "FULL_DB";
    }

    // --- GESTIONE TOKEN ---
    let token = localStorage.getItem('fantamorto_access_token');
    if (!token) {
        token = prompt("🔑 Inserisci il codice segreto:");
        if (token) localStorage.setItem('fantamorto_access_token', token);
        else return;
    }

    btn.innerText = "⏳ Invio...";
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
                client_payload: payload
            })
        });

        if (response.ok) {
            btn.innerText = "🚀 Inviato! Il sito si aggiornerà tra circa 30 secondi.";
            btn.style.backgroundColor = "#28a745";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = ""; 
            }, 5000);
        } else {
            if (response.status === 401 || response.status === 403) {
                alert("❌ Token errato o scaduto.");
                localStorage.removeItem('fantamorto_access_token');
            } else {
                const err = await response.json();
                alert("❌ Errore: " + err.message);
            }
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        alert("❌ Errore di connessione.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function updateMortoStatusSync(nome, statusAttuale) {
    const nuovoStatus = statusAttuale === 'vivo' ? 'morto' : 'vivo';
    db.campionato.forEach(s => {
        s.partecipanti.forEach(p => {
            if (p.nome === nome) p.status = nuovoStatus;
        });
    });
    render();
}

function aggiungiEvento(nomeMorituro) {
    const desc = prompt("Descrizione evento (Bonus, Malus):");
    const punti = parseInt(prompt("Punti da assegnare:", "10"));

    if (!desc || isNaN(punti)) {
        alert("Operazione annullata: descrizione o punti non validi.");
        return;
    }

    const dataOggi = new Date().toISOString().split('T')[0];

    // Scansioniamo tutte le squadre nel database
    db.campionato.forEach(squadra => {
        squadra.partecipanti.forEach(p => {
            // Se il nome corrisponde esattamente
            if (p.nome === nomeMorituro) {
                if (!p.eventi) p.eventi = [];
                p.eventi.push({
                    data: dataOggi,
                    desc: desc,
                    valore: punti
                });
                p.punti = (p.punti || 0) + punti;
            }
        });
    });

    render();
}

function toggleMorte(nomeMorituro) {
    let morituroEsempio = null;
    db.campionato.some(s => {
        morituroEsempio = s.partecipanti.find(p => p.nome === nomeMorituro);
        return morituroEsempio; // Esce dal ciclo appena ne trova uno
    });

    if (!morituroEsempio) return;

    const isOraMorto = morituroEsempio.status !== 'morto';
    const messaggio = isOraMorto 
        ? `Segnare ${nomeMorituro} come MORTO in TUTTE le squadre?`
        : `Resuscitare ${nomeMorituro} in TUTTE le squadre?`;

    if (!confirm(messaggio)) return;
    const rimborso = parseInt(prompt("Rimborso (quotazione corrente + 15):", "100"));
    if (isNaN(rimborso)) return;

    // 2. Applichiamo la modifica a tappeto su tutto il database
    db.campionato.forEach(squadra => {
        squadra.partecipanti.forEach(p => {
            if (p.nome === nomeMorituro) {
                if (isOraMorto) {
                    p.status = 'morto';
                    p.rimborso = rimborso;
                    p.punti += 10; // Calcolo del capitano escluso
                    
                    if (!p.eventi) p.eventi = [];
                    p.eventi.push({
                        data: new Date().toISOString().split('T')[0],
                        desc: "💀 Morte",
                        valore: 10
                    });
                } else {
                    p.status = 'vivo';
                    p.rimborso = 0;
                    p.punti -= 10;
                    p.eventi = (p.eventi || []).filter(e => !e.desc.includes("💀 Morte"));
                }
            }
        });
    });
}

function adminSearchMorituro(query) {
    const container = document.getElementById('admin-search-results');
    if (!query || query.length < 2) {
        container.innerHTML = '';
        return;
    }

    let html = '<table class="admin-table"><tbody>';
    const nomiTrovati = [];
    db.campionato.forEach((s) => {
        s.partecipanti.forEach((p) => {
            if (p.nome.toLowerCase().includes(query.toLowerCase()) && !nomiTrovati.includes(p.nome)) {
                nomiTrovati.push(p.nome);
                const isDead = p.status === 'morto';
                html += `
                    <tr style="${isDead ? 'background: #251010;' : ''}">
                        <td style="padding: 10px;">
                            <strong style="color: ${isDead ? 'var(--accent)' : '#fff'}">${isDead ? '💀 ' : '😒 '}${p.nome}</strong> 
                        </td>
                        <td style="text-align:right; white-space: nowrap; padding-right: 10px;">
                            <button onclick="toggleMorte('${p.nome}')" 
                                style="background: ${isDead ? '#fff' : '#444'}; color: #000; margin-right: 5px; border: none; padding: 8px;">
                                ${isDead ? '😇 Resuscita' : '💀 Segna Morto'}
                            </button>
                            
                            <button onclick="aggiungiEvento('${p.nome}')" 
                                style="background: var(--accent); color:black; font-weight:bold; border: none; padding: 8px;">
                                ⚡ Punti
                            </button>
                        </td>
                    </tr>
                `;
            }
        });
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function searchAndRenderTable(query, found) {
    const container = document.getElementById('search-results-container');
    if (!found) {
        container.innerHTML = 'Scrivi un nome valido per visualizzare i dettagli.';
        return;
    }

    let resultsHtml = '';
    const q = query.toLowerCase();

    db.campionato.forEach(squadra => {
        squadra.partecipanti.forEach(p => {
            if (p.nome.toLowerCase().includes(q)) {
                resultsHtml += `
                    <div class="card" style="border-left: 4px solid var(--accent);">
                        <h4 style="margin:0 0 10px 0;">${p.nome} <span style="font-size:0.8rem; color:#888;">(${squadra.nome_squadra})</span></h4>
                        <p>Punti Totali: <strong>${p.punti || 0}</strong></p>
                        <table class="admin-table">
                            <thead>
                                <tr><th>Data</th><th>Evento</th><th>Punti</th></tr>
                            </thead>
                            <tbody>
                                ${(p.eventi || []).map(e => `
                                    <tr>
                                        <td>${e.data}</td>
                                        <td>${e.desc}</td>
                                        <td style="color:var(--accent)">+${e.valore}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3">Nessun evento registrato</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        });
    });

    container.innerHTML = resultsHtml || '<p>Non fa parte di nessuna squadra.</p>';
}

function getLastEvents(limit) {
    let allEvents = [];
    const chiaviEventi = new Set();

    db.campionato.forEach(s => {
        s.partecipanti.forEach(p => {
            if (p.eventi) {
                p.eventi.forEach(e => {
                    // Creiamo una firma unica per l'evento
                    const chiaveUnica = `${p.nome}-${e.data}-${e.desc}-${e.valore}`;

                    if (!chiaviEventi.has(chiaveUnica)) {
                        chiaviEventi.add(chiaveUnica);
                        allEvents.push({ nome: p.nome, ...e });
                    }
                });
            }
        });
    });

    // Ordina per data dalla più recente
    allEvents.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    return allEvents.slice(0, limit).map(e => `
        <tr>
            <td>${e.nome}</td>
            <td>${e.desc}</td>
            <td style="color:var(--accent); font-weight:bold;">+${e.valore}</td>
        </tr>
    `).join('');
}
