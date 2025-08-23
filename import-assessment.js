#!/usr/bin/env bun

const fs = require('fs');
const http = require('http');
const path = require('path');

// CLI Argument Parsing
const [, , filePath] = process.argv;

if (!filePath) {
    console.error('❌ Error: JSON file path required as an argument.');
    console.error('Usage: node import-assessment.js <path-to-json-file>');
    process.exit(1);
}

const absolutePath = path.resolve(filePath);

// Read File
fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`❌ Failed to read file: ${err.message}`);
        process.exit(1);
    }

    let json;
    try {
        json = JSON.parse(data);
    } catch (parseErr) {
        console.error(`❌ Invalid JSON in file: ${parseErr.message}`);
        process.exit(1);
    }

    const postData = JSON.stringify(json);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/assessments/import',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = http.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log(`✅ Response (${res.statusCode}):\n${body}`);
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Problem with request: ${e.message}`);
    });

    // Send request
    req.write(postData);
    req.end();
});
