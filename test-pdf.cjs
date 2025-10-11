const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');

async function testPDFGeneration() {
  try {
    console.log('Testing PDF generation API...');
    
    // Test with mock data (siswaId=999)
    await downloadPDF('http://localhost:3000/api/laporan/individu?siswaId=999&periode=2025-01', 'test-mock-report.pdf', 'Mock');
    
    // Test with real data (siswaId=1)  
    await downloadPDF('http://localhost:3000/api/laporan/individu?siswaId=1&periode=2025-01', 'test-real-report.pdf', 'Real');

  } catch (error) {
    console.error('Error testing PDF generation:', error);
  }
}

function downloadPDF(apiUrl, filename, type) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(apiUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(parsedUrl, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ ${type} PDF generated successfully: ${filename}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filename, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        console.log(`❌ ${type} PDF generation failed with status: ${response.statusCode}`);
        
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          console.log('Response:', data);
          reject(new Error(`HTTP ${response.statusCode}: ${data}`));
        });
      }
    });
    
    request.on('error', (err) => {
      console.error(`❌ ${type} PDF request failed:`, err.message);
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`${type} PDF request timeout`));
    });
  });
}

testPDFGeneration();