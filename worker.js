addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/api/ip') {
    const headers = request.headers;
    const xForwardedFor = headers.get('x-forwarded-for');
    const cfConnectingIp = headers.get('cf-connecting-ip');
    
    let myIp = null, proxyIp = null;
    
    // Cloudflare's cf-connecting-ip gives us the real client IP
    if (cfConnectingIp) {
      myIp = cfConnectingIp;
      
      // If there's also x-forwarded-for, the first IP in that chain is the proxy
      if (xForwardedFor) {
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        // The first IP in x-forwarded-for is the proxy that added this header
        proxyIp = ips[0];
      }
    } else if (xForwardedFor) {
      // Fallback: if no cf-connecting-ip, use x-forwarded-for logic
      const ips = xForwardedFor.split(',').map(ip => ip.trim());
      myIp = ips[ips.length - 1]; // Last IP is original client
      proxyIp = ips[0]; // First IP is proxy
    } else {
      myIp = 'unknown';
    }
    
    return new Response(JSON.stringify({ myIp, proxyIp }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Serve HTML for all other routes
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IP Address</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; background: #e0f7fa; }
    .container { background: #fff; padding: 24px 32px; border-radius: 10px; box-shadow: 0 2px 8px #0001; text-align: center; }
    .ip-box { margin: 16px 0; padding: 12px; border: 1px solid #b2ebf2; border-radius: 6px; background: #f1f8e9; cursor: pointer; }
    .copy-msg { color: green; margin-top: 10px; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>IP Address</h1>
    <div id="myIp" class="ip-box" onclick="copyIp('myIp')">My IP: <span></span></div>
    <div id="proxyIp" class="ip-box" style="display:none" onclick="copyIp('proxyIp')">Proxy IP: <span></span></div>
    <div id="msg" class="copy-msg">Copied!</div>
  </div>
  <script>
    fetch('/api/ip').then(r => r.json()).then(data => {
      document.querySelector('#myIp span').textContent = data.myIp || 'N/A';
      if (data.proxyIp) {
        document.getElementById('proxyIp').style.display = '';
        document.querySelector('#proxyIp span').textContent = data.proxyIp;
      }
    });
    function copyIp(id) {
      const ip = document.querySelector('#' + id + ' span').textContent;
      navigator.clipboard.writeText(ip).then(() => {
        const msg = document.getElementById('msg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 1500);
      });
    }
  </script>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}