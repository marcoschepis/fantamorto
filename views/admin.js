function renderAdmin() {
    let html = '';

    const morituriMappa = {};
    db.campionato.forEach(squadra => {
        squadra.partecipanti.forEach(p => {
            // Se non l'abbiamo ancora aggiunto alla mappa, lo aggiungiamo
            if (!morituriMappa[p.nome]) {
                morituriMappa[p.nome] = p; 
            }
        });
    });
    const listaUnicaMorituri = Object.values(morituriMappa);

    if (isAuthorized) {
        // Configurazione Visibilità
        html += `
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
        /*
        html += `
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
                        ${listaUnicaMorituri.map((m, mIdx) => `
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
        html += `
            <div class="card" style="border: 2px solid var(--accent); margin-top: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: var(--accent);">⚽ Gestione Squadre</h3>
                    <button onclick="addSquadra()" style="padding: 8px 15px; background: var(--accent); border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">➕ Nuova Squadra</button>
                </div>
                ${db.campionato.map((s, tIdx) => {
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
        */
    }

    return html;
}