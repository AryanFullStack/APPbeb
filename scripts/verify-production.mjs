async function verify() {
  const ts = Date.now();
  console.log('Fetching production pages with cache bypass timestamp:', ts);

  const [homeHtml, epsomHtml, guideHtml, jobsApi, cookiesHtml] = await Promise.all([
    fetch(`https://appbeb.com/?nocache=${ts}`).then(r => r.text()),
    fetch(`https://appbeb.com/jobs/gxo-warehouse-epsom-1417607700?nocache=${ts}`).then(r => r.text()),
    fetch(`https://appbeb.com/career-guides/uk-warehouse-operative-jobs?nocache=${ts}`).then(r => r.text()),
    fetch(`https://appbeb.com/api/jobs?nocache=${ts}`).then(r => r.json()),
    fetch(`https://appbeb.com/cookies?nocache=${ts}`).then(r => r.text()),
  ]);

  console.log('----------------------------------------------------');
  console.log('1. HOMEPAGE:');
  console.log(' - Contains 5-star rating (★)?:', homeHtml.includes('★'));
  console.log(' - Contains "Direct Employer Applications"?:', homeHtml.includes('Direct Employer Applications'));
  const homeCountMatch = homeHtml.match(/Browse All (\d+) Verified Positions/i) || homeHtml.match(/Browse all jobs \((\d+)\)/i);
  console.log(' - Homepage active job count match:', homeCountMatch ? homeCountMatch[0] : 'Not found');

  console.log('----------------------------------------------------');
  console.log('2. GXO EPSOM EXPIRED JOB:');
  console.log(' - Contains "Position Filled / Closed" or "Applications Closed"?:', 
    epsomHtml.includes('Position Filled / Closed') || epsomHtml.includes('Applications Closed'));
  console.log(' - Contains "Verified Vacancy"?:', epsomHtml.includes('Verified Vacancy'));
  console.log(' - Contains JobPosting structured data?:', epsomHtml.includes('"JobPosting"'));

  console.log('----------------------------------------------------');
  console.log('3. CAREER GUIDE (/career-guides/uk-warehouse-operative-jobs):');
  const overviewCount = (guideHtml.match(/Overview/gi) || []).length;
  console.log(' - Occurrences of "Overview":', overviewCount);
  console.log(' - Contains official GOV.UK minimum wage link?:', guideHtml.includes('gov.uk/national-minimum-wage-rates'));
  console.log(' - Contains ACAS link?:', guideHtml.includes('acas.org.uk'));
  console.log(' - Contains National Careers Service link?:', guideHtml.includes('nationalcareers.service.gov.uk'));

  console.log('----------------------------------------------------');
  console.log('4. JOBS API & SYNCHRONIZATION:');
  console.log(' - Total active jobs returned from /api/jobs:', jobsApi.total);
  const epsomInApi = jobsApi.jobs?.find(j => j.slug === 'gxo-warehouse-epsom-1417607700');
  console.log(' - Is expired GXO Epsom in active API jobs list?:', Boolean(epsomInApi));
  const nonUkEu = jobsApi.jobs?.filter(j => ['canada', 'australia', 'singapore'].some(c => j.location.toLowerCase().includes(c)));
  console.log(' - Any Canada/Australia/Singapore jobs in API?:', nonUkEu?.length || 0);

  console.log('----------------------------------------------------');
  console.log('5. COOKIES & CONSENT INTERFACE:');
  console.log(' - Contains "Manage Your Stored Preferences"?:', cookiesHtml.includes('Manage Your Stored Preferences'));
  console.log(' - Contains "Reject Non-Essential"?:', cookiesHtml.includes('Reject Non-Essential'));
  console.log(' - Contains "Reset Preferences"?:', cookiesHtml.includes('Reset Preferences'));
  console.log('----------------------------------------------------');
}

verify().catch(console.error);
