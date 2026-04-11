// watch-and-pack.js
// Watches pack/root/ for changes and auto-packs using EterNexus CLI
// Usage: node watch-and-pack.js

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const watchDir = path.join(__dirname, 'pack', 'root');
const eternexus = path.join(__dirname, 'Eternexus', 'EterNexus.exe');

let packTimeout = null;
const DEBOUNCE_MS = 1000;

function doPack() {
    const time = new Date().toLocaleTimeString();
    console.log('[%s] Packing...', time);
    try {
        execSync('"' + eternexus + '" --pack "' + watchDir + '"', {
            stdio: 'inherit',
            timeout: 30000
        });
        console.log('[%s] Pack complete.', new Date().toLocaleTimeString());
    } catch (e) {
        console.error('EterNexus CLI failed. Try manual GUI packing.');
    }
}

function onFileChange(eventType, filename) {
    if (!filename) return;
    console.log('[%s] Changed: %s', new Date().toLocaleTimeString(), filename);

    if (packTimeout) clearTimeout(packTimeout);
    packTimeout = setTimeout(doPack, DEBOUNCE_MS);
}

// Try chokidar first (better cross-platform support)
try {
    var chokidar = require('chokidar');
    var watcher = chokidar.watch(watchDir, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
    });
    watcher.on('change', function(filePath) {
        onFileChange('change', path.relative(watchDir, filePath));
    });
    watcher.on('add', function(filePath) {
        onFileChange('add', path.relative(watchDir, filePath));
    });
    console.log('Watching %s with chokidar...', watchDir);
} catch (e) {
    // Fallback to fs.watch
    fs.watch(watchDir, { recursive: true }, onFileChange);
    console.log('Watching %s with fs.watch...', watchDir);
}

console.log('Press Ctrl+C to stop.');
