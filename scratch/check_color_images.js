const axios = require('axios');
const fs = require('fs');

async function findImages() {
    // 팰리세이드
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566');
    const html = res.data;
    
    // find anything containing .jpg or .png near colors
    const imageMatches = html.match(/"[^"]+\.(jpg|png|webp)"/g);
    if (imageMatches) {
        console.log("Images found in HTML:");
        // print unique images
        [...new Set(imageMatches)].slice(0, 15).forEach(m => console.log(m));
    }
    
    let fullRscString = '';
    for (const line of html.split('\n')) {
        if (line.includes('self.__next_f.push(')) {
            const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
            if (match) fullRscString += match[1];
        }
    }
    let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    
    // Look for image lists
    console.log("\nVariables containing 'image' in decoded JSON:");
    const imgVars = decoded.match(/"[a-zA-Z_]*image[a-zA-Z_]*":\[.*?\]/g);
    if (imgVars) {
        imgVars.slice(0, 5).forEach(v => console.log(v.substring(0, 150) + '...'));
    }
    
    // Also look at outer_color_list again exactly
    const outerMatch = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
    if (outerMatch) {
        console.log("\nOuter Color List:");
        console.log(outerMatch[1].substring(0, 300));
    }
}

findImages();
