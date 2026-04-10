function renderSquadre(sortedTeams) {
    return sortedTeams.map(s => {
        const creditiResidui = calculateCreditiResidui(s);
        
        // Logica colore Punti Totali
        const ptsSquadra = puntiSquadra(s);
        const colorPtsSquadra = ptsSquadra > 0 ? '#44ff44' : ptsSquadra < 0 ? '#ff4444' : '#fff';
        const teamId = "team-" + s.nome_squadra.replace(/\s+/g, '-').toLowerCase();

        return `
            <div class="card" id="${teamId}">
                <div class="team-header" style="display: flex; flex-wrap: nowrap; align-items: center; justify-content: space-between; gap: 10px;">
                    
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 1.4rem; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${s.nome_squadra}
                        </div>
                        <div style="font-size: 0.85rem; color: #666; white-space: nowrap;">
                            Proprietario: <span style="color: #aaa;">${s.proprietario}</span> • 
                            Residui: <span style="color: #aaa; font-weight: bold;">${creditiResidui} BS</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-shrink: 0; text-align: center; background: rgba(0,0,0,0.2); padding: clamp(8px, 2vw, 15px); border-radius: 12px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; flex-direction: column; justify-content: center;">
                            <div style="color: #555; font-size: clamp(0.55rem, 1.5vw, 0.7rem); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px;">Punti</div>
                            <div style="color: ${colorPtsSquadra}; font-weight: 900; font-size: clamp(1.4rem, 5vw, 2rem); line-height: 1; text-shadow: 0 0 15px ${colorPtsSquadra}33;">
                                ${ptsSquadra}
                            </div>
                        </div>
                    </div>
                </div>

                <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="font-size: 0.65rem; color: #444; text-transform: uppercase; letter-spacing: 1px;">
                            <th style="text-align: left; padding-bottom: 10px; width: 45%;">Nome</th>
                            <th style="text-align: center; padding-bottom: 10px;">Costo</th>
                            <th style="text-align: center; padding-bottom: 10px;">Rimb.</th>
                            <th style="text-align: right; padding-bottom: 10px;">Punti</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[...s.partecipanti].sort((a, b) => puntiMortoTot(s, b) - puntiMortoTot(s, a)).map(p => {
                            const isDead = isPDead(p);
                            const isCapitano = s.capitano === p.nome;
                            const ptsInd = puntiMortoTot(s, p);
                            const colorPtsInd = ptsInd > 0 ? '#44ff44' : ptsInd < 0 ? '#ff4444' : (isDead ? '#fff' : '#666');

                            return `
                                <tr class="${isDead ? 'dead-row' : ''}">
                                    <td style="text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 12px 0;">
                                        <span class="status-icon">${isDead ? '💀' : '⏳'}</span>
                                        <span style="color: ${isCapitano ? '#FFD700' : '#eee'}; font-weight: ${isCapitano ? 'bold' : 'normal'};">
                                            ${isCapitano ? '⭐' : ''}${p.nome}
                                        </span>
                                    </td>
                                    <td style="text-align: center; font-family: monospace; color: #888;">${p.prezzo || 0}</td>
                                    <td style="text-align: center; font-family: monospace; color: #888;">${p.rimborso || 0}</td>
                                    <td style="text-align: right; font-weight: bold; color: ${colorPtsInd}; font-size: 1.1rem;">
                                        ${ptsInd}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}