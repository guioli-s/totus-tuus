const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const url = 'https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_po.html';
        console.log(`Fetching Compendium: ${url}`);
        
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('windows-1252');
        const html = decoder.decode(buffer);
        
        const $ = cheerio.load(html);
        
        $('script, style, head, nav, footer, iframe, img, .header, .footer').remove();
        
        let content = [];
        
        $('p, h1, h2, h3, h4, h5, h6').each((i, el) => {
            let text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.length > 0) {
                content.push(text);
            }
        });
        
        const result = [{
            file: "archive_2005_compendium-ccc_po.html",
            url: url,
            content: content
        }];
        
        const outputPath = path.join(__dirname, '..', 'compendium_igreja_catolica.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        
        console.log(`Success! Compendium saved to ${outputPath}`);
    } catch (e) {
        console.error('Error crawling Compendium:', e);
    }
}

main();
