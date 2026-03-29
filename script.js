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

function loadData() {
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
    render();
}

function render() {
    const rankCont = document.getElementById('rank-container');
    const teamsCont = document.getElementById('teams-container');
    const adminCont = document.getElementById('admin-container');
    rankCont.innerHTML = '';
    teamsCont.innerHTML = '';
    adminCont.innerHTML = '';

    // Calcoli totali per squadra
    db.campionato.forEach(s => { puntiSquadra(s); });

    const sortedTeams = [...db.campionato].sort((a, b) => b.totPunti - a.totPunti);

    // --- Vista Classifica ---
    rankCont.innerHTML += `
        <div style="display: flex; padding: 0 20px 10px 20px; font-size: 0.75rem; color: #666; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">
            <div style="flex: 0 0 40px;">Pos</div>
            <div style="flex: 1; text-align: left;">Squadra</div>
            <div style="text-align: right;">Punti</div>
        </div>
    `;
    rankCont.innerHTML += sortedTeams.map((s, index) => {
        const posizione = index + 1;
        let icona = posizione;
        if (posizione === 1) icona = '🥇';
        else if (posizione === 2) icona = '🥈';
        else if (posizione === 3) icona = '🥉';

        const podioColor = posizione === 1 ? '#FFD700' : // Oro
            posizione === 2 ? '#C0C0C0' : // Argento
            posizione === 3 ? '#CD7F32' : // Bronzo
            '#333';                       // Grigio scuro per gli altri

        return `
            <div class="team-card" style="display: flex; align-items: center; padding: 15px; margin-bottom: 12px; border-left: 4px solid ${podioColor};">
                <div style="flex: 0 0 40px; font-size: 1.2rem; font-weight: bold; color: ${podioColor};">
                    ${icona}
                </div>
                <div style="flex: 1; text-align: left;">
                    <div style="flex: 1; align-items: center; gap: 5px;">
                        <div style="font-size: 1.1rem; font-weight: bold; color: #fff; line-height: 1.2;">
                            ${s.nome_squadra}
                        </div>
                    </div>
                    <div style="font-size: 0.85rem; color: #888">
                        ${s.proprietario}
                    </div>
                </div>
                <div style="text-align: right; font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1;">
                    ${s.totPunti}
                </div>
            </div>
        `;
    }).join('');

    // --- Vista Squadre ---
    sortedTeams.forEach((s) => {
        const tIdx = db.campionato.indexOf(s);

        teamsCont.innerHTML += `
            <div class="card">
                <div class="team-header" style="display: flex; align-items: flex-end; padding-bottom: 15px; margin-bottom: 10px;">
                    <div style="flex: 0 0 40%; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">${s.nome_squadra}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #888;">${s.proprietario} - Crediti disponibili: ${calculateCreditiResidui(s)}</div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-align: center; ">Bossetti utilizzati</div>
                        <div style="color: #fff; font-weight: bold;">
                            ${calculateCreditiInizialiSquadra(s)}
                            <span style="font-weight: normal; color: #fff; font-size: 0.8em;"> / ${db.config.crediti_iniziali || 330}</span>
                        </div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-align: center; ">Rimborso bossetti</div>
                        <div style="color: #fff; font-weight: bold;">
                            ${calculateRimborsoCreditiSquadra(s)}
                        </div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: right;">
                        <div style="color: #888; font-size: 0.75rem;">Punti</div>
                        <div class="rank-punti" style="line-height: 1; margin-top: 2px;">${s.totPunti}</div>
                    </div>
                </div>

                <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                    ${[...s.partecipanti].sort((a, b) => {
                        const mA = getMortoByName(a.nome);
                        const mB = getMortoByName(b.nome);
                        return (puntiMortoTot(s, b)) - (puntiMortoTot(s, a));
                    }).map(p => {
                        const morto = getMortoByName(p.nome);
                        const isDead = morto && morto.status === 'morto';
                        const isCapitano = s.capitano === p.nome;
                        return `
                            <tr class="${isDead ? 'dead-row' : ''}">
                                <td class="col-nome" style="width: 40%; text-align: left;">
                                    <span style="margin-right: 5px;">${isDead ? '💀' : '😒'}</span>
                                    <span style="color: #eee;">${isCapitano ? '⭐ ' : ''}${p.nome}</span>
                                </td>
                                <td style="width: 20%; text-align: center; font-size: 1rem; color: #aaa; font-family: monospace;">
                                    ${morto ? morto.prezzo : '?'} <small style="color: #555; text-align: center;">BS</small>
                                </td>
                                <td style="width: 20%; text-align: center; font-size: 1rem; color: #aaa; font-family: monospace;">
                                    ${morto ? morto.rimborso : '?'} <small style="color: #555; text-align: center;">BS</small>
                                </td>
                                <td class="col-punti" style="width: 20%; text-align: right; font-weight: bold;">
                                    ${puntiMortoTot(s, p)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </table>
            </div>
        `;
    });

    // --- SEZIONE GESTIONE ADMIN ---
    if (isAuthorized) {
        // Configurazione Visibilità
        adminCont.innerHTML += `
            <div class="card" style="border: 2px solid #44aaff;">
                <h3 style="margin-top: 0; color: #44aaff;">🌐 Configurazione Visibilità</h3>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="check-visibilita-mercato" 
                        ${db.config.mostra_mercato !== false ? 'checked' : ''} 
                        onchange="db.config.mostra_mercato = this.checked; render();"
                        style="width: 20px; height: 20px;">
                    <span style="font-size: 1.1rem; font-weight: bold;">Abilita Tab "⚙️ Gestione Squadra" per gli utenti</span>
                </label>
            </div>
        `;

        // Gestione Morituri
        adminCont.innerHTML += `
            <div class="card" style="border: 2px solid var(--accent);">
                <h3 style="margin-top: 0; color: var(--accent);">💀 Gestione Morituri</h3>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">Nome</th>
                            <th style="width: 10%;">Prezzo</th>
                            <th style="width: 10%;">Punti</th>
                            <th style="width: 10%;">Status</th>
                            <th style="width: 10%;">Azione</th>
                            <th style="width: 10%;">Rimborso</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.morituri.map((m, mIdx) => `
                            <tr style="background: ${m.status === 'morto' ? '#1a0a0a' : ''};">
                                <td><strong>${m.nome}</strong></td>
                                <td><input type="number" value="${m.prezzo}" onchange="updateMortoPrezzo(${mIdx}, this.value)" style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white; box-sizing: border-box;"></td>
                                <td><input type="number" value="${m.punti}" onchange="updateMortoPoints(${mIdx}, this.value)" style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white; box-sizing: border-box;"></td>
                                <td style="text-align: center; cursor: pointer; user-select: none; font-size: 1.2rem; padding: 8px;" onclick="updateMortoStatus(${mIdx})" title="Clicca per cambiare status">${m.status === 'morto' ? '💀' : '😒'}</td>
                                <td><button onclick="removeMorto(${mIdx})" style="width: 100%; padding: 4px; background: #8B0000; border: 1px solid #555; color: white; border-radius: 4px; cursor: pointer; font-weight: bold;">❌</button></td>
                                <td><input type="number" value="${m.rimborso}" onchange="updateMortoRimborso(${mIdx}, this.value)" style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white; box-sizing: border-box;">
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 15px; padding: 12px; background: #0a0a0a; border-radius: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <input type="text" id="new-morto-nome" list="lista-suggerimenti" placeholder="Cerca nome..." oninput="aggiornaPrezzoAutomatico(this.value, 'new-morto-prezzo')" style="flex: 1; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();">
                    <datalist id="lista-suggerimenti"></datalist>
                    <input type="number" id="new-morto-prezzo" placeholder="BS" value="0" style="width: 120px; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                    <button onclick="addMorto()" style="padding: 6px 12px; background: var(--accent); border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">➕ Aggiungi</button>
                </div>
            </div>
        `;

        // Gestione Squadre
        adminCont.innerHTML += `
            <div class="card" style="border: 2px solid var(--accent); margin-top: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: var(--accent);">⚽ Gestione Squadre</h3>
                    <button onclick="addSquadra()" style="padding: 8px 15px; background: var(--accent); border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">➕ Nuova Squadra</button>
                </div>
                ${db.campionato.map((s, tIdx) => {
                    const totCrediti = calculateCreditiSquadra(s);
                    const residui = calculateCreditiResidui(s);
                    return `
                        <div style="margin-bottom: 25px; padding: 15px; background: #0a0a0a; border-radius: 8px;">
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                                <input type="text" value="${s.nome_squadra}" onchange="db.campionato[${tIdx}].nome_squadra = this.value; render();" placeholder="Nome Squadra" style="flex: 1; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                                <input type="text" value="${s.proprietario}" onchange="db.campionato[${tIdx}].proprietario = this.value; render();" placeholder="Proprietario" style="flex: 0.6; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                                <span style="padding: 6px; color: ${residui < 0 ? '#ff4444' : '#44ff44'}; font-weight: bold;">Crediti residui: ${residui}</span>
                                <button onclick="removeSquadra(${tIdx})"
                                        style="padding: 6px 12px; background: var(--accent); border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">🗑️
                                </button>
                                </div>
                            <table class="admin-table" style="font-size: 0.85rem;">
                                <thead>
                                    <tr>
                                        <th style="width: 50%;">Partecipante</th>
                                        <th style="width: 25%;">Crediti</th>
                                        <th style="width: 25%;">Azione</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${s.partecipanti.map((p, pIdx) => {
                                        const morto = getMortoByName(p.nome);
                                        return `
                                            <tr ${morto && morto.status === 'morto' ? 'style="background: #1a0a0a;"' : ''}>
                                                <td>${p.nome}</td>
                                                <td>${morto ? morto.prezzo : '?'}</td>
                                                <td><button onclick="db.campionato[${tIdx}].partecipanti.splice(${pIdx}, 1); render();" style="width: 100%; padding: 4px; background: #333; border: 1px solid #555; color: white; border-radius: 4px; cursor: pointer;">❌</button></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                            <div style="margin-top: 10px; display: flex; gap: 5px;">
                                <select id="moriti-list-${tIdx}" style="flex: 1; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                                    <option value="">-- Aggiungi partecipante --</option>
                                    ${db.morituri.filter(m => !s.partecipanti.find(p => p.nome === m.nome)).map(m => `<option value="${m.nome}">${m.nome}</option>`).join('')}
                                </select>
                                <button onclick="aggiungiADb(${tIdx}, 'moriti-list-${tIdx}')" style="padding: 6px 12px; background: ${s.partecipanti.length >= 13 ? '#333' : 'var(--accent)'}; border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">➕
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    const datalist = document.getElementById('lista-suggerimenti');
    if (datalist) {
        datalist.innerHTML = catalogoMorituri.map(m => `<option value="${m.nome}">`).join('');
    }


    // Gestione Squadra
    const btnMercato = document.getElementById('btn-mercato');
    const userIdx = document.getElementById('user-team-select').value;
    const mercatoEditor = document.getElementById('mercato-editor');
    const morituriDisplay = document.getElementById('mercato-morituri-display');
    const budgetDisplay = document.getElementById('mercato-budget-display');
    const userSelect = document.getElementById('user-team-select');
    const headerMercato = document.querySelector('#view-mercato .card > div:first-child');
    const saveBtnMercato = document.querySelector('#view-mercato button[onclick*="saveToGitHub"]');

    if (db.config.mostra_mercato) {
        btnMercato.innerHTML = "⚙️ Gestione Squadra";

        if (headerMercato) headerMercato.style.display = 'flex';
        if (saveBtnMercato) saveBtnMercato.style.display = 'inline-block';

        // Popola la select se vuota (una sola volta)
        if (userSelect && userSelect.options.length <= 1) {
            userSelect.innerHTML = '<option value="">-- Seleziona la tua squadra --</option>' + db.campionato.map((s, i) => `<option value="${i}">${s.nome_squadra} - ${s.proprietario}</option>`).join('');
        }

        if (userIdx !== "" && mercatoEditor) {
            const s = db.campionato[userIdx];
            const res = calculateCreditiResidui(s);

            // 1. Aggiorna il numero e il budget accanto alla select
            morituriDisplay.innerHTML = `<strong>Morituri: <span style="color: #44ff44">${s.partecipanti.length}</span>/${numeroMaxPartecipanti(s)}</strong>`;
            budgetDisplay.innerHTML = `<strong>Crediti: <span style="color: #44ff44">${res} BS</span></strong>`;

            // 2. Renderizza la tabella dei partecipanti
            mercatoEditor.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th style="width: 7%; white-space: nowrap;">Capitano</th>
                            <th>Nome</th>
                            <th style="text-align:center;">Bossetti</th>
                            <th style="text-align:right;">Azione</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s.partecipanti.map((p, i) => {
                            const m = getMortoByName(p.nome);
                            const isCapitano = s.capitano === p.nome; // Verifica se è il capitano
                            return `
                            <tr>
                                <td style="width: 7%; white-space: nowrap; text-align: center; vertical-align: middle; cursor: pointer; font-size: 1.2rem; padding: 10px 5px;" 
                                    onclick="setCapitano(${userIdx}, ${i})" 
                                    title="Rendi Capitano">
                                    ${isCapitano ? '⭐' : '⚪'}
                                </td>
                                <td style="text-align: left; vertical-align: middle;">${p.nome}</td>
                                <td style="text-align: center; vertical-align: middle; color: #aaa;">${m ? m.prezzo : 0} <small>BS</small></td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <button class="btn-del" 
                                        style="height: 32px; width: 44px; padding: 0; display: inline-flex; align-items: center; justify-content: center; background: #333; border: 1px solid #444;"
                                        onclick="db.campionato[${userIdx}].partecipanti.splice(${i},1);render();">❌</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="display:flex; flex-wrap: wrap; gap:10px; margin-top:20px; background:#111; padding:15px; border-radius:8px; border: 1px solid #333;">
                    <input type="text" id="user-add-nome" list="lista-suggerimenti" placeholder="Cerca nel listino..." 
                        oninput="aggiornaPrezzoAutomatico(this.value, 'user-add-prezzo')"
                        style="flex: 2; min-width: 180px;">
                    
                    <input type="number" id="user-add-prezzo" placeholder="BS" readonly value="0" 
                        style="flex: 1; min-width: 70px; max-width: 100px; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px; text-align: center;">
                    
                    <button class="btn-add" onclick="aggiungiADb(${userIdx}, 'user-add-nome')" 
                        style="flex: 1; min-width: 120px; padding: 10px; white-space: nowrap; background: var(--accent); color: black; font-weight: bold;">
                        ➕ Aggiungi
                    </button>
                </div>
            `;
        } else {
            // Pulisce se non è selezionato nulla
            if(budgetDisplay) budgetDisplay.innerHTML = "";
            if(mercatoEditor) mercatoEditor.innerHTML = '<p style="text-align:center; color:#666;">Seleziona la tua squadra per iniziare.</p>';
        }
    } else {
        btnMercato.innerHTML = "🔒 Mercato Chiuso";
        if (headerMercato) headerMercato.style.display = 'none';
        if (saveBtnMercato) saveBtnMercato.style.display = 'none';
        
        if (mercatoEditor) {
            mercatoEditor.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #555;">
                    <h2 style="color: #444; letter-spacing: 2px;">Non è possibile effettuare modifiche</h2>
                    <p>Il mercato di riparazione riaprirà dal 1° al 15 Agosto 2026 e dal 1° al 15 Dicembre 2026.</p>
                </div>
            `;
        }
    }
}