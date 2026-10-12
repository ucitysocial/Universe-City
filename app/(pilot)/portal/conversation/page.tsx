import { redirect } from 'next/navigation';

/** The conversation is on the home screen, beside the dashboard. An older link to this address opens it there. */
export default function ConversationPage() {
  redirect('/portal/home');
}
