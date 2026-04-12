function renderSquadre(sortedTeams) {
    return sortedTeams.map(s => {
        const creditiResidui = calculateCreditiResidui(s);
        
        const ptsSquadra = puntiSquadra(s);
        const colorPtsSquadra = ptsSquadra > 0 ? 'label-positive' : ptsSquadra < 0 ? 'label-negative' : 'label-neutral';
        const teamId = "team-" + s.nome_squadra.replace(/\s+/g, '-').toLowerCase();

        return `
            <div class="apex-card" id="${teamId}">
                <div class="apex-header"">
                    <div class="apex-info-group">
                        <h2 class="apex-team-name">${s.nome_squadra}</h2>
                        <span class="apex-owner">@${s.proprietario}</span>
                    </div>

                    <div class="apex-stats-group">
                        <div class="apex-stat-item">
                            <div class="apex-stat-value value-neutral">${creditiResidui}</div>
                            <div class="apex-stat-label">BS Residui</div>
                        </div>

                        <div class="apex-divider"></div>
                            
                        <div class="apex-stat-item">
                            <div class="apex-stat-value ${colorPtsSquadra}">${ptsSquadra}</div>
                            <div class="apex-stat-label">PTS</div>
                        </div>
                    </div>

                </div>

                <div class="apex-body">
                    <div class="apex-table-header">
                        <div class="col-name label-col">Componenti</div>
                        <div class="col-numb label-col">Costo</div>
                        <div class="col-numb label-col">Rimborso</div>
                        <div class="col-numb label-col">Punti</div>
                    </div>

                    ${[...s.partecipanti].sort((a, b) => puntiMorto(s, b) - puntiMorto(s, a)).map(p => {
                        const isDead = isPDead(p);
                        const isCap = s.capitano === p.nome;
                        const isExCap = s.excapitani ? s.excapitani.includes(p.nome) : false;
                        const rowPtsClass = p.punti > 0 ? 'label-positive' : (p.punti < 0 ? 'label-negative' : 'label-neutral');

                        const hasBeenCap = isCap || isExCap;
                        const badgeText = isCap ? "CAP" : (isExCap ? "EX-CAP" : "");
                        const badgeColor = isCap ? "#FFD700" : (isExCap ? "#A89060" : "#eee");

                        return `
                        <div class="apex-row">
                            <div class="col-name">
                                <div class="status-dot" style="opacity: ${isDead ? '1' : '0.2'}">${isDead ? '💀' : '⏳'}</div>
                                ${hasBeenCap ? `<span class="cap-badge" style="color: ${badgeColor}; border: 1px solid ${badgeColor}">${badgeText}</span>` : ''}
                                <span class="${isDead ? 'dead-text' : ''}" style="color: ${badgeColor}; font-weight: bold">
                                    ${p.nome}
                                </span>
                            </div>

                            <div class="col-numb" style="opacity: 0.5;">${p.prezzo}</div>
                            <div class="col-numb" style="opacity: 0.5;">${p.rimborso}</div>
                            <div class="col-numb ${rowPtsClass}">${p.punti}</div>
                        </div>
                        `;
                    }).join('')}
                        
                    </div>
                </div>
            </div>
        `;
    }).join('');
}