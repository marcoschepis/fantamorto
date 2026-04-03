function isPDead(p) {
    return p && p.status === 'morto';
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
        const costo = p ? p.prezzo : 0;
        let rimborso = 0;
        if (isPDead(p)) {
            rimborso = (p.rimborso || 0);
        }
        else {
            rimborso = 0;
        }

        return acc + costo - rimborso;
    }, 0);
}

function calculateCreditiInizialiSquadra(squadra) {
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
    return (db.config.crediti_iniziali || 330) - spesa;
}

function numeroMaxPartecipanti(squadra) {
    const conteggioMorti = squadra.partecipanti.filter(p => {
        return isPDead(p);
    }).length;
    return 13 + conteggioMorti;
}

function setCapitano(tIdx, pIdx) {
    const squadra = db.campionato[tIdx];
    
    // Impostiamo il nuovo capitano
    squadra.capitano = squadra.partecipanti[pIdx].nome;
    
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

    // --- CONTROLLO 1: Già in squadra ---q 
    if (squadra.partecipanti.find(p => p.nome.toLowerCase() === infoMorituro.nome.toLowerCase())) {
        alert(`⚠️ ${infoMorituro.nome} è già presente in questa squadra.`);
        return;
    }

    // --- CONTROLLO 2: Limite 13 + morti ---
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

function puntiSquadra(s, p){
    s.totPunti = s.partecipanti.reduce((acc, p) => {
        return acc + puntiMorto(p) + puntiCapitano(s, p);
    }, 0);
}

async function saveToGitHub() {
    // Chiediamo il codice segreto agli amici (il tuo Token)
    // Lo metteranno una volta sola, poi il browser lo ricorda
    const sel = document.getElementById('user-team-select');
    autore = sel.options[sel.selectedIndex].text || 'utente';

    if (autore == "-- Seleziona la tua squadra --") autore = "ADMIN";

    const squadra = db.campionato[userIdx];
    if (autore !== "ADMIN" && userIdx !== "") {
        // Controllo per l'utente singolo
        if (!squadra.capitano || squadra.capitano === "") {
            alert("⚠️ ATTENZIONE: Non hai selezionato un Capitano per la tua squadra\nClicca sulla ⚪ accanto ad un nome per renderlo capitano.");
            return; // Blocca il salvataggio
        }
    }
    
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
                    squadra: squadra
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

function updateMortoStatusSync(nome, statusAttuale) {
    const nuovoStatus = statusAttuale === 'vivo' ? 'morto' : 'vivo';
    db.campionato.forEach(s => {
        s.partecipanti.forEach(p => {
            if (p.nome === nome) p.status = nuovoStatus;
        });
    });
    render();
}

function aggiungiEvento(tIdx, pIdx) {
    const desc = prompt("Descrizione evento (es: Morte, Ricovero):");
    const punti = parseInt(prompt("Punti da assegnare:", "10"));
    
    if (desc && !isNaN(punti)) {
        const morituro = db.campionato[tIdx].partecipanti[pIdx];
        if (!morituro.eventi) morituro.eventi = [];
        
        // Aggiunge l'evento
        morituro.eventi.push({
            data: new Date().toISOString().split('T')[0],
            desc: desc,
            valore: punti
        });
        
        // Aggiorna il totale punti del morituro
        morituro.punti = (morituro.punti || 0) + punti;
        
        render(); // Ricarica tutto
        alert(`Assegnati ${punti} punti a ${morituro.nome}`);
    } else {
        alert("Evento o punti non validi.");
    }
}

function adminSearchMorituro(query) {
    const container = document.getElementById('admin-search-results');
    if (!query || query.length < 2) {
        container.innerHTML = '';
        return;
    }

    let html = '<table class="admin-table"><tbody>';
    db.campionato.forEach((s, sIdx) => {
        s.partecipanti.forEach((p, pIdx) => {
            if (p.nome.toLowerCase().includes(query.toLowerCase())) {
                html += `
                    <tr>
                        <td><strong>${p.nome}</strong> <br><small>${s.nome_squadra}</small></td>
                        <td style="text-align:right;">
                            <button onclick="aggiungiEvento(${sIdx}, ${pIdx})" style="background:var(--accent); color:black; font-weight:bold;">⚡ Assegna Punti</button>
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
    db.campionato.forEach(s => {
        s.partecipanti.forEach(p => {
            if (p.eventi) {
                p.eventi.forEach(e => {
                    allEvents.push({ nome: p.nome, ...e });
                });
            }
        });
    });
    // Ordina per data (assumendo formato YYYY-MM-DD o timestamp)
    allEvents.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    return allEvents.slice(0, limit).map(e => `
        <tr>
            <td>${e.nome}</td>
            <td>${e.desc}</td>
            <td style="color:var(--accent); font-weight:bold;">+${e.valore}</td>
        </tr>
    `).join('');
}