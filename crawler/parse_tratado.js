const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function main() {
    try {
        const buffer = fs.readFileSync('tratado.pdf');
        const data = await pdf(buffer);
        
        let text = data.text;
        
        // Separa o apêndice do resto do texto
        const appendixIndex = text.indexOf('APÊNDICE');
        let mainText = text;
        let appendixText = '';
        if (appendixIndex !== -1) {
            mainText = text.substring(0, appendixIndex);
            appendixText = text.substring(appendixIndex);
        }
        
        // Regex para os capítulos
        const chapterRegex = /(Capítulo\s+[IVXLCDM]+(?:[\s\S]*?(?=Capítulo\s+[IVXLCDM]+|$)))/gi;
        
        const chapters = [];
        let match;
        
        // Prefácio
        const firstChapterIndex = mainText.search(/Capítulo\s+I\b/i);
        if (firstChapterIndex > 0) {
            chapters.push({
                chapter: "Prefácio / Introdução",
                content: mainText.substring(0, firstChapterIndex).trim().split('\n').map(t => t.trim()).filter(t => t.length > 0).join('\n')
            });
        }
        
        // Demais Capítulos
        while ((match = chapterRegex.exec(mainText)) !== null) {
            const rawText = match[1];
            const lines = rawText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            const chapterTitle = lines[0];
            let content = lines.slice(1).join(' ').replace(/\s+/g, ' ');
            
            // Adiciona quebra de linha antes dos versículos (ex: 1. , 90. , 273.)
            content = content.replace(/(?<=\s|^)(?=\d{1,3}\.\s)/g, '\n');
            
            // Limpa espaços extras ao redor das quebras de linha
            content = content.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
            
            chapters.push({
                chapter: chapterTitle,
                content: content
            });
        }
        
        // Apêndice
        if (appendixText) {
            const lines = appendixText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
                
            const chapterTitle = lines[0] || "Apêndice";
            let content = lines.slice(1).join(' ').replace(/\s+/g, ' ');
            
            // Adiciona quebra de linha antes de numerais romanos se houver (opcional, mas ajuda a estruturar)
            // content = content.replace(/(?<=\s|^)(?=[IVXLCDM]+\s)/g, '\n');
            // Como é um apêndice com orações e hinos, separar por quebras de linha a cada maiúscula ajuda? Não, deixaremos contínuo por enquanto, ou quebrando em " \n ".
            // Para manter o original:
            content = lines.slice(1).join('\n');
            
            chapters.push({
                chapter: chapterTitle,
                content: content
            });
        }
        
        const outputPath = path.join(__dirname, '..', 'tratado_verdadeira_devocao.json');
        fs.writeFileSync(outputPath, JSON.stringify(chapters, null, 2), 'utf-8');
        
        console.log(`Success! Saved ${chapters.length} chapters to ${outputPath}`);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
