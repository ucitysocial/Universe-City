"use client";

import { useEffect, useMemo, useState } from "react";

const folders = [
  {
    department: "Agency Assessment",
    number: "I",
    folder: "Time",
    color: "var(--I)",
    slides: [
      {
        title: "Build the calendar from a real day.",
        body: "Start with yesterday. Tell your agent when you woke up, got ready, traveled, worked, ate, rested and went to sleep.",
      },
      {
        title: "Add the parts that repeat.",
        body: "Your agent adds work, commuting, meals, sleep, appointments, responsibilities and the things you want more time for.",
      },
      {
        title: "See the week day by day.",
        body: "Required time gets placed first. The calendar then shows the time that is still available.",
      },
      {
        title: "Change it by talking to your agent.",
        body: "Tell your agent when a shift moves, an appointment is booked or you need time for a project. The calendar changes with you.",
      },
      {
        title: "Carry the schedule with you.",
        body: "The calendar is being built to connect with the calendar service you already use on your devices.",
      },
    ],
  },
  {
    department: "Housing Stability",
    number: "II",
    folder: "Inventory",
    color: "var(--II)",
    slides: [
      {
        title: "Start with an empty home.",
        body: "Imagine moving into a furnished apartment with an empty kitchen, bathroom, laundry area and cabinets. Tell your agent what you would buy first.",
      },
      {
        title: "Establish what you normally keep.",
        body: "For each recurring item, confirm the quantity you normally buy and how long that amount usually lasts.",
      },
      {
        title: "Compare the baseline to your actual home.",
        body: "Your agent can separate what is already covered from what is low or missing.",
      },
      {
        title: "Use receipts and orders as evidence.",
        body: "Receipts and order records can update item, quantity, price, date and merchant without making you re-enter the purchase.",
      },
      {
        title: "Let the baseline improve over time.",
        body: "When replacement timing differs from what you expected, your agent can ask whether the household baseline needs to change.",
      },
    ],
  },
  {
    department: "Career Development",
    number: "III",
    folder: "Salary",
    color: "var(--III)",
    slides: [
      {
        title: "Start with the last full month.",
        body: "Review what actually came in and what actually went out during a month that already happened.",
      },
      {
        title: "Confirm the regular expenses.",
        body: "Your agent records each recurring bill, its amount, when it is due and whether the amount is fixed or changes.",
      },
      {
        title: "See income against expenses.",
        body: "The working view shows what came in, what has to go out and what remains.",
      },
      {
        title: "Ask questions before the next paycheck.",
        body: "Use the record to check what still has to come out, what is left and how a change in work or expenses changes the month.",
      },
      {
        title: "Keep estimates separate from confirmed amounts.",
        body: "An amount can stay estimated until you confirm a better number from a bill, account or transaction.",
      },
    ],
  },
  {
    department: "Life Management",
    number: "IV",
    folder: "Standards",
    color: "var(--IV)",
    slides: [
      {
        title: "Start with the rules you return to.",
        body: "Your agent asks what you start doing again when you want your life to function consistently, and what you stop doing.",
      },
      {
        title: "Turn the pattern into a candidate standard.",
        body: "A routine such as training three times a week or avoiding gluten is proposed back to you in plain language.",
      },
      {
        title: "Confirm why it matters.",
        body: "A standard records the rule, its intention, the value behind it and the impact you expect when you maintain it.",
      },
      {
        title: "Nothing becomes a standard without your confirmation.",
        body: "Your agent can notice a pattern and ask about it. You decide whether it belongs in Standards.",
      },
      {
        title: "Use the standard where it applies.",
        body: "A confirmed sleep standard can affect Time. A food standard can affect Inventory. A spending rule can affect financial work.",
      },
    ],
  },
];

export default function ApplicationFolderShowcase() {
  const [folderIndex, setFolderIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = folders[folderIndex];
  const slide = active.slides[slideIndex];

  const dots = useMemo(() => active.slides.map((_, i) => i), [active]);

  useEffect(() => {
    setSlideIndex(0);
  }, [folderIndex]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setSlideIndex((current) => {
        if (current + 1 < active.slides.length) return current + 1;
        setFolderIndex((folder) => (folder + 1) % folders.length);
        return 0;
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, [active.slides.length, paused]);

  return (
    <div className="application-folders" style={{ "--folder-color": active.color } as React.CSSProperties}>
      <div className="application-folder-tabs" role="tablist" aria-label="Starting folders">
        {folders.map((item, index) => (
          <button
            key={item.folder}
            type="button"
            role="tab"
            aria-selected={index === folderIndex}
            className={index === folderIndex ? "active" : ""}
            onClick={() => setFolderIndex(index)}
          >
            <span>{item.number}</span>
            {item.folder}
          </button>
        ))}
      </div>

      <div className="application-folder-stage">
        <div className="application-folder-heading">
          <p className="kick">{active.department}</p>
          <p className="application-folder-number">Folder 01</p>
          <h2>{active.folder}</h2>
        </div>

        <div className="application-folder-slide" aria-live="polite">
          <p className="application-folder-step">Step {String(slideIndex + 1).padStart(2, "0")} of {String(active.slides.length).padStart(2, "0")}</p>
          <h3>{slide.title}</h3>
          <p>{slide.body}</p>
        </div>

        <div className="application-folder-controls">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setSlideIndex((current) => (current - 1 + active.slides.length) % active.slides.length)}
          >
            ←
          </button>
          <div className="application-folder-dots" aria-label="Slides">
            {dots.map((dot) => (
              <button
                key={dot}
                type="button"
                aria-label={`Show slide ${dot + 1}`}
                aria-current={dot === slideIndex ? "true" : undefined}
                onClick={() => setSlideIndex(dot)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setSlideIndex((current) => (current + 1) % active.slides.length)}
          >
            →
          </button>
          <button
            type="button"
            className="application-folder-pause"
            aria-pressed={paused}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
    </div>
  );
}
