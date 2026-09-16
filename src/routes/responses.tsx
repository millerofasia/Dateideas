import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export const Route = createFileRoute('/responses')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Her answers — Just us, JamJam' },
      { name: 'description', content: 'A private page to see every answer she sent.' },
      { property: 'og:title', content: 'Her answers' },
      { property: 'og:description', content: 'A private page to see every answer she sent.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: ResponsesPage,
});

type Row = {
  id: string;
  created_at: string;
  answer: string;
  date_day: string | null;
  date_time: string | null;
  date_type: string | null;
  food_vibe: string | null;
  note: string | null;
};

function ResponsesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRows([]); return; }
    let active = true;
    supabase.from('date_responses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (active && data) setRows(data as Row[]);
    });
    const channel = supabase
      .channel('date_responses_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'date_responses' }, (payload) => {
        setRows((current) => [payload.new as Row, ...current]);
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [session]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage(error.message);
  }

  async function signUp() {
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    setMessage(error ? error.message : 'Account created — you’re in.');
  }

  if (!ready) return <main className="admin-page"><p>Loading…</p></main>;

  if (!session) {
    return (
      <main className="admin-page">
        <h1>Her answers</h1>
        <p className="intro">Private page. Sign in to see what she picked.</p>
        <form className="date-form" onSubmit={signIn}>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <Button className="main-cta" type="submit" disabled={busy}>Sign in</Button>
          <Button type="button" variant="ghost" onClick={signUp} disabled={busy}>First time? Create my account</Button>
        </form>
        {message && <p role="status" className="payment-status">{message}</p>}
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-top">
        <h1>Her answers</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
      <p className="intro">{rows.length === 0 ? 'Nothing yet — her answers will appear here the moment she sends them.' : `${rows.length} answer${rows.length === 1 ? '' : 's'} so far.`}</p>
      <ul className="answer-list">
        {rows.map((r) => (
          <li key={r.id}>
            <div className="answer-when">{new Date(r.created_at).toLocaleString()}</div>
            <dl>
              <div><dt>Answer</dt><dd>{r.answer}</dd></div>
              <div><dt>Day</dt><dd>{r.date_day ?? '—'}</dd></div>
              <div><dt>Time</dt><dd>{r.date_time ?? '—'}</dd></div>
              <div><dt>Date idea</dt><dd>{r.date_type ?? '—'}</dd></div>
              <div><dt>Food vibe</dt><dd>{r.food_vibe ?? '—'}</dd></div>
              <div><dt>Note</dt><dd>{r.note ?? '—'}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </main>
  );
}
