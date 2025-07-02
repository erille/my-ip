const express = require('express');
const requestIp = require('request-ip');
const app = express();
const port = 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Middleware to get the client's IP address
app.use(requestIp.mw());

// Route to handle the home page
app.get('/', (req, res) => {
  const clientIp = req.clientIp;
  const forwardedIps = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',').map(ip => ip.trim()) : [];
  const ispIp = forwardedIps.length > 0 ? forwardedIps[0] : clientIp;
  const proxyIp = forwardedIps.length === 5 ? forwardedIps[1] : null;

  res.render('index', {
    appName: 'IP ADDRESS',
    myIp: ispIp,
    proxyIp: proxyIp,
    forwardedIps: forwardedIps
  });
});

// Start the server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});