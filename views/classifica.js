function renderClassifica(sortedTeams) {
    if (!sortedTeams || sortedTeams.length === 0) return "";

    // Estraiamo i primi 3 per il podio
    const podio = sortedTeams.slice(0, 3);
    const restanti = sortedTeams.slice(3);

    let html = `
        <div style="display: flex; align-items: flex-end; justify-content: center; margin: 0 0 20px 0; min-height: 160px;">
            ${renderPodiumStep(podio[1], 2)} ${renderPodiumStep(podio[0], 1)} ${renderPodiumStep(podio[2], 3)}
        </div>
    `;

    html += restanti.map((s, index) => {
        const isLast = index === restanti.length - 1;
        const icona = isLast ? "🕯️" : index + 4;
        const teamId = "team-" + s.nome_squadra.replace(/\s+/g, '-').toLowerCase();
        const numMorti = s.partecipanti.filter(p => isPDead(p)).length;

        return `
            <div class="team-card" onclick="goToTeam('${teamId}')" style="border-left: 4px solid #444">
                <div style="flex: 0 0 50px;">
                    <div class="rank-badge" style="color: #888">${icona}</div>
                </div>

                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 1.05rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${s.nome_squadra}
                    </div>
                    <div style="font-size: 0.8rem; color: #666; font-weight: 500;">
                        <span style="color: #444">@</span>${s.proprietario}
                    </div>
                </div>

                <div class="points-unified style="color: #ff6b00">
                    <div class="points-value" style="font-size: 1.4rem; color: #ff6b00">${puntiSquadra(s)}</div>
                    <div class="points-label" style="font-size: 0.7rem; color: #ff6b00">PTS</div>
                </div>

                <div class="points-unified" style="color: #bb00ff">
                    <div class="points-value" style="font-size: 1.4rem; color: #bb00ff">${numMorti}</div>
                    <div class="points-label" style="font-size: 0.7rem; color: #bb00ff">RIP</div>
                </div>
            </div>
        `;
    }).join('');

    return html;
}

function renderPodiumStep(squadra, posizione) {
    if (!squadra) return '';

    const configs = {
        1: { 
            altezza: '110px', 
            colore: '#FFD700', 
            gradiente: '#8a6d3b', 
            icona: '🥇', 
            fontNome: '0.9rem', 
            fontPunti: '1.5rem', 
            flex: '1.2', 
            zIndex: '2'
        },
        2: { 
            altezza: '80px', 
            colore: '#C0C0C0', 
            gradiente: '#444', 
            icona: '🥈', 
            fontNome: '0.8rem', 
            fontPunti: '1.2rem', 
            flex: '1', 
            zIndex: '1'
        },
        3: { 
            altezza: '60px', 
            colore: '#CD7F32', 
            gradiente: '#442d1a', 
            icona: '🥉', 
            fontNome: '0.8rem', 
            fontPunti: '1.1rem', 
            flex: '1', 
            zIndex: '1'
        }
    };

    const c = configs[posizione];
    const teamId = `team-${squadra.nome_squadra.replace(/\s+/g, '-').toLowerCase()}`;
    const numMorti = squadra.partecipanti.filter(p => isPDead(p)).length;

    return `
        <div onclick="goToTeam('${teamId}')" style="flex: ${c.flex}; display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: ${c.zIndex}">
            <div style="font-size: ${c.fontNome}; font-weight: 900; color: ${c.colore}; margin-bottom: 5px; text-align: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${squadra.nome_squadra}
            </div>

            <div style="background: linear-gradient(180deg, ${c.colore} 0%, ${c.gradiente} 100%); width: 100%; height: ${c.altezza}; border-radius: 12px 12px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; box-shadow: 0 10px 20px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-bottom: none; padding: 10px 0;">
                <span style="font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${c.icona}</span>
                <div style="display: flex; align-items: center; gap: 2px;">
                    <div class="points-unified" style="border: 1px solid #ff6b00">
                        <span class="points-value" style="font-size: 0.8rem; color: #ff6b00">${puntiSquadra(squadra)}</span>
                        <span class="points-label" style="font-size: 0.7rem; color: #ff6b00">PTS</span>
                    </div>
                    <div class="points-unified" style="border: 1px solid #bb00ff;">
                        <span class="points-value" style="font-size: 0.8rem; color: #bb00ff">${numMorti}</span>
                        <span class="points-label" style="font-size: 0.7rem; color: #bb00ff">RIP</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}