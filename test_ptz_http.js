#!/usr/bin/env node
// Test PTZ commands via HTTP CGI
const http = require('http');

const CAMERA_IP = '192.168.1.45'; // Your camera IP
const DIRECTION = process.argv[2] || 'up';

const cgiPaths = [
 `/cgi-bin/hi3510/param.cgi?cmd=ptzctrl&-act=${DIRECTION}`,
 `/cgi-bin/hi3510/ptzctrl.cgi?cmd=${DIRECTION}`,
 `/PTZCtrl.dll?Command=${DIRECTION.toUpperCase()}&Speed=5`,
 `/onvif/ptz?move=${DIRECTION}`,
];

console.log(`Testing PTZ commands to ${CAMERA_IP} (${DIRECTION})...\n`);

let completed = 0;
cgiPaths.forEach((path, idx) => {
 const url = `http://${CAMERA_IP}${path}`;
 const req = http.get(url, (res) => {
 console.log(`[${idx + 1}] ${path}`);
 console.log(`    Status: ${res.statusCode}`);
 res.on('data', () => {});
 res.on('end', () => {
 completed++;
 if (completed === cgiPaths.length) process.exit(0);
 });
 });
 req.on('error', (e) => {
 console.log(`[${idx + 1}] ${path}`);
 console.log(`    Error: ${e.message}`);
 completed++;
 if (completed === cgiPaths.length) process.exit(0);
 });
 req.setTimeout(2000, () => {
 req.destroy();
 console.log(`[${idx + 1}] ${path}`);
 console.log(`    Timeout`);
 completed++;
 if (completed === cgiPaths.length) process.exit(0);
 });
});

setTimeout(() => {
 console.log('\nNo responses received');
 process.exit(1);
}, 3000);
