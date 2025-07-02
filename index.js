const express = require('express');
const app = express();
const port = 3000;

function getClientIp(req) {
  // Try to get the real client IP from x-forwarded-for or fallback to req.ip
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list
    return xForwardedFor.split(',')[0].trim();
  }
  return req.ip;
}

function getProxyIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    return ips.length > 1 ? ips[1] : null;
  }
  return null;
}

app.get('/', (req, res) => {
  const myIp = getClientIp(req);
  const proxyIp = getProxyIp(req);
  res.sendFile(__dirname + '/views/index.html');
});

// API endpoint to get IPs as JSON
app.get('/api/ip', (req, res) => {
  const myIp = getClientIp(req);
  const proxyIp = getProxyIp(req);
  res.json({ myIp, proxyIp });
});

// Start the server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});