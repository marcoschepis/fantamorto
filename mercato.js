function renderMercato() {  
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
                <table class="mercato-table" style="width: 100%; border-collapse: collapse; padding: 0px 0px 0px 0px;">
                    <thead>
                        <tr>
                            <th style="width: 60px; text-align: center; vertical-align: middle; font-size: 0.8rem;">Capitano</th>
                            <th style="text-align: left; vertical-align: middle;">Nome</th>
                            <th style="text-align: center; vertical-align: middle; width: 60px;">BS</th>
                            <th style="text-align: right; vertical-align: middle; width: 55px;">Elimina</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s.partecipanti.map((p, i) => {
                            const m = getMortoByName(p.nome);
                            const isCapitano = s.capitano === p.nome;
                            return `
                            <tr>
                                <td style="text-align: center; vertical-align: middle; cursor: pointer; font-size: 1.2rem;" 
                                    onclick="setCapitano(${userIdx}, ${i})" 
                                    title="Rendi Capitano">
                                    ${isCapitano ? '⭐' : '⚪'}
                                </td>
                                <td style="text-align: left; vertical-align: middle; word-break: break-word;">
                                    <div style="font-weight: bold; color: #eee;">${p.nome}</div>
                                </td>
                                <td style="text-align: center; vertical-align: middle; color: #aaa; font-family: monospace;">
                                    ${m ? m.prezzo : 0}
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                                    <button class="btn-del" 
                                        style="height: 35px; width: 40px; padding: 0; display: inline-flex; align-items: center; justify-content: center; background: #222; border: 1px solid #444; border-radius: 4px;"
                                        onclick="db.campionato[${userIdx}].partecipanti.splice(${i},1);render();">❌</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="display:flex; flex-wrap: wrap; gap:10px; margin-top:20px; background:#111; padding:15px; border-radius:8px; border: 1px solid #333;">
                    <input type="text" id="user-add-nome" list="lista-suggerimenti" placeholder="Cerca nel listino..." 
                        oninput="aggiornaPrezzoAutomatico(this.value, 'user-add-prezzo')"
                        style="flex: 1 1 100%; min-width: 180px;"> <input type="number" id="user-add-prezzo" placeholder="BS" readonly value="0" 
                        style="flex: 1; min-width: 60px; padding: 6px; background: #111; border: 1px solid #444; color: white; border-radius: 4px; text-align: center;">
                    
                    <button class="btn-add" onclick="aggiungiADb(${userIdx}, 'user-add-nome')" 
                        style="flex: 2; padding: 10px; white-space: nowrap; background: var(--accent); color: black; font-weight: bold;">
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