// Notes: short opinion pieces, one per entry, newest first. Each gets its own page at /notes/<slug>, and the newest four
// show on the home page. These are drafts to rewrite in your own words: add, cut or reorder freely.
export type Note = {
  slug: string;
  title: string;
  dek: string; // the one-line summary under the title
  tag: string;
  minutes: number; // reading time
  body: string[]; // paragraphs
  tone: string; // the cover's colour, until there's a cover image
  cover?: string; // a cover image in public/, e.g. "/notes/turnaround.jpg"
};

export const NOTES: Note[] = [
  {
    slug: "design-is-a-business-function-now",
    title: "Design is a business function now",
    dek: "The landscape has shifted: a designer who only makes things look good is competing with a prompt.",
    tag: "Landscape",
    minutes: 4,
    tone: "#2e3f9e",
    body: [
      "A few years ago, a good-looking website was a competitive edge. Today it's the minimum. Templates, AI tools and component libraries have made 'polished' cheap, and founders know it.",
      "What hasn't become cheap is judgement: knowing what a brand should say before deciding how it should look, knowing which page actually moves a number, knowing when a feature is a distraction. That's strategy and product thinking, and it's where design is heading.",
      "The designers who do well from here are the ones who can sit in a business conversation and turn it into decisions on the screen. Not because they've stopped caring about craft, but because craft without a reason is now the easy part.",
      "That's the shift I try to work on the right side of: start with the business, then make it beautiful.",
    ],
  },
  {
    slug: "turnaround-time-has-collapsed",
    title: "Turnaround time has collapsed",
    dek: "What took a quarter now takes weeks. Speed is the new expectation, so thinking has to move earlier.",
    tag: "Process",
    minutes: 3,
    tone: "#e07b2a",
    body: [
      "A brand identity used to be a three-month project. A website, another three. Now founders expect both in weeks, and with the right tools that's often possible.",
      "The making has sped up. The deciding hasn't. When the turnaround shrinks, the time you can afford to spend going in the wrong direction shrinks with it.",
      "So I move the thinking up front: a short, sharp phase on who it's for, what it needs to do and what it must not be, before anything is drawn. It feels slower on day one and is much faster by week three.",
      "Fast is good. Fast and pointed in the right direction is the whole job.",
    ],
  },
  {
    slug: "taste-is-the-last-moat",
    title: "Taste is the last moat",
    dek: "When anyone can generate a hundred options, the value is in knowing which one is right.",
    tag: "AI",
    minutes: 3,
    tone: "#c8241f",
    body: [
      "AI didn't remove the need for designers. It removed the scarcity of options. Anyone can now produce a hundred logos, layouts or landing pages in an afternoon.",
      "The hard part was never producing options. It was choosing, and defending the choice: this one, for this audience, for these reasons.",
      "That's taste, and taste isn't mystical. It's pattern recognition built from a lot of looking, plus enough understanding of the business to know what 'right' means here.",
      "I use the tools every day. They make me faster. They don't make the call.",
    ],
  },
  {
    slug: "brief-outcomes-not-looks",
    title: "Brief outcomes, not looks",
    dek: "'Make it modern and clean' is not a brief. 'Get investors to take the second meeting' is.",
    tag: "Founders",
    minutes: 3,
    tone: "#2f8a55",
    body: [
      "Most briefs I receive describe a look: modern, minimal, premium, like this other brand. Almost none describe what the design is supposed to do.",
      "The best projects start the other way round. What should someone feel, believe or do after seeing this? Raise a round, book a demo, trust a new category, choose you over the incumbent?",
      "Once the outcome is clear, the look follows from it, and every design decision has something to be measured against other than taste.",
      "If you're a founder writing a brief, start there. A good designer will take care of 'modern and clean'.",
    ],
  },
];
