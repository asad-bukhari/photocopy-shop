const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8069,
  path: '/api/photocopy/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Login response:', data);
    const response = JSON.parse(data);

    if (response.success) {
      // Now test products endpoint
      const token = response.data.token;
      console.log('\nTesting products endpoint with token...');

      const productOptions = {
        hostname: 'localhost',
        port: 8069,
        path: '/api/photocopy/products?isActive=true',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const productReq = http.request(productOptions, (productRes) => {
        let productData = '';
        productRes.on('data', (chunk) => { productData += chunk; });
        productRes.on('end', () => {
          console.log('Products response status:', productRes.statusCode);
          console.log('Products response:', productData);
        });
      });

      productReq.on('error', (error) => {
        console.error('Products request error:', error);
      });

      productReq.end();
    }
  });
});

req.on('error', (error) => {
  console.error('Login request error:', error);
});

req.write(JSON.stringify({ pin: '1234' })); // Try common PIN
req.end();
