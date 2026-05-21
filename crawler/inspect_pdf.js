const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
    try {
        const url = 'https://cnp-files.s3.amazonaws.com/uploads/qmx2m8vqaieqwh15m7su/Tratado_Da_Verdadeira_Devo%C3%A7%C3%A3o_S._Lu%C3%ADs_Maria_Grignion_de_Montfort.pdf';
        console.log(`Downloading PDF from ${url}...`);
        
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log('Parsing PDF...');
        const data = await pdf(buffer);
        
        console.log(`Number of pages: ${data.numpages}`);
        
        // Print the first 2000 characters to see the table of contents or chapter patterns
        console.log('\n--- Text Snippet ---');
        console.log(data.text.substring(0, 3000));
        console.log('--------------------');
        
        // Also look for "CAPÍTULO" or "Capítulo" or "CAPITULO" to see how they are formatted
        const chapters = data.text.match(/(?:CAPÍTULO|CAPITULO|Capítulo)\s+[IVXLCDM\d]+/gi);
        console.log('\nFound chapter headers (sample):', chapters ? chapters.slice(0, 10) : 'None');
        
        // Save the buffer to disk for faster subsequent processing
        fs.writeFileSync('tratado.pdf', buffer);
        console.log('PDF saved locally as tratado.pdf');

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
