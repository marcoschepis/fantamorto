function renderSquadre(sortedTeams) {
    let html = '';
    
    sortedTeams.forEach((s) => {
        html += `
            <div class="card">
                <div class="team-header" style="display: flex; align-items: flex-end; padding-bottom: 15px; margin-bottom: 10px;">
                    <div style="flex: 0 0 40%; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">${s.nome_squadra}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #888;">${s.proprietario} - Crediti disponibili: ${calculateCreditiResidui(s)}</div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-align: center; ">Bossetti utilizzati</div>
                        <div style="color: #fff; font-weight: bold;">
                            ${calculateCreditiInizialiSquadra(s)}
                            <span style="font-weight: normal; color: #fff; font-size: 0.8em;"> / ${db.config.crediti_iniziali || 330}</span>
                        </div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-align: center; ">Rimborso bossetti</div>
                        <div style="color: #fff; font-weight: bold;">
                            ${calculateRimborsoCreditiSquadra(s)}
                        </div>
                    </div>

                    <div style="flex: 0 0 20%; text-align: right;">
                        <div style="color: #888; font-size: 0.75rem;">Punti</div>
                        <div class="rank-punti" style="line-height: 1; margin-top: 2px;">${s.totPunti}</div>
                    </div>
                </div>

                <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                    ${[...s.partecipanti].sort((a, b) => {
                        const mA = getMortoByName(a.nome);
                        const mB = getMortoByName(b.nome);
                        return (puntiMortoTot(s, b)) - (puntiMortoTot(s, a));
                    }).map(p => {
                        const morto = getMortoByName(p.nome);
                        const isDead = morto && morto.status === 'morto';
                        const isCapitano = s.capitano === p.nome;
                        return `
                            <tr class="${isDead ? 'dead-row' : ''}">
                                <td class="col-nome" style="width: 40%; text-align: left;">
                                    <span style="margin-right: 5px;">${isDead ? '💀' : '😒'}</span>
                                    <span style="color: #eee;">${isCapitano ? '⭐ ' : ''}${p.nome}</span>
                                </td>
                                <td style="width: 20%; text-align: center; font-size: 1rem; color: #aaa; font-family: monospace;">
                                    ${morto ? morto.prezzo : '?'} <small style="color: #555; text-align: center;">BS</small>
                                </td>
                                <td style="width: 20%; text-align: center; font-size: 1rem; color: #aaa; font-family: monospace;">
                                    ${morto ? morto.rimborso : '?'} <small style="color: #555; text-align: center;">BS</small>
                                </td>
                                <td class="col-punti" style="width: 20%; text-align: right; font-weight: bold;">
                                    ${puntiMortoTot(s, p)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </table>
            </div>
        `;
    });

    return html;
}