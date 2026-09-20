# 💀 Fantamorto PWA

Una Progressive Web App (PWA) serverless sviluppata in puro HTML, CSS e JavaScript per la gestione di un campionato di Fantamorto. L'applicazione carica i dati dinamicamente dai file JSON della repository e permette la gestione di classifiche, rose, mercati e punteggi senza bisogno di un server o database dedicato.

Sito visualizzabile a https://marcoschepis.github.io/fantamorto.

---

## ✨ Caratteristiche Principali

* **🏆 Classifica Dinamica:** Visualizzazione e ordinamento delle squadre per punteggio totale o per numero di "RIP".
* **💼 Gestione Mercato:** Interfaccia per la composizione delle rose con calcolo dinamico del budget e completamento automatico tramite catalogo.
* **☁️ Architettura Serverless:** Sincronizzazione e salvataggio dei dati direttamente sui file JSON presenti nella repository GitHub.

---

## 📁 Struttura dei Dati

* `data/squadre.json`: Contiene le impostazioni del campionato, l'elenco delle squadre, i budget rimanenti e i punteggi aggiornati.
* `data/morituri.json`: Database dei personaggi selezionabili nel mercato per alimentare i suggerimenti di ricerca.
* `Regolamento/Regolamento Fantamorto.md`: Testo del regolamento mostrato all'interno dell'applicazione.