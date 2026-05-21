const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.vatican.va/archive/cathechism_po/index_new/';
const INDEX_URL = BASE_URL + 'prima-pagina-cic_po.html';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder('windows-1252');
            return decoder.decode(buffer);
        } catch (e) {
            if (i === retries - 1) throw e;
            console.log(`Failed to fetch ${url}, retrying...`);
            await delay(1000);
        }
    }
}

async function main() {
    try {
        console.log('Fetching index page...');
        const indexHtml = await fetchWithRetry(INDEX_URL);
        const $ = cheerio.load(indexHtml);
        
        const links = new Set();
        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (href) {
                href = decodeURIComponent(href);
                // Relevant pages start with p (parts) or prologo
                if (href.startsWith('p') || href.startsWith('prologo')) {
                    href = href.split('#')[0]; // remove hash
                    links.add(href);
                }
            }
        });
        
        const pages = Array.from(links);
        console.log(`Found ${pages.length} relevant pages to crawl.`);
        
        const bookData = [];
        
        for (let i = 0; i < pages.length; i++) {
            const pageFile = pages[i];
            const pageUrl = BASE_URL + pageFile;
            console.log(`[${i + 1}/${pages.length}] Crawling ${pageUrl}...`);
            
            const html = await fetchWithRetry(pageUrl);
            const $page = cheerio.load(html);
            
            const paragraphs = [];
            $page('p').each((idx, el) => {
                let text = $page(el).text();
                // Clean up whitespace
                text = text.replace(/\s+/g, ' ').trim();
                if (text) {
                    paragraphs.push(text);
                }
            });
            
            bookData.push({
                file: pageFile,
                url: pageUrl,
                content: paragraphs
            });
            
            await delay(500); // polite delay
        }
        
        const outputPath = path.join(__dirname, '..', 'catecismo_igreja_catolica.json');
        fs.writeFileSync(outputPath, JSON.stringify(bookData, null, 2), 'utf-8');
        console.log(`\nSuccess! Book saved to ${outputPath}`);
        
    } catch (e) {
        console.error('Crawler failed:', e);
    }
}

main();
