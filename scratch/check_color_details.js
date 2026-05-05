const axios = require('axios');
async function fetchRobustData(trimId) {
    try {
        const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=' + trimId);
        const html = res.data;
        let fullRscString = '';
        for (const line of html.split('\n')) {
            if (line.includes('self.__next_f.push(')) {
                const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
                if (match) fullRscString += match[1];
            }
        }
        let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        let outerColors = [];
        try {
            const outerRaw = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
            if (outerRaw) outerColors = JSON.parse(outerRaw[1]);
        } catch(e) {}
        return outerColors;
    } catch(e) {
        return [];
    }
}

async function testMultiple() {
    const testTrimIds = [4566, 4582, 4578, 4390, 4400]; // Palisade, Santa Fe, Grandeur, G80, etc.
    for (const id of testTrimIds) {
        console.log(`\n=== Testing Trim ID: ${id} ===`);
        const colors = await fetchRobustData(id);
        if (colors.length > 0) {
            console.log('Sample color detail:', JSON.stringify(colors[0].detail));
            // Check if any color has a URL instead of a hex
            const hasUrl = colors.some(c => Array.isArray(c.detail) && c.detail.some(d => d.startsWith('http')));
            const notHex = colors.some(c => Array.isArray(c.detail) && c.detail.some(d => !d.startsWith('#')));
            console.log('Has URL:', hasUrl);
            console.log('Has non-hex:', notHex);
        } else {
            console.log('No colors found for this trim.');
        }
    }
}

testMultiple();
