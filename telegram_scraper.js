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

let lastReadId = fs.existsSync(LAST_ID_FILE) ? parseInt(fs.readFileSync(LAST_ID_FILE, 'utf8').trim()) : 0;

// FUNZIONE DI INVIO MINIMALE
function inviaTelegram(messaggio) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: MY_CHAT_ID,
        text: messaggio
    });

    const req = https.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    }, (res) => {
        if (res.statusCode === 200) console.log("✅ Link inviato!");
        else console.error(`❌ Errore: ${res.statusCode}`);
    });

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
            if (currentId <= lastReadId) return;

            if (blocco.includes('js-message_text')) {
                // Estraiamo il testo solo per il controllo dei nomi (pulito da HTML)
                const contenuto = blocco.split('js-message_text" dir="auto">')[1].split('</div>')[0];
                const testoSemplice = contenuto.replace(/<[^>]*>/g, ' ').toLowerCase();

                nomiInGioco.forEach(nome => {
                    const regex = new RegExp(`\\b${nome}\\b`, 'gi');
                    if (regex.test(testoSemplice)) {
                        console.log(`🚨 ALERT per ${nome}! Invio link post...`);
                        
                        // COSTRUIAMO IL LINK DIRETTO AL POST
                        const linkPost = `https://t.me/${CHANNEL_NAME}/${currentId}`;
                        
                        // INVIAMO SOLO IL LINK (Telegram farà il resto)
                        inviaTelegram(linkPost); 
                    }
                });
            }
            if (currentId > nuovoUltimoId) nuovoUltimoId = currentId;
        });

        if (nuovoUltimoId > lastReadId) fs.writeFileSync(LAST_ID_FILE, nuovoUltimoId.toString());
    });
});