const http = require('http');
const https = require('https');


function extractStories(htmlData) {
  const extractedData = [];
  let currentIndex = htmlData.indexOf('<li class="latest-stories__item">');

  while (currentIndex !== -1) {
    const startIndex = htmlData.indexOf('<a', currentIndex);
    const endIndex = htmlData.indexOf('</a>', startIndex);

    if (startIndex !== -1 && endIndex !== -1) {
      const linkStartIndex = htmlData.indexOf('href="', startIndex) + 'href="'.length;
      const linkEndIndex = htmlData.indexOf('"', linkStartIndex);
      const href = htmlData.substring(linkStartIndex, linkEndIndex);

      const titleStartIndex = htmlData.indexOf('>', htmlData.indexOf('<h3', startIndex)) + 1;
      const titleEndIndex = htmlData.indexOf('</h3>', titleStartIndex);
      const title = htmlData.substring(titleStartIndex, titleEndIndex).trim();

      extractedData.push({ title, link: href });
    }

    currentIndex = htmlData.indexOf('<li class="latest-stories__item">', currentIndex + 1);
  }

  return extractedData;
}


function fetchHTML(url, callback) {
  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      callback(null, data);
    });
  }).on('error', (error) => {
    callback(error, null);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/getTimeStories' && req.method === 'GET') {
    const url = 'https://time.com/';

    fetchHTML(url, (error, htmlData) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } else {
        const extractedData = extractStories(htmlData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(extractedData));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 4000;
server.listen(port, () => {
  console.log(`Server is running on , http://localhost:${port}`);
});

