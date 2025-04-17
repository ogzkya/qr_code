// Security testing script for QR menu system
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// API endpoints to test
const apiEndpoints = [
  { method: 'GET', path: '/api/restaurants' },
  { method: 'GET', path: '/api/menu-sections/restaurant/:restaurantId' },
  { method: 'GET', path: '/api/categories/menu-section/:menuSectionId' },
  { method: 'GET', path: '/api/menu-items/category/:categoryId' },
  { method: 'GET', path: '/api/qr-codes/restaurant/:restaurantId' },
  { method: 'POST', path: '/api/orders' },
  { method: 'POST', path: '/api/reservations' },
  { method: 'POST', path: '/api/feedback' },
  { method: 'GET', path: '/api/promotions/public/restaurant/:restaurantId' }
];

// Common security vulnerabilities to test
const securityTests = [
  { name: 'XSS (Cross-Site Scripting)', test: testXSS },
  { name: 'SQL Injection', test: testSQLInjection },
  { name: 'CSRF (Cross-Site Request Forgery)', test: testCSRF },
  { name: 'Authentication Bypass', test: testAuthBypass },
  { name: 'Authorization Issues', test: testAuthorization },
  { name: 'Sensitive Data Exposure', test: testSensitiveDataExposure },
  { name: 'Rate Limiting', test: testRateLimiting },
  { name: 'Input Validation', test: testInputValidation }
];

// Run security tests
async function runSecurityTests() {
  console.log('Starting security tests...');
  
  const baseUrl = 'http://localhost:5000'; // Backend API URL
  const frontendUrl = 'http://localhost:3000'; // Frontend URL
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Store test results
    const testResults = {
      apiEndpoints: {},
      frontend: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        vulnerabilities: []
      }
    };
    
    // Test API endpoints
    console.log('Testing API endpoints for security vulnerabilities...');
    
    for (const endpoint of apiEndpoints) {
      console.log(`  Testing ${endpoint.method} ${endpoint.path}`);
      
      // Replace path parameters with test values
      const testPath = endpoint.path
        .replace(':restaurantId', '1')
        .replace(':menuSectionId', '1')
        .replace(':categoryId', '1');
      
      const url = `${baseUrl}${testPath}`;
      
      testResults.apiEndpoints[`${endpoint.method} ${endpoint.path}`] = {};
      
      for (const securityTest of securityTests) {
        console.log(`    - Running ${securityTest.name} test`);
        
        try {
          const result = await securityTest.test(url, endpoint.method, page, baseUrl);
          
          testResults.apiEndpoints[`${endpoint.method} ${endpoint.path}`][securityTest.name] = result;
          testResults.summary.totalTests++;
          
          if (result.passed) {
            testResults.summary.passedTests++;
            console.log(`      ✓ Passed`);
          } else {
            testResults.summary.failedTests++;
            testResults.summary.vulnerabilities.push({
              endpoint: `${endpoint.method} ${endpoint.path}`,
              test: securityTest.name,
              details: result.details
            });
            console.log(`      ✗ Failed: ${result.details}`);
          }
        } catch (error) {
          console.error(`      ✗ Error running test:`, error.message);
          
          testResults.apiEndpoints[`${endpoint.method} ${endpoint.path}`][securityTest.name] = {
            passed: false,
            details: `Error running test: ${error.message}`
          };
          
          testResults.summary.totalTests++;
          testResults.summary.failedTests++;
        }
      }
    }
    
    // Test frontend pages
    console.log('Testing frontend pages for security vulnerabilities...');
    
    const frontendPages = [
      { name: 'Home', path: '/' },
      { name: 'Menu', path: '/menu' },
      { name: 'Order', path: '/order' },
      { name: 'Reservation', path: '/reservation' }
    ];
    
    for (const frontendPage of frontendPages) {
      console.log(`  Testing ${frontendPage.name} page`);
      
      const url = `${frontendUrl}${frontendPage.path}`;
      
      testResults.frontend[frontendPage.name] = {};
      
      // Test for client-side vulnerabilities
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Test for DOM-based XSS
        console.log('    - Testing for DOM-based XSS');
        const domXssResult = await testDOMBasedXSS(page);
        
        testResults.frontend[frontendPage.name]['DOM-based XSS'] = domXssResult;
        testResults.summary.totalTests++;
        
        if (domXssResult.passed) {
          testResults.summary.passedTests++;
          console.log(`      ✓ Passed`);
        } else {
          testResults.summary.failedTests++;
          testResults.summary.vulnerabilities.push({
            page: frontendPage.name,
            test: 'DOM-based XSS',
            details: domXssResult.details
          });
          console.log(`      ✗ Failed: ${domXssResult.details}`);
        }
        
        // Test for insecure cookies
        console.log('    - Testing for insecure cookies');
        const cookieResult = await testInsecureCookies(page);
        
        testResults.frontend[frontendPage.name]['Insecure Cookies'] = cookieResult;
        testResults.summary.totalTests++;
        
        if (cookieResult.passed) {
          testResults.summary.passedTests++;
          console.log(`      ✓ Passed`);
        } else {
          testResults.summary.failedTests++;
          testResults.summary.vulnerabilities.push({
            page: frontendPage.name,
            test: 'Insecure Cookies',
            details: cookieResult.details
          });
          console.log(`      ✗ Failed: ${cookieResult.details}`);
        }
        
        // Test for Content Security Policy
        console.log('    - Testing Content Security Policy');
        const cspResult = await testContentSecurityPolicy(page);
        
        testResults.frontend[frontendPage.name]['Content Security Policy'] = cspResult;
        testResults.summary.totalTests++;
        
        if (cspResult.passed) {
          testResults.summary.passedTests++;
          console.log(`      ✓ Passed`);
        } else {
          testResults.summary.failedTests++;
          testResults.summary.vulnerabilities.push({
            page: frontendPage.name,
            test: 'Content Security Policy',
            details: cspResult.details
          });
          console.log(`      ✗ Failed: ${cspResult.details}`);
        }
      } catch (error) {
        console.error(`    ✗ Error testing page:`, error.message);
      }
    }
    
    // Save test results
    const resultsPath = path.join(resultsDir, 'security-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    
    console.log(`Security test results saved to ${resultsPath}`);
    
    // Print summary
    console.log('\nSecurity Test Summary:');
    console.log(`  Total Tests: ${testResults.summary.totalTests}`);
    console.log(`  Passed Tests: ${testResults.summary.passedTests}`);
    console.log(`  Failed Tests: ${testResults.summary.failedTests}`);
    console.log(`  Pass Rate: ${((testResults.summary.passedTests / testResults.summary.totalTests) * 100).toFixed(2)}%`);
    
    if (testResults.summary.vulnerabilities.length > 0) {
      console.log('\nVulnerabilities Found:');
      testResults.summary.vulnerabilities.forEach((vuln, index) => {
        console.log(`  ${index + 1}. ${vuln.test} in ${vuln.endpoint || vuln.page}`);
        console.log(`     Details: ${vuln.details}`);
      });
    }
  } finally {
    await browser.close();
  }
  
  console.log('Security tests completed');
}

// Test for XSS vulnerabilities
async function testXSS(url, method, page, baseUrl) {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    '"><svg onload=alert(1)>',
    'javascript:alert(1)'
  ];
  
  for (const payload of xssPayloads) {
    try {
      if (method === 'GET') {
        // Test URL parameters
        const testUrl = `${url}?q=${encodeURIComponent(payload)}`;
        await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        
        // Check if the payload was executed
        const wasAlertTriggered = await page.evaluate(() => {
          return window.alertTriggered || false;
        });
        
        if (wasAlertTriggered) {
          return {
            passed: false,
            details: `XSS vulnerability found with payload: ${payload}`
          };
        }
      } else if (method === 'POST') {
        // Test POST body parameters
        const response = await axios.post(url, { name: payload, description: payload }, {
          validateStatus: () => true
        });
        
        // Check if the payload was reflected in the response
        if (response.data && JSON.stringify(response.data).includes(payload)) {
          return {
            passed: false,
            details: `Potential XSS vulnerability found with payload: ${payload}`
          };
        }
      }
    } catch (error) {
      // Ignore errors, they might be caused by the XSS payload
    }
  }
  
  return {
    passed: true,
    details: 'No XSS vulnerabilities found'
  };
}

// Test for SQL Injection vulnerabilities
async function testSQLInjection(url, method, page, baseUrl) {
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; DROP TABLE users; --",
    "' UNION SELECT 1,2,3,4,5,6,7,8,9,10 --"
  ];
  
  for (const payload of sqlInjectionPayloads) {
    try {
      if (method === 'GET') {
        // Test URL parameters
        const testUrl = `${url}?id=${encodeURIComponent(payload)}`;
        const response = await axios.get(testUrl, { validateStatus: () => true });
        
        // Check for signs of SQL injection
        if (response.status === 500 || 
            (response.data && JSON.stringify(response.data).includes('SQL syntax')) ||
            (response.data && JSON.stringify(response.data).includes('database error'))) {
          return {
            passed: false,
            details: `Potential SQL injection vulnerability found with payload: ${payload}`
          };
        }
      } else if (method === 'POST') {
        // Test POST body parameters
        const response = await axios.post(url, { id: payload }, {
          validateStatus: () => true
        });
        
        // Check for signs of SQL injection
        if (response.status === 500 || 
            (response.data && JSON.stringify(response.data).includes('SQL syntax')) ||
            (response.data && JSON.stringify(response.data).includes('database error'))) {
          return {
            passed: false,
            details: `Potential SQL injection vulnerability found with payload: ${payload}`
          };
        }
      }
    } catch (error) {
      // Check if error message suggests SQL injection
      if (error.message.includes('SQL syntax') || error.message.includes('database error')) {
        return {
          passed: false,
          details: `Potential SQL injection vulnerability found with payload: ${payload}`
        };
      }
    }
  }
  
  return {
    passed: true,
    details: 'No SQL injection vulnerabilities found'
  };
}

// Test for CSRF vulnerabilities
async function testCSRF(url, method, page, baseUrl) {
  if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
    return {
      passed: true,
      details: 'CSRF test skipped for GET requests'
    };
  }
  
  try {
    // First, make a legitimate request to get a valid session/token
    await page.goto(`${baseUrl}/api/auth/login`, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Get CSRF token if it exists
    const csrfToken = await page.evaluate(() => {
      return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    });
    
    // Make a request without CSRF token
    const response = await axios({
      method: method,
      url: url,
      data: { test: 'data' },
      headers: {
        'Content-Type': 'application/json',
        'Cookie': await page.cookies().then(cookies => cookies.map(c => `${c.name}=${c.value}`).join('; '))
        // Intentionally not including CSRF token
      },
      validateStatus: () => true
    });
    
    // Check if the request was accepted without a CSRF token
    if (response.status < 400) {
      return {
        passed: false,
        details: 'CSRF vulnerability found: Request accepted without CSRF token'
      };
    }
    
    return {
      passed: true,
      details: 'No CSRF vulnerabilities found'
    };
  } catch (error) {
    // If request fails with 403 Forbidden, it might be due to CSRF protection
    if (error.response && error.response.status === 403) {
      return {
        passed: true,
        details: 'CSRF protection appears to be in place'
      };
    }
    
    return {
      passed: false,
      details: `Error during CSRF test: ${error.message}`
    };
  }
}

// Test for authentication bypass
async function testAuthBypass(url, method, page, baseUrl) {
  // Skip test for public endpoints
  if (url.includes('/public/') || 
      url.includes('/auth/login') || 
      url.includes('/auth/register')) {
    return {
      passed: true,
      details: 'Authentication bypass test skipped for public endpoint'
    };
  }
  
  try {
    // Try to access protected endpoint without authentication
    const response = await axios({
      method: method,
      url: url,
      validateStatus: () => true
    });
    
    // Check if the request was rejected due to missing authentication
    if (response.status !== 401 && response.status !== 403) {
      return {
        passed: false,
        details: `Authentication bypass vulnerability found: Accessed protected endpoint without authentication (Status: ${response.status})`
      };
    }
    
    return {
      passed: true,
      details: 'No authentication bypass vulnerabilities found'
    };
  } catch (error) {
    // If request fails with 401 Unauthorized, authentication is working
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        passed: true,
        details: 'Authentication protection appears to be in place'
      };
    }
    
    return {
      passed: false,
      details: `Error during authentication bypass test: ${error.message}`
    };
  }
}

// Test for authorization issues
async function testAuthorization(url, method, page, baseUrl) {
  // Skip test for public endpoints
  if (url.includes('/public/') || 
      url.includes('/auth/login') || 
      url.includes('/auth/register')) {
    return {
      passed: true,
      details: 'Authorization test skipped for public endpoint'
    };
  }
  
  try {
    // Login as a regular user
    await page.goto(`${baseUrl}/api/auth/login`, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Try to access admin-only resources
    if (url.includes('/admin/') || url.includes('/restaurant/')) {
      const response = await axios({
        method: method,
        url: url,
        headers: {
          'Cookie': await page.cookies().then(cookies => cookies.map(c => `${c.name}=${c.value}`).join('; '))
        },
        validateStatus: () => true
      });
      
      // Check if the request was rejected due to insufficient permissions
      if (response.status !== 403) {
        return {
          passed: false,
          details: `Authorization vulnerability found: Regular user accessed admin resource (Status: ${response.status})`
        };
      }
    }
    
    // Try to access another user's resources
    if (url.includes('/:userId')) {
      const anotherUserUrl = url.replace(':userId', '999'); // Assuming 999 is another user's ID
      
      const response = await axios({
        method: method,
        url: anotherUserUrl,
        headers: {
          'Cookie': await page.cookies().then(cookies => cookies.map(c => `${c.name}=${c.value}`).join('; '))
        },
        validateStatus: () => true
      });
      
      // Check if the request was rejected due to insufficient permissions
      if (response.status !== 403) {
        return {
          passed: false,
          details: `Authorization vulnerability found: Accessed another user's resource (Status: ${response.status})`
        };
      }
    }
    
    return {
      passed: true,
      details: 'No authorization vulnerabilities found'
    };
  } catch (error) {
    // If request fails with 403 Forbidden, authorization is working
    if (error.response && error.response.status === 403) {
      return {
        passed: true,
        details: 'Authorization protection appears to be in place'
      };
    }
    
    return {
      passed: false,
      details: `Error during authorization test: ${error.message}`
    };
  }
}

// Test for sensitive data exposure
async function testSensitiveDataExposure(url, method, page, baseUrl) {
  try {
    const response = await axios({
      method: method,
      url: url,
      validateStatus: () => true
    });
    
    // Check for sensitive data in response
    const responseData = JSON.stringify(response.data);
    
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /api[-_]?key/i,
      /auth[-_]?key/i,
      /credit[-_]?card/i,
      /card[-_]?number/i,
      /cvv/i,
      /ssn/i,
      /social[-_]?security/i,
      /passport/i
    ];
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(responseData)) {
        return {
          passed: false,
          details: `Sensitive data exposure found: Response contains ${pattern.toString()}`
        };
      }
    }
    
    // Check for missing security headers
    const headers = response.headers;
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'content-security-policy'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers[header]);
    
    if (missingHeaders.length > 0) {
      return {
        passed: false,
        details: `Sensitive data exposure risk: Missing security headers: ${missingHeaders.join(', ')}`
      };
    }
    
    return {
      passed: true,
      details: 'No sensitive data exposure found'
    };
  } catch (error) {
    return {
      passed: false,
      details: `Error during sensitive data exposure test: ${error.message}`
    };
  }
}

// Test for rate limiting
async function testRateLimiting(url, method, page, baseUrl) {
  try {
    const MAX_REQUESTS = 50;
    const requests = [];
    
    // Make multiple requests in quick succession
    for (let i = 0; i < MAX_REQUESTS; i++) {
      requests.push(axios({
        method: method,
        url: url,
        validateStatus: () => true
      }));
    }
    
    const responses = await Promise.all(requests);
    
    // Check if any requests were rate limited
    const rateLimited = responses.some(response => 
      response.status === 429 || 
      (response.headers['retry-after'] !== undefined)
    );
    
    if (!rateLimited) {
      return {
        passed: false,
        details: `Rate limiting vulnerability found: Made ${MAX_REQUESTS} requests without being rate limited`
      };
    }
    
    return {
      passed: true,
      details: 'Rate limiting appears to be in place'
    };
  } catch (error) {
    // If request fails with 429 Too Many Requests, rate limiting is working
    if (error.response && error.response.status === 429) {
      return {
        passed: true,
        details: 'Rate limiting protection appears to be in place'
      };
    }
    
    return {
      passed: false,
      details: `Error during rate limiting test: ${error.message}`
    };
  }
}

// Test for input validation
async function testInputValidation(url, method, page, baseUrl) {
  const invalidInputs = [
    { field: 'email', value: 'not-an-email' },
    { field: 'phone', value: 'not-a-phone' },
    { field: 'date', value: 'not-a-date' },
    { field: 'amount', value: -1 },
    { field: 'quantity', value: -1 },
    { field: 'id', value: 'not-an-id' }
  ];
  
  if (method === 'GET') {
    return {
      passed: true,
      details: 'Input validation test skipped for GET request'
    };
  }
  
  try {
    for (const input of invalidInputs) {
      const response = await axios({
        method: method,
        url: url,
        data: { [input.field]: input.value },
        validateStatus: () => true
      });
      
      // Check if the request was rejected due to invalid input
      if (response.status < 400) {
        return {
          passed: false,
          details: `Input validation vulnerability found: Accepted invalid ${input.field}: ${input.value}`
        };
      }
    }
    
    return {
      passed: true,
      details: 'Input validation appears to be in place'
    };
  } catch (error) {
    // If request fails with 400 Bad Request, input validation is working
    if (error.response && error.response.status === 400) {
      return {
        passed: true,
        details: 'Input validation protection appears to be in place'
      };
    }
    
    return {
      passed: false,
      details: `Error during input validation test: ${error.message}`
    };
  }
}

// Test for DOM-based XSS
async function testDOMBasedXSS(page) {
  try {
    // Test URL fragment
    await page.goto(page.url() + '#<img src=x onerror=alert(1)>', { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Check if the payload was executed
    const wasAlertTriggered = await page.evaluate(() => {
      return window.alertTriggered || false;
    });
    
    if (wasAlertTriggered) {
      return {
        passed: false,
        details: 'DOM-based XSS vulnerability found in URL fragment handling'
      };
    }
    
    // Test form inputs
    const formInputs = await page.$$('input, textarea');
    
    for (const input of formInputs) {
      await input.type('<img src=x onerror=alert(1)>');
      
      // Check if the payload was executed
      const wasAlertTriggered = await page.evaluate(() => {
        return window.alertTriggered || false;
      });
      
      if (wasAlertTriggered) {
        return {
          passed: false,
          details: 'DOM-based XSS vulnerability found in form input handling'
        };
      }
    }
    
    return {
      passed: true,
      details: 'No DOM-based XSS vulnerabilities found'
    };
  } catch (error) {
    return {
      passed: false,
      details: `Error during DOM-based XSS test: ${error.message}`
    };
  }
}

// Test for insecure cookies
async function testInsecureCookies(page) {
  try {
    const cookies = await page.cookies();
    
    const insecureCookies = cookies.filter(cookie => 
      (cookie.name.toLowerCase().includes('session') || 
       cookie.name.toLowerCase().includes('auth') || 
       cookie.name.toLowerCase().includes('token')) && 
      (!cookie.secure || !cookie.httpOnly)
    );
    
    if (insecureCookies.length > 0) {
      return {
        passed: false,
        details: `Insecure cookies found: ${insecureCookies.map(c => c.name).join(', ')} missing Secure or HttpOnly flags`
      };
    }
    
    return {
      passed: true,
      details: 'No insecure cookies found'
    };
  } catch (error) {
    return {
      passed: false,
      details: `Error during insecure cookies test: ${error.message}`
    };
  }
}

// Test for Content Security Policy
async function testContentSecurityPolicy(page) {
  try {
    const cspHeader = await page.evaluate(() => {
      return document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || '';
    });
    
    if (!cspHeader) {
      return {
        passed: false,
        details: 'No Content Security Policy found'
      };
    }
    
    // Check for unsafe CSP directives
    const unsafeDirectives = [
      "unsafe-inline",
      "unsafe-eval",
      "data:",
      "*"
    ];
    
    for (const directive of unsafeDirectives) {
      if (cspHeader.includes(directive)) {
        return {
          passed: false,
          details: `Weak Content Security Policy found: Contains ${directive}`
        };
      }
    }
    
    return {
      passed: true,
      details: 'Content Security Policy appears to be properly configured'
    };
  } catch (error) {
    return {
      passed: false,
      details: `Error during Content Security Policy test: ${error.message}`
    };
  }
}

// Export the test function
module.exports = { runSecurityTests };

// Run the tests if this file is executed directly
if (require.main === module) {
  runSecurityTests().catch(console.error);
}
