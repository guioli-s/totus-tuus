const cheerio = require('cheerio');

async function main() {
    const url = 'https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_po.html';
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('windows-1252');
    const html = decoder.decode(buffer);
    
    const $ = cheerio.load(html);
    
    // Remove unwanted tags like scripts, header, footer, etc.
    $('script, style, head, nav, footer, iframe, img, .header, .footer').remove();
    
    let paragraphs = [];
    $('p, h1, h2, h3, h4, h5, h6, b').each((i, el) => {
        let text = $(el).text().replace(/\s+/g, ' ').trim();
        // Avoid adding the same text multiple times if <b> is inside <p>
        if (text && el.tagName === 'p') {
            paragraphs.push(text);
        } else if (text && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName)) {
            paragraphs.push(`[${el.tagName.toUpperCase()}] ${text}`);
        }
    });
    
    console.log('Sample content from Compendium:');
    console.log(paragraphs.slice(50, 60)); // skip the initial metadata/intro to see the actual content
}

main();
