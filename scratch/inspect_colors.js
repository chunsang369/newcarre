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
        let outerColors = [], innerColors = [];
        try {
            const outerRaw = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
            if (outerRaw) outerColors = JSON.parse(outerRaw[1]);
        } catch(e) {}
        try {
            const innerRaw = decoded.match(/"trim_inner_color_list":(\[.*?\]),"trim_opt_list/);
            if (innerRaw) innerColors = JSON.parse(innerRaw[1]);
        } catch(e) {}
        return { outerColors, innerColors };
    } catch(e) {
        return { error: e.message };
    }
}

fetchRobustData(4566).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
