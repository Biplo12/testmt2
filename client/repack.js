const fs = require('fs');
const path = require('path');

// XTEA keys extracted from client binary
const XTEA_KEY1 = [0x02B09EB9, 0x0581696F, 0x289B9863, 0x001A1879];
const XTEA_KEY2 = [0x04B4B822, 0x1F6EB264, 0x0018EAAE, 0x1CFBF6A6];
const XTEA_DELTA = 0x9E3779B9;
const XTEA_ROUNDS = 32;

const HEADER_EPKD = 'EPKD';
const HEADER_MCOZ = 'MCOZ';
const VERSION = 2;
const FILENAME_LEN = 161;
const ENTRY_SIZE = 192;
const TYPE_RAW = 0;
const EPK_DATA_OFFSET = 8;

function xteaEncryptBlock(v0, v1, key) {
    let sum = 0;
    for (let i = 0; i < XTEA_ROUNDS; i++) {
        v0 = ((v0 + ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + key[sum & 3]))) & 0xFFFFFFFF) >>> 0;
        sum = (sum + XTEA_DELTA) >>> 0;
        v1 = ((v1 + ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + key[(sum >>> 11) & 3]))) & 0xFFFFFFFF) >>> 0;
    }
    return [v0, v1];
}

function xteaEncrypt(buf, key) {
    const padLen = (8 - (buf.length % 8)) % 8;
    const padded = Buffer.alloc(buf.length + padLen);
    buf.copy(padded);
    const out = Buffer.alloc(padded.length);
    for (let i = 0; i < padded.length; i += 8) {
        let v0 = padded.readUInt32LE(i);
        let v1 = padded.readUInt32LE(i + 4);
        [v0, v1] = xteaEncryptBlock(v0, v1, key);
        out.writeUInt32LE(v0, i);
        out.writeUInt32LE(v1, i + 4);
    }
    return out;
}

function makeMCOZ(rawData, key) {
    const encrypted = xteaEncrypt(rawData, key);
    const header = Buffer.alloc(4 + 4 + 4);
    header.write(HEADER_MCOZ, 0, 4, 'ascii');
    header.writeUInt32LE(encrypted.length, 4);
    header.writeUInt32LE(rawData.length, 8);
    return Buffer.concat([header, encrypted]);
}

function getAllFiles(dir, base = '') {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            results = results.concat(getAllFiles(path.join(dir, entry.name), rel));
        } else {
            results.push({ rel, abs: path.join(dir, entry.name) });
        }
    }
    return results;
}

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function packDirectory(srcDir, outputBase) {
    const files = getAllFiles(srcDir);
    console.log(`Packing ${files.length} files from ${srcDir}...`);

    const epkParts = [];
    let dataOffset = 0;

    const entries = files.map((file, idx) => {
        const data = fs.readFileSync(file.abs);
        const offset = dataOffset;
        dataOffset += data.length;
        epkParts.push(data);
        return {
            filename: file.rel,
            id: idx,
            storedSize: data.length,
            realSize: data.length,
            crc: crc32(data),
            offset: EPK_DATA_OFFSET + offset,
            type: TYPE_RAW,
        };
    });

    // Build raw EIX
    const eixRawSize = 4 + 4 + 4 + entries.length * ENTRY_SIZE;
    const eixRaw = Buffer.alloc(eixRawSize);
    let pos = 0;
    eixRaw.write(HEADER_EPKD, pos, 4, 'ascii'); pos += 4;
    eixRaw.writeUInt32LE(VERSION, pos); pos += 4;
    eixRaw.writeUInt32LE(entries.length, pos); pos += 4;

    for (const entry of entries) {
        const entryStart = pos;
        eixRaw.write(entry.filename, pos, Math.min(entry.filename.length, FILENAME_LEN), 'ascii');
        pos = entryStart + FILENAME_LEN + 3;
        eixRaw.writeUInt32LE(entry.id, pos); pos += 4;
        eixRaw.writeUInt32LE(entry.storedSize, pos); pos += 4;
        eixRaw.writeUInt32LE(entry.realSize, pos); pos += 4;
        eixRaw.writeUInt32LE(entry.crc, pos); pos += 4;
        eixRaw.writeUInt32LE(entry.offset, pos); pos += 4;
        eixRaw.writeUInt8(entry.type, pos); pos += 1;
        pos = entryStart + ENTRY_SIZE;
    }

    // Build raw EPK
    const epkHeader = Buffer.alloc(EPK_DATA_OFFSET);
    epkHeader.write(HEADER_EPKD, 0, 4, 'ascii');
    epkHeader.writeUInt32LE(VERSION, 4);
    const epkRaw = Buffer.concat([epkHeader, ...epkParts]);

    // Encrypt both with MCOZ
    const eixEncrypted = makeMCOZ(eixRaw, XTEA_KEY2);
    const epkEncrypted = makeMCOZ(epkRaw, XTEA_KEY1);

    fs.writeFileSync(`${outputBase}.eix`, eixEncrypted);
    fs.writeFileSync(`${outputBase}.epk`, epkEncrypted);
    console.log(`Created ${outputBase}.eix (${eixEncrypted.length} bytes, MCOZ encrypted)`);
    console.log(`Created ${outputBase}.epk (${epkEncrypted.length} bytes, MCOZ encrypted)`);
}

const clientDir = __dirname;
const packDir = path.join(clientDir, 'pack');
const eixPath = path.join(packDir, 'root.eix');
const epkPath = path.join(packDir, 'root.epk');
const bakEix = eixPath + '.bak';
const bakEpk = epkPath + '.bak';

if (!fs.existsSync(bakEix) && fs.readFileSync(eixPath).slice(0, 4).toString('ascii') === 'MCOZ') {
    fs.copyFileSync(eixPath, bakEix);
    fs.copyFileSync(epkPath, bakEpk);
    console.log('Backed up originals to root.eix.bak / root.epk.bak');
}

packDirectory(path.join(packDir, 'root'), path.join(packDir, 'root'));
console.log('Done! Restart client to apply changes.');
