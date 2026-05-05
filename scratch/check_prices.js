const fs = require('fs');
const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

console.log("List item:");
console.log(list[0]);
console.log("\nv2Data item:");
console.log(v2Data[list[0].trimId]);
