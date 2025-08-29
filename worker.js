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
    
    // Check for proxy detection using x-forwarded-for
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',').map(ip => ip.trim());
      
                           if (ips.length >= 2) {
          // Multiple IPs detected - we're behind a proxy
          myIp = ips[1]; // Second IP is the real client IP
          proxyIp = ips[0]; // First IP is the proxy
        } else if (ips.length === 1) {
         // Single IP in x-forwarded-for
         myIp = ips[0];
         // Check if cf-connecting-ip is different (indicating a proxy)
         if (cfConnectingIp && cfConnectingIp !== ips[0]) {
           myIp = cfConnectingIp;
           proxyIp = ips[0];
         }
       }
    } else if (cfConnectingIp) {
      // No x-forwarded-for, use cf-connecting-ip
      myIp = cfConnectingIp;
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
    body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; background: #b3e5fc; }
    .container { background: #fff; padding: 24px 32px; border-radius: 10px; box-shadow: 0 2px 8px #0001; text-align: center; }
    h1 { color: #1565c0; font-size: 24px; }
    .ip-box { margin: 16px 0; padding: 12px; border: 1px solid #b2ebf2; border-radius: 6px; background: #f1f8e9; cursor: pointer; }
    .copy-msg { color: green; margin-top: 10px; display: none; }
    .description { color: #666; margin-bottom: 20px; font-size: 14px; }
    .footer { margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
  <body>
    <div class="container">
      <h1 id="pageTitle">MY IP ADDRESS</h1>
      <div class="description">Sharing your IP with IT has never been this easy.</div>
      <div id="myIp" class="ip-box" onclick="copyIp('myIp')">My IP: <span></span></div>
      <div id="proxyIp" class="ip-box" style="display:none" onclick="copyIp('proxyIp')">Proxy IP: <span></span></div>
      <div id="msg" class="copy-msg">Copied!</div>
    </div>
         <div class="footer">
       Ketah IP Tool - Build 0.5
     </div>
  <script>
    fetch('/api/ip').then(r => r.json()).then(data => {
      document.querySelector('#myIp span').textContent = data.myIp || 'N/A';
      if (data.proxyIp) {
        document.getElementById('proxyIp').style.display = '';
        document.querySelector('#proxyIp span').textContent = data.proxyIp;
        document.getElementById('pageTitle').textContent = 'MY IP ADDRESSES';
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