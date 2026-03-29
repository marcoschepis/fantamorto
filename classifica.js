function renderClassifica(sortedTeams) {
    let html = `
        <div style="display: flex; padding: 0 20px 10px 20px; font-size: 0.75rem; color: #666; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">
            <div style="flex: 0 0 40px;">Pos</div>
            <div style="flex: 1; text-align: left;">Squadra</div>
            <div style="text-align: right;">Punti</div>
        </div>
    `;
    
    html += sortedTeams.map((s, index) => {
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

    return html;
}

