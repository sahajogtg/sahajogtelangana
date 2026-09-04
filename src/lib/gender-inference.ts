/**
 * Heuristic gender inference from Indian names.
 *
 * Returns "Female", "Male", or "Unknown".
 * Accuracy is high for common Indian first names but not perfect.
 * Admins can always override the inferred value in the database.
 */

const FEMALE_SUFFIXES = [
  'i',   // Lakshmi, Saraswati, Priyanka, Kavitha, Devi
  'ha',  // Radha, Hema, Sucheta
  'ka',  // Deepika, Rekha, Mukta, Meenakshi (also covers -shka)
  'ni',  // Manjulika, Padmavani, Shalini
  'la',  // Vibhavari, Sundari
  'ti',  // Kaviti, Sunita, Sangeeta
  'ya',  // Madhavi, Radhika, Malathi (also covers -thya, -avya)
  'ee',  // Sridevi (rare but exists)
  'ai',  // Bombayai (rare)
  'm',   // Usharani -> no, skip this (too many male -m names)
];

// Male-leaning suffixes that might otherwise get caught by female rules
const MALE_OVERRIDES = [
  'sh',  // Ramesh, Rajesh, Suresh, Nilesh
  'nt',  // Anant, Prashant, Bharat (covers -ant, -ent)
  'j',   // Jatindra, Ranjit, Suraj
  'eep', // Deepak, Pradeep
  'nder', // Surender, Rajender
  'esh', // Ritesh, Hitesh, Avinash (covers -esh)
  'raj', // Balraj, Tejraj
  'der', // Avinander
  'jan', // Niranjan, Manoranjan
  'nan', // Nandan, Charanan
  'wan', // Subhash, Kuldeep (rare, but some)
  'ard', // Subhash (no)
  'ksh', // Mukesh, Prakash (covers -kesh, -akash)
];

function extractFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
}

function isLikelyFemaleFirstName(firstName: string): boolean {
  const lower = firstName.toLowerCase();
  if (lower.length < 2) return false;

  // Check male overrides first
  for (const suffix of MALE_OVERRIDES) {
    if (lower.endsWith(suffix)) return false;
  }

  // Check female suffixes
  for (const suffix of FEMALE_SUFFIXES) {
    if (lower.endsWith(suffix)) return true;
  }

  return false;
}

function isLikelyMaleFirstName(firstName: string): boolean {
  const lower = firstName.toLowerCase();
  if (lower.length < 2) return false;

  // Common male-only endings
  const maleEndings = ['sh', 'nt', 'j', 'eep', 'nder', 'esh', 'raj', 'der', 'jan', 'nan', 'ksh', 'ndra'];
  for (const suffix of maleEndings) {
    if (lower.endsWith(suffix)) return true;
  }

  return false;
}

export type Gender = 'Male' | 'Female' | 'Unknown';

/**
 * Infer gender from a full name using Indian name heuristics.
 * Returns "Male", "Female", or "Unknown".
 */
export function inferGender(fullName: string): Gender {
  const firstName = extractFirstName(fullName);
  if (!firstName) return 'Unknown';

  if (isLikelyFemaleFirstName(firstName)) return 'Female';
  if (isLikelyMaleFirstName(firstName)) return 'Male';

  return 'Unknown';
}
