// Organisation logos, hotlinked from logo.dev. Only domains confirmed from each organisation's own endorsement page.
// The publishable key is injected at build time from ../.env.local (vite.config.ts); it is never in the source.
export const LOGO_DOMAINS: Record<string, string> = {
  'Alameda County Democratic Party': 'acdems.org',
  'Berkeley Democratic Club': 'berkeleydemocraticclub.com',
  'Berkeley Neighbors for Housing and Climate Action': 'bnhca.org',
  'Berkeley Tenants Union': 'berkeleytenants.org',
  'California Democratic Renters Council': 'cademrenterscouncil.org',
  'California Working Families Party': 'caworkingfamilies.org',
  'East Bay Democratic Socialists of America': 'eastbaydsa.org',
  'East Bay Stonewall Democratic Club': 'eastbaystonewalldemocrats.org',
  'East Bay for Everyone': 'eastbayforeveryone.org',
  'Flip the Berkeley City Council': 'flipbcc.org',
  'Teamsters Joint Council 7': 'teamstersjc7.org',
  'Wellstone Democratic Renewal Club': 'wellstoneclub.org',
  'Sierra Club (SF Bay Chapter)': 'sierraclub.org',
  'Cal Berkeley Democrats': 'caldems.com',
  'AFSCME Council 57': 'afscme57.org',
  'East Bay Young Democrats': 'ebyd.org',
  'SEIU Local 1021': 'seiu1021.org',
  'California Young Democrats': 'cayoungdems.net',
  'National Union of Healthcare Workers': 'nuhw.org',
  'ACCE Action': 'acceaction.org',
};
const KEY: string = '';
/** logo URL for an organisation, or null (no confident domain, or no key at build time) */
export const logoUrl = (name: string, px: number) => {
  const dom = LOGO_DOMAINS[name];
  return dom && KEY ? `https://img.logo.dev/${dom}?token=${encodeURIComponent(KEY)}&size=${px}&format=webp&retina=true&fallback=404` : null;
};
