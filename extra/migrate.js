const fs = require('fs'); // Modulo per leggere i file

// 1. CARICA IL FILE DAL DISCO
// Assicurati che 'squadre.json' sia nella stessa cartella di migrate.js
const fileName = 'squadre.json'; 

try {
    const rawData = fs.readFileSync(fileName, 'utf8');
    const db = JSON.parse(rawData);

    // 2. LA FUNZIONE DI MIGRAZIONE
    function migraDatabase(data) {
        if (!data.morituri) {
            console.error("Errore: il file JSON non contiene l'array 'morituri'");
            return null;
        }

        // Creiamo la mappa dei dati completi
        const infoMappa = {};
        data.morituri.forEach(m => {
            infoMappa[m.nome] = {
                prezzo: m.prezzo,
                status: m.status,
                punti: m.punti,
                rimborso: m.rimborso
            };
        });

        // Aggiorniamo ogni partecipante in ogni squadra
        data.campionato.forEach(squadra => {
            squadra.partecipanti = squadra.partecipanti.map(p => {
                const infoUfficiali = infoMappa[p.nome];
                if (infoUfficiali) {
                    return {
                        nome: p.nome,
                        ...infoUfficiali
                    };
                } else {
                    console.warn(`⚠️ Personaggio [${p.nome}] non trovato nel listino.`);
                    return p; // Restituisce l'originale se non trova info
                }
            });
        });

        return data;
    }

    // 3. ESEGUI E SALVA IL RISULTATO
    const dbAggiornato = migraDatabase(db);
    
    if (dbAggiornato) {
        fs.writeFileSync('squadre_migrato.json', JSON.stringify(dbAggiornato, null, 2));
        console.log("✅ Migrazione completata! Controlla il file 'squadre_migrato.json'");
    }

} catch (err) {
    console.error("❌ Errore durante la lettura del file:", err.message);
}