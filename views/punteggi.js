function renderPunti() {
    let html = ``;
    
    // SEZIONE 1: Ultimi punti aggiunti (LOG)
    html += `
        <div class="card">
            <h3 style="color: var(--accent); margin-top:0;">🕒 Ultimi Aggiornamenti</h3>
            <table class="admin-table">
                <thead>
                    <tr><th>Morituro</th><th>Evento</th><th>Punti</th></tr>
                </thead>
                <tbody id="last-events-body">
                    ${getLastEvents(10)} 
                </tbody>
            </table>
        </div>`;

    // SEZIONE 2: Ricerca Morituro
    html += `
        <div class="card">
            <h3 style="color: var(--accent);">🔍 Cerca Morituro</h3>
            <input type="text" id="search-morituro" list="lista-suggerimenti" placeholder="Scrivi il nome..." 
                onkeyup="searchAndRenderTable(this.value, aggiornaNomeAutomatico(this.value, 'search-morituro'))" 
                style="width:100%; padding:10px; background:#000; border:1px solid #444; color:white; border-radius:8px;">

            <div id="search-results-container" style="margin-top:20px;"></div>
        </div>`;

    // SEZIONE 3: Storico per Squadra
    html += `
        <div class="card">
            <h3 style="color: var(--accent);">🛡️ Eventi Squadra</h3>
            <select id="select-squadra-punti" onchange="renderStoricoSquadra(this.value)" 
                style="width:100%; padding:10px; background:#000; border:1px solid #444; color:white; border-radius:8px; cursor:pointer;">
                <option value="">Seleziona una squadra...</option>
                ${db.campionato.map((s, idx) => `<option value="${idx}">${s.nome_squadra}</option>`).join('')}
            </select>

            <div id="squadra-events-container" style="margin-top:20px;"></div>
        </div>`;

    return html;
}