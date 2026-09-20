function renderRegolamento() {
    const container = document.getElementById('regolamento-container');
    if (!container) return;

    fetch(REPO_INFO.REGOLAMENTO + '?' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("REGOLAMENTO non trovato");
            return response.text();
        })
        .then(markdown => {
            const renderer = new marked.Renderer();
            
            // Gestisce sia la nuova API di Marked ({ text, depth }) sia la vecchia (text, level)
            renderer.heading = function(headingObject, level) {
                const textStr = typeof headingObject === 'object' ? headingObject.text : headingObject;
                const depthLevel = typeof headingObject === 'object' ? headingObject.depth : level;

                // Genera lo slug pulito mantenendo caratteri accentati
                const slug = String(textStr).toLowerCase()
                    .replace(/<[^>]*>/g, '')             // Rimuove tag HTML interni
                    .replace(/[^\w\u00C0-\u024F\s-]/g, '') // Mantiene lettere, numeri, trattini e accentate
                    .trim()
                    .replace(/\s+/g, '-');              // Sostituisce spazi con trattini
                
                return `<h${depthLevel} id="${slug}">${textStr}</h${depthLevel}>`;
            };

            container.innerHTML = marked.parse(markdown, { renderer: renderer });

            // Gestione del click fluido sulle ancore dell'indice
            container.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetEl = document.getElementById(targetId);
                    
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = '<p style="color: #ff4444;">Impossibile caricare il regolamento.</p>';
        });
}