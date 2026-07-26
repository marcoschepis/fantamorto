const fs = require('fs');
const https = require('https');

// --- CONFIGURAZIONE BOT ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MY_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHANNEL_NAME = 'aifantamorto';
const FILE_PATH = 'squadre.json';
const LAST_ID_FILE = 'last_id.txt';

// Caricamento nomi dal JSON
const db = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
const nomiInGioco = [];
db.campionato.forEach(s => s.partecipanti.forEach(p => {
    if (p.status !== 'morto') nomiInGioco.push(p.nome);
}));

// --- DEBUG: Verifica se il file cache è stato letto dal runner ---
let lastReadId = 0;
if (fs.existsSync(LAST_ID_FILE)) {
    lastReadId = parseInt(fs.readFileSync(LAST_ID_FILE, 'utf8').trim()) || 0;
    console.log(`ℹ️ Cache trovata! Ultimo ID letto in precedenza: ${lastReadId}`);
} else {
    console.log(`⚠️ Nessun file ${LAST_ID_FILE} trovato. Si parte da ID: 0`);
}

process.on('uncaughtException', (err) => {
    console.error('⚠️ Eccezione evitata:', err.message);
});

function inviaTelegram(messaggio) {
    const data = JSON.stringify({ chat_id: MY_CHAT_ID, text: messaggio });
    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) console.log("✅ Link inviato!");
            else console.error(`❌ Errore API: ${res.statusCode}`, body);
        });
    });

    req.on('error', (e) => console.error(`🚨 Errore di rete: ${e.message}`));
    req.write(data);
    req.end();
}

https.get(`https://t.me/s/${CHANNEL_NAME}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let html = '';
    res.on('data', chunk => { html += chunk; });
    res.on('end', () => {
        const blocchi = html.split('tgme_widget_message_wrap');
        blocchi.shift();

        let nuovoUltimoId = lastReadId;

        blocchi.forEach((blocco) => {
            const idMatch = blocco.match(/data-post=".*?\/(\d+)"/);
            if (!idMatch) return;
            
            const currentId = parseInt(idMatch[1]);
            
            // Aggiorniamo SEMPRE il tracciamento del post più recente visto
            if (currentId > nuovoUltimoId) {
                nuovoUltimoId = currentId;
            }

            // Ignoriamo i post già elaborati nelle esecuzioni precedenti
            if (currentId <= lastReadId) return;

            console.log(`🔍 Analizzo NUOVO post ID: ${currentId}`);

            if (blocco.includes('js-message_text')) {
                const contenuto = blocco.split('js-message_text" dir="auto">')[1].split('</div>')[0];
                const testoSemplice = contenuto.replace(/<[^>]*>/g, ' ').toLowerCase();

                nomiInGioco.forEach(nome => {
                    // Rimosso il flag 'g' per evitare bug con .test()
                    const regex = new RegExp(`\\b${nome.toLowerCase()}\\b`, 'i');
                    if (regex.test(testoSemplice)) {
                        console.log(`🚨 MATCH TROVATO per "${nome}" nel post ${currentId}!`);
                        const linkPost = `🚨 ALERT per ${nome}!\nhttps://t.me/${CHANNEL_NAME}/${currentId}`;
                        inviaTelegram(linkPost); 
                    }
                });
            }
        });

        // Salva il nuovo ID massimo raggiunto
        if (nuovoUltimoId > lastReadId) {
            console.log(`💾 Aggiorno ${LAST_ID_FILE} da ${lastReadId} a ${nuovoUltimoId}`);
            fs.writeFileSync(LAST_ID_FILE, nuovoUltimoId.toString());
        } else {
            console.log(`💤 Nessun nuovo post da salvare (ID rimasto a ${lastReadId}).`);
        }
    });
});