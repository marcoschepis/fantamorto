function renderSquadre(sortedTeams) {
    return sortedTeams.map(s => {
        const creditiResidui = calculateCreditiResidui(s);
        const creditiUsati = calculateCreditiSquadra(s);
        const rimborsoTotale = calculateRimborsoCreditiSquadra(s);
        const creditiMax = (db.config.crediti_iniziali || 330) + rimborsoTotale;

        return `
            <div class="card">
                <div class="team-header" style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px;">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="font-size: 1.4rem; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">
                            ${s.nome_squadra}
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">
                            Proprietario: <span style="color: #aaa;">${s.proprietario}</span> • 
                            Residui: <span style="color: #aaa; font-weight: bold;">${creditiResidui} BS</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px; text-align: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px;">
                        <div>
                            <div style="color: #555; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;">Budget Usato</div>
                            <div style="color: #fff; font-weight: bold; font-size: 0.9rem;">
                                ${creditiUsati} <span style="color: #444;">/ ${creditiMax}</span>
                            </div>
                        </div>
                        <div style="border-left: 1px solid #333; padding-left: 20px;">
                            <div style="color: #555; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;">Punti Totali</div>
                            <div style="color: #44ff44; font-weight: 900; font-size: 1.2rem; line-height: 1;">
                                ${puntiSquadra(s)}
                            </div>
                        </div>
                    </div>
                </div>

                <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
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
                            
                            return `
                                <tr class="${isDead ? 'dead-row' : ''}">
                                    <td style="text-align: left;">
                                        <span class="status-icon">${isDead ? '💀' : '⏳'}</span>
                                        <span style="color: ${isCapitano ? '#FFD700' : '#eee'}; font-weight: ${isCapitano ? 'bold' : 'normal'};">
                                            ${isCapitano ? '<span title="Capitano">⭐</span> ' : ''}${p.nome}
                                        </span>
                                    </td>
                                    <td style="text-align: center; font-family: monospace; color: #888;">
                                        ${p.prezzo || 0}<small style="color: #444;"> BS</small>
                                    </td>
                                    <td style="text-align: center; font-family: monospace; color: #888;">
                                        ${p.rimborso || 0}<small style="color: #444;"> BS</small>
                                    </td>
                                    <td style="text-align: right; font-weight: bold; color: ${isDead ? '#fff' : '#666'}; font-size: 1.1rem;">
                                        ${puntiMortoTot(s, p)}
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