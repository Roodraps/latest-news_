const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  if (req.url === '/getTimeStories' && req.method === 'GET') {
    const url = 'https://time.com/';

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const extractedData = [];
        let currentIndex = data.indexOf('<li class="latest-stories__item">');

        while (currentIndex !== -1) {
          const startIndex = data.indexOf('<a', currentIndex);
          const endIndex = data.indexOf('</a>', startIndex);

          if (startIndex !== -1 && endIndex !== -1) {
            const linkStartIndex = data.indexOf('href="', startIndex) + 'href="'.length;
            const linkEndIndex = data.indexOf('"', linkStartIndex);
            const href = data.substring(linkStartIndex, linkEndIndex);

            const titleStartIndex = data.indexOf('>', data.indexOf('<h3', startIndex)) + 1;
            const titleEndIndex = data.indexOf('</h3>', titleStartIndex);
            const title = data.substring(titleStartIndex, titleEndIndex).trim();

            extractedData.push({ title, link: href });
          }

          currentIndex = data.indexOf('<li class="latest-stories__item">', currentIndex + 1);
        }

        res.end(JSON.stringify(extractedData));
      });
    }).on('error', (error) => {
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
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