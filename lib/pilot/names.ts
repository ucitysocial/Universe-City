// Plain names for the actions, for the activity list.
export const ACTION_NAME: Record<string, string> = {
  search_conversation: 'Looked through the conversation',
  search_file: 'Looked on file',
  get_day: 'Read one day',
  get_history: 'Read the history of one entry',
  file_statement: 'File a statement',
  correct_statement: 'Correct a statement',
  withdraw_statement: 'Withdraw a statement',
  set_schedule_item: 'Add to the weekly schedule',
  change_schedule_item: 'Change the weekly schedule',
  end_schedule_item: 'End a weekly schedule item',
  add_commitment: 'Add a commitment',
  change_commitment: 'Change a commitment',
  withdraw_commitment: 'Take a commitment off',
  report_outcome: 'File an outcome',
  draft_plan: 'Prepare a Plan',
  prepare: 'Prepare an entry for your answer',
  resident_decision: 'File your answer',
  propose_to_agent: 'Send a proposal to your agent',
  open_follow_up: 'Open a follow up',
  close_follow_up: 'Close a follow up',
  screen_decision: 'Your press on the screen',
  desk_decision: 'A decision by a person'
};

export const OUTCOME_WORD: Record<string, { word: string; tone: string }> = {
  filed: { word: 'Filed', tone: 'filed' },
  decided: { word: 'Decided', tone: 'filed' },
  prepared: { word: 'Waiting for you', tone: 'wait' },
  proposed: { word: 'Sent to your agent', tone: 'agent' },
  refused: { word: 'Left off the File', tone: 'no' },
  failed: { word: 'Did not work', tone: 'no' },
  read: { word: 'Read', tone: 'unknown' }
};
