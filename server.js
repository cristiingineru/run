const http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var qs = require('querystring');

const hostname = 'localhost';
const port = 1000;
const resultsFile = 'results.json';


const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/results') {
    handleIncomingResults(req, res);
  } else {
    handleIncomingRegularRequest(req, res);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function handleIncomingRegularRequest(req, res) {
  var uri = url.parse(req.url).pathname,
      filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }

      res.writeHead(200);
      res.write(file, 'binary');
      res.end();
    });
  });
}

function handleIncomingResults(req, res) {
  var body = '';

  req.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
          req.connection.destroy();
  });

  req.on('end', function () {
      var post = qs.parse(body);
      logNewResults(post);
  });
}

function logNewResults(newResults) {
    var oldResults = fs.existsSync(resultsFile)
            ? JSON.parse(fs.readFileSync(resultsFile, 'utf8'))
            : {},
        now = (new Date()).toISOString();
    oldResults[now] = newResults;
    fs.writeFileSync(resultsFile, JSON.stringify(oldResults, null, ' '));
}
