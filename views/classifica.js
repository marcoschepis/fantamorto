function renderClassifica(sortedTeams) {
    let html = `
        <div style="display: flex; padding: 0 20px 10px 20px; font-size: 0.7rem; color: #555; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">
            <div style="flex: 0 0 50px;">Pos</div>
            <div style="flex: 1;">Squadra</div>
            <div style="text-align: right;">Punti</div>
        </div>
    `;

    html += sortedTeams.map((s, index) => {
        const posizione = index + 1;
        
        // Colori dinamici per il podio
        const colors = {
            1: { main: '#FFD700'},
            2: { main: '#C0C0C0' },
            3: { main: '#CD7F32' },
            default: { main: '#444', bg: 'transparent' }
        };

        const style = colors[posizione] || colors.default;
        const icona = posizione === 1 ? '🥇' : posizione === 2 ? '🥈' : posizione === 3 ? '🥉' : posizione;

        const teamId = "team-" + s.nome_squadra.replace(/\s+/g, '-').toLowerCase();

        return `
            <div class="team-card" onclick="goToTeam('${teamId}')" style="border-left: 4px solid ${style.main}">
                <div style="flex: 0 0 50px;">
                    <div class="rank-badge" style="color: ${style.main}">${icona}</div>
                </div>

                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 1.05rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${s.nome_squadra}
                    </div>
                    <div style="font-size: 0.8rem; color: #666; font-weight: 500;">
                        <span style="color: #444">@</span>${s.proprietario}
                    </div>
                </div>

                <div style="text-align: right; margin-left: 10px;">
                    <div style="font-size: 1.6rem; font-weight: 900; color: #fff; line-height: 1;">${puntiSquadra(s)}</div>
                    <div style="font-size: 0.6rem; font-weight: bold; letter-spacing: 1px;">PTS</div>
                </div>
            </div>
        `;
    }).join('');

    return html;
}