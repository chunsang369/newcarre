const fs = require('fs');

async function test() {
  const trimParams = new URLSearchParams();
  // Pack for trim 15208 (Grandeur Premium Hybrid)
  trimParams.append('pack', 'eJxdUMtOAzEM/Befe9gFUWivvE6pKtFLj2ZjthZ5yc2KQrX/TrwPVJqTZzwee3KGhIIe1mdgezL4SQJrqGGhcIOeClpN0ERLTrv1/FWpkXgWtKm7r5cTshL1K7m6qB+gXcCSU5qD2XwcS0sKrzbZ7d9zsN0W7L5OtGl1xuVhdURcnonOT5jm0HOilI/cYh2vG1rDmjX/oH5uEG9p9p5kVCnmmtyQcrcZZztQTpXjkPIlDDDR3TAx5yOU5aOBKn67FU4EV9CV8FEtixllLH9g53TV/ibm8yrHnrGZTUdx0PmFLf+MZ2UH/C8l3iIg==');
  trimParams.append('input[pageCode]', 'estimateDetail');

  const res = await fetch('https://m.hicarzautoplan.com/cars/index/view/?layout=clear', {
    method: 'POST',
    body: trimParams,
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scratch/trim_15208_options.html', html);
  console.log('Saved to scratch/trim_15208_options.html');
}

test();
