// Learn tab content: one method card per question type, plus exam strategy.
window.LESSONS = [
{
  id:"strategy", title:"Exam strategy", t:null,
  idea:"Section 1 is 42 questions in 60 minutes. That's about 85 seconds each. The marks come from not getting stuck, not from cracking the hardest question.",
  example:"Think of a penalty shoot-out. Five decent kicks beat one spectacular kick and four misses.",
  steps:[
    "Read the actual question line first (\"Which must be true?\", \"How many...?\"), then the passage.",
    "Give each question about 85 seconds. At 2 minutes, pick your best guess, flag it and move on.",
    "There's no negative marking. Never leave a question blank.",
    "Cross out options you've ruled out. Two left is a 50:50, not a 25% guess.",
    "Do a second pass on flagged questions only if time is left."
  ],
  traps:["Spending 5 minutes on one question and rushing the last 10.","Answering what you THINK the question asks instead of what it says."]
},
{
  id:"logic", title:"Deduction", t:"logic",
  idea:"You're given some rules and asked what MUST follow. Only what is forced counts. Something that could be true, or is probably true, is wrong.",
  example:"\"Every county player trains on Tuesdays\" tells you a county player trains Tuesday. It does NOT tell you everyone at Tuesday training is a county player.",
  steps:[
    "Write each rule as an arrow: \"If rain then indoors\" becomes Rain → Indoors.",
    "Valid moves: if the left side happens, the right side happens. If the right side does NOT happen, the left side didn't either (flip and negate).",
    "Invalid moves: right side happened, so left side did (affirming the consequent). Left side didn't happen, so right side didn't (denying the antecedent).",
    "For orderings and seating, draw a line or grid. Place the fixed facts first, then pairs that move together.",
    "For truth-teller puzzles, assume one person is truthful and look for a contradiction. Then try the next."
  ],
  traps:["\"Some\" means at least one. It can't become \"all\".","\"Necessary\" (must have) is not \"sufficient\" (enough on its own).","Options that are possible but not certain."]
},
{
  id:"data", title:"Data & tables", t:"data",
  idea:"The maths is easy. The marks are lost by using the wrong number from the table or the wrong base for a percentage.",
  example:"A team goes from 8 wins to 10 wins. That's 2 more wins, a 25% increase (2 ÷ 8), not 20% (2 ÷ 10).",
  steps:[
    "Read the question first, then find only the rows and columns it needs.",
    "Check the units and labels: per hour or per minute? Thousands? Inclusive range?",
    "Percentage change = change ÷ ORIGINAL × 100.",
    "Overall rates: add up the totals, then divide. Don't average the percentages.",
    "Estimate before you calculate, so you can spot an answer that's way off."
  ],
  traps:["Percentage points vs percent.","A rise then a fall of the same % doesn't cancel out.","Averaging rates across groups of different sizes."]
},
{
  id:"number", title:"Number problems", t:"number",
  idea:"Word problems turn into one or two simple sums once you name the unknown. Often the fastest route is to test the answer options.",
  example:"\"In 4 years Seán will be twice as old as 6 years ago.\" Try each option: 16 works because 20 is twice 10.",
  steps:[
    "Name the unknown (let x = ...) and write each sentence as a sum.",
    "Turn averages into totals: average × count.",
    "Rates: find the rate for one person for one hour, then scale up.",
    "Worst-case questions (\"to be certain\"): imagine the unluckiest possible draw.",
    "If the algebra stalls, plug the options in. Start with a middle one."
  ],
  traps:["Average speed isn't the average of two speeds.","\"Without replacement\" changes the second probability.","Counting things twice (handshakes, \"divisible by 3 or 5\")."]
},
{
  id:"argument", title:"Arguments", t:"argument",
  idea:"Every argument is reasons leading to a conclusion. Find the conclusion first, then ask what would make the jump from reasons to conclusion stronger, weaker or possible.",
  example:"\"Every top golfer practises putting daily, so practising putting daily makes you a top golfer.\" The jump ignores that top golfers might practise because they're already serious about it.",
  steps:[
    "Find the conclusion: the claim the rest is there to support. Look for \"so\", \"therefore\", \"should\".",
    "Assumption: the unstated link that must be true. Test it by negating it. If the argument collapses, it's the assumption.",
    "Weaken: give another cause, or show the evidence doesn't connect to the conclusion.",
    "Strengthen: rule out other causes. A fair comparison or random trial is gold.",
    "Best supported conclusion: the cautious one that stays inside the evidence."
  ],
  traps:["Correlation treated as cause.","Strong words: always, all, never, proves, should.","Options that are true but don't affect the argument."]
}
];
