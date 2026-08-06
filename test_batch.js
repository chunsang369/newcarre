async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/pricing/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'adjust',
        type: 'rent',
        amount: 10000,
        filters: {}
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response Body:', text.slice(0, 1000));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
