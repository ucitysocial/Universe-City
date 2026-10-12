import { redirect } from 'next/navigation';

/** Activity is part of Settings. An older link to this address opens it there. */
export default function ActivityPage() {
  redirect('/portal/settings#activity');
}
