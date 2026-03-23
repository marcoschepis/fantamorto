import requests
import json
import os

# Configurazione (USA I "SECRETS" DI GITHUB PER IL TOKEN)
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

def send_alert(nome):
    msg = f"⚠️ ALERT FANTAMORTO: È deceduto {nome}! Controlla subito le notizie."
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage?chat_id={CHAT_ID}&text={msg}"
    requests.get(url)

def check_wikipedia(nome):
    # Cerca la pagina Wikipedia e controlla se esiste la "data di morte"
    url = f"https://it.wikipedia.org/api/rest_v1/page/summary/{nome.replace(' ', '_')}"
    res = requests.get(url).json()
    if "description" in res:
        desc = res["description"].lower()
        if "morto" in desc or "deceduto" in desc or "died" in desc:
            return True
    return False

# Carica squadra
with open('squadra.json', 'r') as f:
    data = json.load(f)

for g in data['giocatori']:
    if g['status'] == "vivo":
        if check_wikipedia(g['nome']):
            send_alert(g['nome'])
            g['status'] = "deceduto" # Segna come morto per non ripetere l'alert

# Salva lo stato aggiornato
with open('squadra.json', 'w') as f:
    json.dump(data, f, indent=4)