javascript:(async function(){
    let listaTotale = [];
    let pagina = 1;
    let continua = true;

    while(continua){
        console.log("Scansione pagina " + pagina);
        
        // Prendiamo tutte le righe
        let rows = Array.from(document.querySelectorAll('table tr'));

        let trovatiInPagina = 0;

        rows.forEach(row => {
            let cols = row.querySelectorAll('td');
            
            // Controlliamo di avere abbastanza celle (nel tuo esempio ne hai 6)
            if (cols.length >= 6) {
                // 1. Nome (dall'anchor dentro la prima cella)
                let linkNome = cols[0].querySelector('a');
                let nome = linkNome ? linkNome.innerText.trim() : cols[0].innerText.trim();

                // 3. Prezzo/Quotazione (quarta cella - index 3)
                let prezzoRaw = cols[3].innerText.replace(/[^0-9]/g, '');
                let prezzo = parseInt(prezzoRaw) || 0;

                // Filtro di sicurezza: aggiungiamo solo se c'è un nome e un prezzo
                if (nome && nome.length > 1 && prezzo > 0) {
                    listaTotale.push({ 
                        nome: nome, 
                        prezzo: prezzo
                    });
                    trovatiInPagina++;
                }
            }
        });

        console.log("Salvati " + trovatiInPagina + " morituri da questa pagina.");

        // Logica per andare avanti
        let btnNext = null;
        let links = document.querySelectorAll('a, button');
        for (let link of links) {
            let t = link.innerText.toLowerCase();
            if (t === "successiva" || t === "successivo" || t === ">" || link.getAttribute('aria-label') === "Next") {
                // Verifichiamo che non sia disabilitato (classe 'disabled')
                if (!link.classList.contains('disabled') && !link.parentElement.classList.contains('disabled')) {
                    btnNext = link;
                    break;
                }
            }
        }

        if (btnNext) {
            btnNext.click();
            pagina++;
            await new Promise(r => setTimeout(r, 100)); // Attesa caricamento AJAX
        } else {
            continua = false;
        }
    }

    if (listaTotale.length > 0) {
        const json = JSON.stringify(listaTotale, null, 4);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "morituri.json";
        a.click();
        alert("Scaricati " + listaTotale.length + " elementi!");
    } else {
        alert("Non ho trovato dati. Controlla di essere loggato e sulla pagina del listino.");
    }
})();