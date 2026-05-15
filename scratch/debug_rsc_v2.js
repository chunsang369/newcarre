const axios = require('axios');
const fs = require('fs');

async function debug(trimId) {
    const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
    const html = res.data;
    let fullRscString = '';
    for (const line of html.split('\n')) {
        if (line.includes('self.__next_f.push(')) {
            const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
            if (match) fullRscString += match[1];
        }
    }
    let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    fs.writeFileSync('scratch/rsc_decoded.txt', decoded);
}

debug(2505);
