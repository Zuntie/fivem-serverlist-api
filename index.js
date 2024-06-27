const { FrameReader } = require('./modules/frameReader');
const { fetcher } = require('./modules/utils/fetcher');
const { master } = require('./cfx/master');
const { Deferred } = require('./modules/utils/async');
const Log = require('./modules/utils/log')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json());


// URLs to be used
const BASE_URL = 'https://servers-frontend.fivem.net/api/servers';
const ALL_SERVERS_URL = `${BASE_URL}/streamRedir/`;


// Global servers object
servers = {}


// #1
// Fetches data from the stream redirect
async function fetchData() {
  Log('', '--- Starting Operation ---');
  Log('', 'START: ' + Date.now())
  const { body } = await fetcher.fetch(new Request(ALL_SERVERS_URL));

  Log('info', 'Fetching Body...');

  if (!body) {
    throw new Error('Empty body of all servers stream');
  }

  Log('info', 'Body Fetched!');

  await frameReading(body);
}


// #2
// Reads the buffers and uses FrameReader to get frames
async function frameReading(body) {
  Log('info', 'Reading Frames...');
  const deferred = new Deferred();

  servers = {}

  const frameReader = new FrameReader(
    body,
    async (frame) => {
      const srv = await decodeServer(frame);

      // No duplicates
      servers[srv.EndPoint] = servers[srv.EndPoint] || srv;
    },
    deferred.resolve
  );

  frameReader.read();
  await deferred.promise;

  Log('info', 'Read Frames!');

  await finish();
}


// #2.1
// Decodes the server via. the dump from cfxuirnw
async function decodeServer(frame) {
  return master.Server.decode(frame);
}


// #3
// Operation finished, now do whatever
async function finish() {
  Log('info', 'Finished!');
  Log('', 'END:   ' + Date.now())
  Log('', '--------------------------');
  console.log('Total FiveM Servers: ', Object.values(servers).length);
  Log('', '--------------------------');
}




// API Function
// Fetches all servers by locale
async function fetchServersByLocale(target) {
  const resolved = await Promise.all(Object.values(servers));
  return resolved.filter(srv => srv.Data.vars.locale === target);
}


// API Function
// Fetches specific server by EndPoint
async function fetchServerByEndPoint(target) {
  const resolved = await Promise.all(Object.values(servers));
  return resolved.find(srv => srv.EndPoint === target);
}

// API Route
// Fetches servers by a specificed locale
app.get('/fetchServersByLocale/:locale', async (req, res) => {
  const locale = req.params.locale
  const server = await fetchServersByLocale(locale)
  res.json(server)
})


// API Route
// Fetches a server by a specificed endpoint
app.get('/fetchServerByEndPoint/:endpoint', async (req, res) => {
  const endpoint = req.params.endpoint
  const server = await fetchServerByEndPoint(endpoint)
  res.json(server)
})


// API Route
// Fetches the whole server list
app.get('/fetchServers', (req, res) => {
  res.json(servers)
})




// Express
// Listening on port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)

  // Operation Interval
  // Fetches data every 45 seconds
  fetchData()
  setInterval(fetchData, 45000)
})