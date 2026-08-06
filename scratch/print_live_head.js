async function main() {
  const res = await fetch('https://zerocars.netlify.app/', { cache: 'no-store' });
  const html = await res.text();
  console.log('=== FULL LIVE HEAD ===');
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || 'NO HEAD';
  console.log(head);
}
main();
