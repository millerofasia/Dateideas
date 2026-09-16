import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, Loader2, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import askArt from '@/assets/ask.jpg';
import dateArt from '@/assets/date.jpg';
import celebrationArt from '@/assets/confetti.jpg';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Just us, JamJam — A little date invitation' },
      { name: 'description', content: 'A little question, a lovely evening, and a date just for us.' },
      { property: 'og:title', content: 'Just us, JamJam' },
      { property: 'og:description', content: 'A little question and a date just for us.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: DateInvitation,
});

const dateTypes = [
  { name: 'Food date', emoji: '🍜', sub: 'Eat well, talk longer' },
  { name: 'Cinema date', emoji: '🎬', sub: 'Popcorn & whispered jokes' },
  { name: 'Beach date', emoji: '🌊', sub: 'Sunset, breeze, us' },
  { name: 'Game night', emoji: '🎮', sub: 'I’ll let you win. Maybe.' },
  { name: 'Road trip', emoji: '🚗', sub: 'Playlist ready, no map' },
  { name: 'Art & chill', emoji: '🎨', sub: 'Slow walk, pretty things' },
];

const vibes = [
  { name: 'Swallow', emoji: '🍲', sub: 'Comfort food & good company' },
  { name: 'Fried et Jollof', emoji: '🍛', sub: 'A little spice, a lot of love' },
  { name: 'Snacks', emoji: '🍟', sub: 'Little bites, long conversations' },
  { name: 'Pasta', emoji: '🍝', sub: 'Our own little Italian moment' },
];

const CHAPTERS = [
  'A QUESTION FROM THE HEART',
  'OKAY, ONE MORE THING',
  'LET’S MAKE A LITTLE PLAN',
  'PICK OUR KIND OF DAY',
  'GOOD FOOD. BETTER COMPANY.',
  'THE OFFICIAL UNOFFICIAL PART',
];

function DateInvitation() {
  const [step, setStep] = useState(0);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [dateType, setDateType] = useState('');
  const [vibe, setVibe] = useState('');
  const [note, setNote] = useState('');
  const [dodge, setDodge] = useState({ x: 0, y: 0, count: 0 });
  const [saving, setSaving] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isFood = dateType === 'Food date';
  const today = new Date();
  const minimum = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateLabel = day ? new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
  const timeLabel = time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  const art = step === 1 || step === 5 ? celebrationArt : step === 0 ? askArt : dateArt;

  function runAway() {
    const x = (Math.random() - 0.5) * 240;
    const y = (Math.random() - 0.5) * 190;
    setDodge((d) => ({ x, y, count: d.count + 1 }));
  }

  function afterTypes() {
    setStep(isFood ? 4 : 5);
  }

  async function sealIt() {
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('date_responses').insert({
      answer: 'yes',
      date_day: day || null,
      date_time: time || null,
      date_type: dateType || null,
      food_vibe: isFood ? vibe : null,
      note: note || null,
      confirmed: true,
    });
    setSaving(false);
    if (error) {
      setSaveError('That didn’t send. Check your connection and try again.');
      return;
    }
    setSealed(true);
  }

  return (
    <main className={`date-app scene-${step}`}>
      <img className="scene-art" src={art} alt="" width={768} height={1344} />
      <div className="scene-wash" />
      <header className="date-header">
        <a href="/" className="wordmark"><Heart size={17} /> just us.</a>
        <span>A LITTLE INVITATION FOR JAMJAM</span>
        <Heart size={18} className="header-heart" />
      </header>
      {step > 0 && !sealed && (
        <Button className="back-control" variant="ghost" onClick={() => setStep(step === 5 && !isFood ? 3 : step - 1)} aria-label="Go back">
          <ArrowLeft /> Back
        </Button>
      )}
      <section className="date-content" key={`${step}-${sealed}`}>
        <div className="chapter">{CHAPTERS[step]}</div>

        {step === 0 && (
          <>
            <div className="love-letter" aria-hidden="true">💌</div>
            <h1>Will you go on<br />a date with <em>me?</em></h1>
            <p className="intro">Just you, me, and a really good time. 🤎</p>
            <div className="answer-actions">
              <Button className="main-cta" onClick={() => setStep(1)}>Yes, of course <Heart size={18} /></Button>
              <Button
                variant="outline"
                className={`no-cta runaway ${dodge.count > 0 ? 'fleeing' : ''}`}
                style={{ transform: `translate(${dodge.x}px, ${dodge.y}px)` }}
                onMouseEnter={runAway}
                onPointerDown={(e) => { e.preventDefault(); runAway(); }}
                onFocus={runAway}
                onClick={(e) => { e.preventDefault(); runAway(); }}
              >
                <span className="monkey" aria-hidden="true">🐒</span> No
              </Button>
            </div>
            <p className="handwritten">
              {dodge.count === 0
                ? 'I may or may not be holding my breath...'
                : dodge.count < 4
                  ? 'The “No” is running away 🙈 catch it if you can.'
                  : 'See? Even the “No” knows the answer is yes 🤎'}
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <div className="reaction happy" aria-hidden="true">😻</div>
            <div className="heart-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i}>♥</i>)}</div>
            <h1>Wait JamJam,<br />you actually said <em>yes?</em> 😭</h1>
            <p className="intro">I was so ready for you to say no 💔</p>
            <Button className="main-cta" onClick={() => setStep(2)}>Let’s plan our date <ArrowRight /></Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="small-emblem">🗓️</div>
            <h1>So, when are<br />you <em>free?</em></h1>
            <p className="intro">I’ll clear my schedule for you.</p>
            <form className="date-form" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <label>Pick a day<input aria-label="Pick a day" type="date" min={minimum} required value={day} onChange={(e) => setDay(e.target.value)} /></label>
              <label>What time?<input aria-label="What time?" type="time" required value={time} onChange={(e) => setTime(e.target.value)} /></label>
              <Button type="submit" className="main-cta">That’s our date <ArrowRight /></Button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="small-emblem">💡</div>
            <h1>What kind of<br />date do you <em>want?</em></h1>
            <p className="intro">Pick our kind of day. I’ll make it happen.</p>
            <div className="vibe-grid types">
              {dateTypes.map((t) => (
                <Button
                  key={t.name}
                  variant="outline"
                  className={`vibe-choice ${dateType === t.name ? 'selected' : ''}`}
                  aria-pressed={dateType === t.name}
                  onClick={() => { setDateType(t.name); if (t.name !== 'Food date') setVibe(''); }}
                >
                  <span className="food-emoji">{t.emoji}</span>
                  <strong>{t.name}</strong>
                  <span>{t.sub}</span>
                  {dateType === t.name && <Heart className="selected-heart" size={14} />}
                </Button>
              ))}
            </div>
            <Button className="main-cta" disabled={!dateType} onClick={afterTypes}>
              {isFood ? 'Okay, what are we eating?' : 'It’s a date'} <ArrowRight />
            </Button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="small-emblem">🍽️</div>
            <h1>What are<br />we <em>feeling?</em></h1>
            <p className="intro">Pick your vibe. I’ll bring the butterflies.</p>
            <div className="vibe-grid">
              {vibes.map((v) => (
                <Button key={v.name} variant="outline" className={`vibe-choice ${vibe === v.name ? 'selected' : ''}`} aria-pressed={vibe === v.name} onClick={() => setVibe(v.name)}>
                  <span className="food-emoji">{v.emoji}</span>
                  <strong>{v.name}</strong>
                  <span>{v.sub}</span>
                  {vibe === v.name && <Heart className="selected-heart" size={14} />}
                </Button>
              ))}
            </div>
            <Button className="main-cta" disabled={!vibe} onClick={() => setStep(5)}>It’s a date <ArrowRight /></Button>
          </>
        )}

        {step === 5 && (
          <>
            <div className="small-emblem">🎟️</div>
            <h1>{sealed ? <>It’s <em>official.</em></> : <>Seal it with<br />a <em>promise.</em></>}</h1>
            <p className="intro">
              {sealed
                ? 'Your date pass is stamped and sent straight to me. No take-backs 🤎'
                : 'No fees, no fine print. Just one stamp and a tiny promise that you’ll show up.'}
            </p>
            <div className={`agreement ticket ${sealed ? 'stamped' : ''}`}>
              <div className="receipt-top"><span>OFFICIAL DATE PASS</span><Heart size={18} /></div>
              <p className="receipt-title">Admit one: JamJam</p>
              <dl>
                <div><dt>When</dt><dd>{dateLabel}<br />{timeLabel}</dd></div>
                <div><dt>The plan</dt><dd>{dateType}{isFood && vibe ? <><br />{vibe}</> : null}</dd></div>
                <div><dt>Price</dt><dd>Free. Just bring you.</dd></div>
              </dl>
              <div className="receipt-total"><span>Promise</span><strong className="promise">I’ll show up 🤎</strong></div>
              {sealed && <div className="stamp-mark" aria-hidden="true">SEALED</div>}
            </div>
            {!sealed && (
              <label className="note-field">
                Leave me a little note (optional)
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Say something sweet…" />
              </label>
            )}
            <p className="pickup">Glad you didn’t say no 😻<br />Be ready by {timeLabel}. I’m coming to get you 🚗</p>
            {!sealed ? (
              <>
                <Button className="main-cta" onClick={sealIt} disabled={saving}>
                  {saving ? <><Loader2 className="spin" size={18} /> Sending…</> : <>Stamp it & send to me <Stamp size={18} /></>}
                </Button>
                {saveError && <p role="status" className="payment-status">{saveError}</p>}
              </>
            ) : (
              <p role="status" className="payment-status">Sent 🤎 See you on {dateLabel} at {timeLabel}.</p>
            )}
          </>
        )}
      </section>
      <footer className="date-footer">
        <div className="progress-dots" aria-label={`Step ${step + 1} of 6`}>
          {Array.from({ length: 6 }, (_, i) => <span key={i} className={i === step ? 'active' : ''} />)}
        </div>
        <p>made with a little courage &amp; a lot of 🤎</p>
      </footer>
    </main>
  );
}
