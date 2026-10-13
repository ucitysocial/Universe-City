// The Guided Life demo.
//
// The founder set on October 13, 2026 that Guided Life is shown first as a demo inside the real portal, before the
// database holds steps and sessions. The steps here are written for the demo and match an entry by its name. They show
// only in the File of a made up resident of the founder test, and in the Agent Portal when an agent opens one. Nothing
// pressed in the demo is filed. The session is kept in the browser that shows it.

export type DemoGroup = { name: string | null; steps: { label: string; cue: string }[] };
export type DemoPlan = { doneWhen: string; groups: DemoGroup[]; finish: string };

const s = (label: string, cue = '') => ({ label, cue });

const PLANS: { match: RegExp; plan: DemoPlan }[] = [
  {
    match: /morning routine/i,
    plan: {
      doneWhen: 'You are washed, dressed, fed, and ready to leave on time.',
      finish: 'Did you leave on time?',
      groups: [{ name: null, steps: [
        s('Wash your face and brush your teeth', 'Start with your face and teeth. Press Done when you are ready for the next step.'),
        s('Shower and get dressed', 'Shower, then put on the clothes you chose.'),
        s('Make breakfast', 'Make the breakfast you planned.'),
        s('Pack your lunch and your bag', 'Pack your lunch and the bag you take with you.'),
        s('Check for your keys, phone, and wallet', 'Keys, phone, wallet. Then you are ready to leave.')
      ] }]
    }
  },
  {
    match: /night routine|bedtime/i,
    plan: {
      doneWhen: 'Tomorrow is set up and you are in bed at the time you chose.',
      finish: 'Are you in bed?',
      groups: [{ name: null, steps: [
        s('Put your phone on the charger', 'Plug in your phone now, so it is charged in the morning.'),
        s('Choose your clothes for tomorrow', 'Lay out what you will wear tomorrow.'),
        s('Wash your face and brush your teeth'),
        s('Set your alarm', 'Set the alarm for the time you wake up.'),
        s('Lights off')
      ] }]
    }
  },
  {
    match: /print shop/i,
    plan: {
      doneWhen: 'You worked the shift, and each order still open is handed off.',
      finish: 'Is every open order handed off?',
      groups: [
        { name: 'Opening', steps: [
          s('Clock in'),
          s('Turn on the printers and check the paper and ink', 'Turn on each printer. Check the paper trays and the ink.'),
          s('Read the order list for today', 'Read the order list, so you know what is due first.')
        ] },
        { name: 'The work', steps: [
          s('Print and pack the orders on the list', 'Work down the order list from the top.'),
          s('Help customers at the counter')
        ] },
        { name: 'Closing', steps: [
          s('Write down each order still open'),
          s('Hand the open orders to the next shift', 'Give the list of open orders to the person who takes over.'),
          s('Clock out')
        ] }
      ]
    }
  },
  {
    match: /bar shift|bartend/i,
    plan: {
      doneWhen: 'You worked the shift, the bar is clean, and the drawer is counted.',
      finish: 'Is the drawer counted and the bar clean?',
      groups: [
        { name: 'Opening', steps: [
          s('Clock in'),
          s('Stock the ice, fruit, and glasses', 'Fill the ice, cut the fruit, and stack the clean glasses.'),
          s('Count the cash drawer')
        ] },
        { name: 'Service', steps: [
          s('Serve guests'),
          s('Restock the bar during the shift', 'Restock the ice and glasses when they run low.')
        ] },
        { name: 'Closing', steps: [
          s('Clean the bar and the floor mats'),
          s('Count the cash drawer again'),
          s('Clock out')
        ] }
      ]
    }
  },
  {
    match: /grocer/i,
    plan: {
      doneWhen: 'The groceries on your list are home and put away.',
      finish: 'Are the groceries put away?',
      groups: [{ name: null, steps: [
        s('Check the fridge and the cupboards', 'Look at what you already have before you write the list.'),
        s('Write the grocery list'),
        s('Bring your bags and a way to pay'),
        s('Shop for each item on the list'),
        s('Put the groceries away')
      ] }]
    }
  },
  {
    match: /dentist|doctor|appointment|clinic/i,
    plan: {
      doneWhen: 'You went to the appointment and you know what happens next.',
      finish: 'Do you know what happens next?',
      groups: [{ name: null, steps: [
        s('Bring your ID and your insurance card'),
        s('Leave 15 minutes early', 'Leave now, so you arrive 15 minutes before the appointment.'),
        s('Check in at the front desk'),
        s('Write down what they tell you'),
        s('Set the next appointment, if they ask for one')
      ] }]
    }
  },
  {
    match: /laundry/i,
    plan: {
      doneWhen: 'Your clothes are washed, dried, and put away.',
      finish: 'Are the clothes put away?',
      groups: [{ name: null, steps: [
        s('Gather the dirty clothes'),
        s('Start the washer'),
        s('Move the clothes to the dryer'),
        s('Fold the clothes'),
        s('Put the clothes away')
      ] }]
    }
  },
  {
    match: /study|homework/i,
    plan: {
      doneWhen: 'You finished the study block you planned.',
      finish: 'Did you finish the study block?',
      groups: [{ name: null, steps: [
        s('Put your phone in another room'),
        s('Open the material for today'),
        s('Read and take notes for 25 minutes'),
        s('Take a 5 minute break'),
        s('Answer the practice questions')
      ] }]
    }
  }
];

export function demoPlan(label: string): DemoPlan | null {
  return PLANS.find(p => p.match.test(label))?.plan ?? null;
}

/** Every step in order, with the name of its group. */
export function flatSteps(plan: DemoPlan): { label: string; cue: string; group: string | null }[] {
  return plan.groups.flatMap(g => g.steps.map(x => ({ ...x, group: g.name })));
}
