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

        /*
        // Gestione Morituri
        html += `
            <div class="card" style="border: 2px solid var(--accent);">
                <h3 style="margin-top: 0; color: var(--accent);">💀 Gestione Morituri (Estratti dalle Squadre)</h3>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th style="width: 40%;">Nome</th>
                            <th style="width: 10%;">BS</th>
                            <th style="width: 10%;">Punti</th>
                            <th style="width: 10%;">Status</th>
                            <th style="width: 10%;">Rimborso</th>
                            <th style="width: 10%;">Azione</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listaUnicaMorituri.map((m) => `
                            <tr style="background: ${m.status === 'morto' ? '#1a0a0a' : ''};">
                                <td><strong>${m.nome}</strong></td>
                                <td>
                                    <input type="number" value="${m.prezzo}" 
                                    onchange="updateMortoPrezzoSync('${m.nome}', this.value)" 
                                    style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white;">
                                </td>
                                <td>
                                    <input type="number" value="${m.punti}" 
                                    onchange="updateMortoPointsSync('${m.nome}', this.value)" 
                                    style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white;">
                                </td>
                                <td style="text-align: center; cursor: pointer; font-size: 1.2rem;" 
                                    onclick="updateMortoStatusSync('${m.nome}', '${m.status}')">
                                    ${m.status === 'morto' ? '💀' : '😒'}
                                </td>
                                <td>
                                    <input type="number" value="${m.rimborso || 0}" 
                                    onchange="updateMortoRimborsoSync('${m.nome}', this.value)" 
                                    style="width: 100%; padding: 4px; background: #111; border: 1px solid #444; color: white;">
                                </td>
                                <td>
                                    <button onclick="rimuoviOvunque('${m.nome}')" 
                                        style="width: 100%; padding: 4px; background: #8B0000; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
        `;
        */

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
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                                <input type="text" value="${s.nome_squadra}" onchange="db.campionato[${tIdx}].nome_squadra = this.value; render();" placeholder="Nome Squadra" style="flex: 1; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                                <input type="text" value="${s.proprietario}" onchange="db.campionato[${tIdx}].proprietario = this.value; render();" placeholder="Proprietario" style="flex: 0.6; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px;">
                                <span style="padding: 6px; color: ${residui < 0 ? '#ff4444' : '#44ff44'}; font-weight: bold;">Crediti residui: ${residui}</span>
                                <button onclick="removeSquadra(${tIdx})"
                                        style="padding: 6px 12px; background: var(--accent); border: none; color: #000; font-weight: bold; border-radius: 4px; cursor: pointer;">🗑️
                                </button>
                            </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    return html;
}