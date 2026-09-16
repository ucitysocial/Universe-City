'use client';

import { useEffect, useState, type CSSProperties } from 'react';

type JourneyCard = {
  eyebrow: string;
  title: string;
  body: string;
  example?: string;
};

type FolderJourney = {
  key: 'I' | 'II' | 'III' | 'IV';
  name: string;
  department: string;
  color: string;
  cards: JourneyCard[];
};

const FOLDERS: FolderJourney[] = [
  {
    key: 'I',
    name: 'Time',
    department: 'Agency Assessment',
    color: '#5C0F1B',
    cards: [
      {
        eyebrow: 'Start with real life',
        title: 'Tell your agent how your week already works.',
        body: 'Start with the things that already take your time: work, commuting, meals, sleep, getting ready, appointments, exercise, caregiving, rest and recurring responsibilities.'
      },
      {
        eyebrow: 'Make room on purpose',
        title: 'Add what you want more time for.',
        body: 'Tell your agent what you want to protect or start doing more often, like the gym, recovery, errands, family time, a business, hobbies or simply having time to do nothing.'
      },
      {
        eyebrow: 'Your agent builds it',
        title: 'Turn that information into a working calendar.',
        body: 'Your agent blocks the time that is already required, builds your daily schedules around it and shows you what time is actually still available.'
      },
      {
        eyebrow: 'Change it by talking',
        title: 'Update the calendar in plain language.',
        body: 'When something changes, tell your agent. You do not have to rebuild the week yourself.',
        example: '“I work at 2 tomorrow instead of 4.” “I have an appointment Thursday morning.” “I need three hours for my business this week.”'
      },
      {
        eyebrow: 'Know what is yours',
        title: 'See where you can rest, recover or reinvest in yourself.',
        body: 'The point is not to fill every open hour. It is to know what is committed, what can move and where you actually have room for yourself.'
      }
    ]
  },
  {
    key: 'II',
    name: 'Inventory',
    department: 'Housing Stability',
    color: '#A07818',
    cards: [
      {
        eyebrow: 'Establish a baseline',
        title: 'Start with what your household normally needs.',
        body: 'Tell your agent about the groceries, drinks, household supplies, laundry products, paper goods, hygiene products, pet supplies and other everyday items you regularly use and replace.'
      },
      {
        eyebrow: 'Define stocked',
        title: 'Set the amount that feels normal for you.',
        body: 'Your agent helps establish how much you usually keep on hand and how often you tend to replenish it.',
        example: '“Two cases of water every two weeks.” “I always want toothpaste, deodorant and body wash on hand.”'
      },
      {
        eyebrow: 'Your agent maintains it',
        title: 'Turn the baseline into a working household inventory.',
        body: 'Your agent keeps track of what is available, what is getting low and what needs to be replenished so you are not starting every grocery or household run from memory.'
      },
      {
        eyebrow: 'Keep it current',
        title: 'Tell your agent what changed.',
        body: 'Say when something is running low, when you bought more, when you stopped using an item or when something new becomes part of your normal routine. The inventory changes with you.'
      },
      {
        eyebrow: 'Learn the pattern',
        title: 'Know what you keep needing before you run out.',
        body: 'Over time, your agent can help you see what needs replenishing, what you repeatedly run out of, what you are buying more often than expected and what your normal household restock requires.'
      }
    ]
  },
  {
    key: 'III',
    name: 'Salary',
    department: 'Career Development',
    color: '#4A2A78',
    cards: [
      {
        eyebrow: 'Money in',
        title: 'Start with how you get paid.',
        body: 'Tell your agent where your income comes from, how much you make, how often you are paid and what your normal work schedule looks like.'
      },
      {
        eyebrow: 'Money out',
        title: 'Add what your income regularly has to cover.',
        body: 'Establish the everyday expenses that keep your life running, like rent, utilities, transportation, groceries, phone service, subscriptions, minimum payments and other recurring costs.'
      },
      {
        eyebrow: 'Your agent keeps the view',
        title: 'See income, expenses and what is left together.',
        body: 'Your agent maintains a simple working budget so you can see what is coming in, what still needs to go out, what is due and what remains after your regular expenses are covered.'
      },
      {
        eyebrow: 'Use it before decisions',
        title: 'Ask practical questions with the numbers already in front of you.',
        body: 'Your agent can help you work through the effect of a purchase, a different shift, fewer hours or another change before you decide.',
        example: '“What still needs to come out of this check?” “What changes if I work one less shift?”'
      },
      {
        eyebrow: 'Keep the budget current',
        title: 'Update it when your pay or expenses change.',
        body: 'A raise, different hours, a rent increase or a new recurring cost changes the picture. Salary stays focused on your current income versus your current expenses; the deeper Finance folder can go further later.'
      }
    ]
  },
  {
    key: 'IV',
    name: 'Standards',
    department: 'Life Management',
    color: '#2A4B3C',
    cards: [
      {
        eyebrow: 'You do not need a list',
        title: 'Your agent helps you discover what keeps you on track.',
        body: 'Instead of asking you to name your standards cold, your agent asks what is usually true when life is going well, what falls apart first and what you always put back in place when you decide to reset.'
      },
      {
        eyebrow: 'Find the pattern',
        title: 'Turn the things you already know about yourself into standards.',
        body: 'They can be practical, physical, personal or moral. The point is to identify the repeatable conditions and rules that make your life work better when you follow them.',
        example: '“No gluten.” “Gym at least three times a week.” “Do not spend money already committed to something else.”'
      },
      {
        eyebrow: 'Make it usable',
        title: 'Your agent helps make each standard clear enough to follow.',
        body: 'A vague idea like “eat better” is not very useful. Your agent helps you decide what the rule actually is, whether there are exceptions and when the standard starts. You confirm what belongs in your file.'
      },
      {
        eyebrow: 'Use it across your life',
        title: 'Established standards can guide the other folders.',
        body: 'A gym standard can affect Time. A no-gluten standard can affect Inventory. A spending standard can matter in Salary. Your own rules stay available when the rest of your life is being managed.'
      },
      {
        eyebrow: 'They belong to you',
        title: 'Your agent helps you maintain your standards, not invent them for you.',
        body: 'You decide what you require. You can change a standard when it no longer fits. The value is that you do not have to rediscover your rules every time life gets busy or a decision gets difficult.'
      }
    ]
  }
];

export default function ApplicationFolderShowcase() {
  const [folderIndex, setFolderIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const folder = FOLDERS[folderIndex];
  const card = folder.cards[cardIndex];

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (cardIndex < folder.cards.length - 1) {
        setCardIndex(cardIndex + 1);
      } else {
        setFolderIndex((folderIndex + 1) % FOLDERS.length);
        setCardIndex(0);
      }
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [paused, folderIndex, cardIndex, folder.cards.length]);

  function chooseFolder(index: number) {
    setFolderIndex(index);
    setCardIndex(0);
  }

  function previous() {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      return;
    }
    const previousFolder = (folderIndex - 1 + FOLDERS.length) % FOLDERS.length;
    setFolderIndex(previousFolder);
    setCardIndex(FOLDERS[previousFolder].cards.length - 1);
  }

  function next() {
    if (cardIndex < folder.cards.length - 1) {
      setCardIndex(cardIndex + 1);
      return;
    }
    setFolderIndex((folderIndex + 1) % FOLDERS.length);
    setCardIndex(0);
  }

  const style = { '--folder-color': folder.color } as CSSProperties;

  return (
    <div className="application-showcase" style={style}>
      <div className="application-folder-tabs" aria-label="Explore the four folders">
        {FOLDERS.map((item, index) => (
          <button
            type="button"
            key={item.key}
            onClick={() => chooseFolder(index)}
            className={index === folderIndex ? 'active' : ''}
            aria-pressed={index === folderIndex}
            style={{ '--tab-color': item.color } as CSSProperties}
          >
            <span>{item.key}</span>
            {item.name}
          </button>
        ))}
      </div>

      <div
        className="application-card-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="application-card-shadow application-card-shadow-two" aria-hidden="true" />
        <div className="application-card-shadow application-card-shadow-one" aria-hidden="true" />
        <article className="application-journey-card" key={`${folder.key}-${cardIndex}`} aria-live="polite">
          <div className="application-card-head">
            <div>
              <span className="application-folder-key">{folder.key}</span>
              <span className="application-folder-name">Folder 01 · {folder.name}</span>
            </div>
            <span className="application-card-count">{cardIndex + 1}/{folder.cards.length}</span>
          </div>
          <p className="application-card-eyebrow">{card.eyebrow}</p>
          <h3>{card.title}</h3>
          <p className="application-card-body">{card.body}</p>
          {card.example && <p className="application-card-example">{card.example}</p>}
          <p className="application-department-name">{folder.department}</p>
        </article>
      </div>

      <div className="application-showcase-controls">
        <div className="application-card-dots" aria-label={`${folder.name} cards`}>
          {folder.cards.map((_, index) => (
            <button
              type="button"
              key={index}
              aria-label={`Show ${folder.name} card ${index + 1}`}
              aria-current={index === cardIndex ? 'true' : undefined}
              onClick={() => setCardIndex(index)}
            />
          ))}
        </div>
        <div className="application-showcase-buttons">
          <button type="button" onClick={previous} aria-label="Previous card">←</button>
          <button type="button" onClick={() => setPaused(!paused)}>{paused ? 'Play' : 'Pause'}</button>
          <button type="button" onClick={next} aria-label="Next card">→</button>
        </div>
      </div>
    </div>
  );
}
