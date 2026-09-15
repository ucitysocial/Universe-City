/** The spine. All forty eight stay in the taxonomy. Four are operational. */
export type DeptKey = 'I' | 'II' | 'III' | 'IV';

export const DEPARTMENTS: { key: DeptKey; name: string; mandate: string; color: string }[] = [
  { key: 'I',   name: 'Agency Assessment',  mandate: 'Records reality.',    color: '#5C0F1B' },
  { key: 'II',  name: 'Housing Stability',  mandate: 'Stabilises it.',      color: '#A07818' },
  { key: 'III', name: 'Career Development', mandate: 'Develops capacity.',  color: '#4A2A78' },
  { key: 'IV',  name: 'Life Management',    mandate: 'Governs decisions.',  color: '#2A4B3C' }
];

export type Folder = {
  dept: DeptKey; num: number; name: string;
  system: string; question: string; live: boolean;
};

const f = (dept: DeptKey, num: number, name: string, system: string, question: string, live = false): Folder =>
  ({ dept, num, name, system, question, live });

export const FOLDERS: Folder[] = [
  f('I', 1, 'Time', 'A schedule', 'How many hours a week are mine, and where do they sit', true),
  f('I', 2, 'Health', 'A health record', 'What am I due for, and what have I let go'),
  f('I', 3, 'Language', 'A placement across reading, writing and speaking', 'Where does it limit what I can do'),
  f('I', 4, 'Background', 'A family tree and a history timeline', 'Who can I actually call'),
  f('I', 5, 'Identification', 'A document registry', 'Can I prove who I am, and what expires first'),
  f('I', 6, 'Finance', 'A money picture', 'What comes in, what goes out, and what is left'),
  f('I', 7, 'Legal', 'A matters file', 'What am I carrying, and who handles it'),
  f('I', 8, 'Mediation', 'A conflict record', 'What was said, and what did we agree'),
  f('I', 9, 'Education', 'A credentials log', 'What can I prove I learned'),
  f('I', 10, 'Employment', 'A verified work history', 'Can I evidence all of it'),
  f('I', 11, 'Regulation', 'A record of what restores me', 'What only fills the hours'),
  f('I', 12, 'Community', 'A community log', 'Who do I know here, and what am I contributing'),

  f('II', 1, 'Inventory', 'A working inventory', 'What do I keep running out of', true),
  f('II', 2, 'Storage', 'A storage map', 'Is it worth what it costs to keep'),
  f('II', 3, 'Sanitation', 'A cleaning system', 'What is overdue'),
  f('II', 4, 'Organization', 'A household map', 'Where does everything live'),
  f('II', 5, 'Information', 'A house file', 'How does my home work, and who do I call'),
  f('II', 6, 'Administration', 'An administration calendar', 'What is due, and what renews'),
  f('II', 7, 'Law', 'A tenancy and rights file', 'What are my rights where I live'),
  f('II', 8, 'Privacy', 'A record of access', 'Who can get in, and who holds my information'),
  f('II', 9, 'Transportation', 'A transportation record', 'How long does it really take'),
  f('II', 10, 'Maintenance', 'A maintenance schedule', 'What is due'),
  f('II', 11, 'Technology', 'A device and account registry', 'What breaks if one is lost'),
  f('II', 12, 'Communal Space', 'A shared space agreement', 'What did we agree'),

  f('III', 1, 'Salary', 'A cost of living figure and a real hourly rate', 'What does an hour of my work return', true),
  f('III', 2, 'Schedule', 'A work schedule', 'What can I take on'),
  f('III', 3, 'Skill', 'A verified skills ledger', 'What am I paid for'),
  f('III', 4, 'Scope', 'A role definition', 'What am I doing that nobody agreed to'),
  f('III', 5, 'Integrity', 'A record of commitments', 'What did I do when nobody made me'),
  f('III', 6, 'Professionalism', 'A written set of work rules', 'What do I share, and with whom'),
  f('III', 7, 'Resources', 'A work resource map', 'What can I ask for that I never have'),
  f('III', 8, 'KPIs', 'A performance record', 'Which way is it moving'),
  f('III', 9, 'Advancement', 'An advancement plan', 'What am I missing'),
  f('III', 10, 'Leadership', 'An organizational chart', 'Who decides what'),
  f('III', 11, 'Info Technology', 'A record of the systems I work in', 'Who do I ask when it breaks'),
  f('III', 12, 'Networking', 'A record of the rooms I want to be in', 'What have I done about it'),

  f('IV', 1, 'Standards', 'A signed, dated list of my minimums', 'What will I not accept', true),
  f('IV', 2, 'Survival', 'An emergency plan', 'How long do I last'),
  f('IV', 3, 'Perception', 'A record of how I read things', 'Where did that reading come from'),
  f('IV', 4, 'Instinct', 'A record of my patterns', 'What do I reliably do'),
  f('IV', 5, 'Identity', 'A self description', 'Does the description still fit'),
  f('IV', 6, 'Ethics', 'A record of what I believe', 'Who gave me each of those beliefs'),
  f('IV', 7, 'Equilibrium', 'A read across every folder', 'Where is my life out of balance'),
  f('IV', 8, 'Boundary', 'A boundary protocol', 'What happens when it is crossed'),
  f('IV', 9, 'Discernment', 'A rule for which decisions need a pause', 'Which do I make too fast'),
  f('IV', 10, 'Prioritization', 'An ordered list', 'Does the order match what matters'),
  f('IV', 11, 'Systems', 'A register of every system built', 'What has fallen over'),
  f('IV', 12, 'Socializing', 'A record of my social life', 'What am I doing about the difference')
];

export const LIVE_FOLDERS = FOLDERS.filter(x => x.live);
export const deptOf = (k: DeptKey) => DEPARTMENTS.find(d => d.key === k)!;
