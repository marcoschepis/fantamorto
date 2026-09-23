function renderPunti() {
    let html = `<div style="max-width: 800px; margin: auto;">`;

    // SEZIONE 1: ULTIMI AGGIORNAMENTI
    html += `
        <div class="card" style="border-top: 3px solid #44ff44;">
            <div class="card-header">
                <span class="card-icon">🕒</span>
                <h3 style="text-transform: uppercase;">Ultimi eventi</h3>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="color: #555; text-transform: uppercase; font-size: 0.7rem; border-bottom: 1px solid #222;">
                            <th style="text-align: left; padding: 10px;">Data</th>
                            <th style="text-align: left; padding: 10px;">Morituro</th>
                            <th style="text-align: left; padding: 10px;">Evento</th>
                            <th style="text-align: right; padding: 10px;">Punti</th>
                        </tr>
                    </thead>
                    <tbody id="last-events-body">
                        ${getLastEvents(10)}
                    </tbody>
                </table>
            </div>
        </div>`;

    // SEZIONE 2: RICERCA
    html += `
        <div class="card">
            <div class="card-header">
                <span class="card-icon">🔍</span>
                <h3>Cerca Morituro</h3>
            </div>
            
            <div style="position: relative;">
                <input type="text" id="search-morituro" class="input-modern" list="lista-suggerimenti" 
                    placeholder="Inizia a scrivere il nome di un personaggio..." 
                    onkeyup="searchAndRenderTable(this.value, aggiornaNomeAutomatico(this.value, 'search-morituro'))">
            </div>

            <div id="search-results-container" style="margin-top:20px;"></div>
        </div>`;

    // SEZIONE 3: STORICO SQUADRA
    html += `
        <div class="card">
            <div class="card-header">
                <span class="card-icon">🛡️</span>
                <h3>Analisi Squadra</h3>
            </div>
            
            <select id="select-squadra-punti" class="input-modern" onchange="renderStoricoSquadra(this.value)" style="cursor: pointer;">
                <option value="">Seleziona una squadra per vedere i bonus...</option>
                ${db.campionato.map((s, idx) => `
                    <option value="${idx}">${s.nome_squadra}</option>
                `).join('')}
            </select>

            <div id="squadra-events-container" style="margin-top:20px;"></div>
        </div>`;

    html += `</div>`;
    return html;
}