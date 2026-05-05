const axios = require('axios');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json'));
const def = Object.values(data).find(c => c.modelName.includes('Defender'));

if (def) {
    console.log("Defender Trim ID:", def.trimId);
    
    // Fetch it directly from chasalddae to see if it has options
    axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${def.trimId}`)
        .then(res => {
            const html = res.data;
            const optMatch = html.match(/"trim_opt_list":(\[.*?\]),"/);
            if (optMatch) {
                console.log("Options found:", optMatch[1]);
            } else {
                console.log("No options found in the payload.");
            }
        })
        .catch(console.error);
} else {
    console.log("Defender not found in local data");
}
