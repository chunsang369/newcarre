async function verifyLiveMetadata() {
  console.log('Fetching live HTML from https://zerocars.netlify.app/ ...\n');
  try {
    const res = await fetch('https://zerocars.netlify.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();

    console.log('=== [Live Site Meta Verification] ===');
    
    // Check specific tags
    const checks = [
      { name: 'Title', pass: html.includes('<title>제로카즈 | 안심정찰제 신차 장기렌트·리스 견적 비교</title>') },
      { name: 'Google Verification', pass: html.includes('EB-w_TSyKaAyvESBFKuCPe9ep1gR05l9RcP7Dy1ktHE') },
      { name: 'Naver Verification', pass: html.includes('503c147efa4a1024a5eaaaf58e5679674e6a340c') },
      { name: 'Description', pass: html.includes('제로카즈, 안심정찰제, 신차 장기렌트, 리스 최저가 견적을 비교하고') },
      { name: 'Keywords', pass: html.includes('제로카즈, 안심정찰제, 장기렌트') },
      { name: 'OG Title', pass: html.includes('og:title') && html.includes('안심정찰제') },
      { name: 'Twitter Meta', pass: html.includes('twitter:title') }
    ];

    checks.forEach(c => {
      console.log(`${c.pass ? '✅ PASS' : '❌ FAIL'}: ${c.name}`);
    });

    console.log('\n--- HEAD section snippet ---');
    const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
    if (headMatch) {
      console.log(headMatch[1].slice(0, 1500));
    }
  } catch (err) {
    console.error('Error fetching live site:', err);
  }
}

verifyLiveMetadata();
