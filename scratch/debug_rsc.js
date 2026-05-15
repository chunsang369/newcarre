const axios = require('axios');

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
    
    // Find where the car data starts
    const startIdx = decoded.indexOf('{"id":');
    if (startIdx !== -1) {
        console.log("Decoded segment around car data:");
        console.log(decoded.substring(startIdx, startIdx + 2000));
    } else {
        console.log("Could not find car data in decoded string.");
    }
}

debug(2505);
