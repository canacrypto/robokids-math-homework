/* School Math 4A · Unit 1 · Session 1 · Numbers to One Million
   BC Mathematics 5: number concepts to 1 000 000, place value.
   Each homework item has three twins:
     A = homework · B = next session's opening quiz · C = retry practice (new numbers)
   "hard: true" marks the item whose B twin goes into quiz question 4. */
MathKit.bank("L4A_1_1", {
  program: "School Math 4A", session: 1, unit: "Unit 1 · Number",
  title: "Numbers to One Million",

  /* Grade 4 bridge items: used for Session 1's opening quiz (no previous homework yet). */
  bridge: [
    { id: "R1", skill: "Value of a digit (Grade 4)",
      q: "What is the value of the digit 7 in 4 728?", ans: 700,
      hint: "Name the place the 7 is in: thousands, hundreds, tens or ones?",
      explain: "4 728 = 4 000 + 700 + 20 + 8. The 7 is in the hundreds place, so its value is 700." },
    { id: "R2", skill: "Expanded to standard (Grade 4)",
      q: "Write 6 000 + 300 + 5 as a number.", ans: 6305,
      hint: "Which place has nothing? Put a 0 there.",
      explain: "6 thousands, 3 hundreds, 0 tens, 5 ones → 6 305. The 0 holds the tens place." },
    { id: "R3", skill: "Comparing (Grade 4)",
      q: "Which number is the greatest?", options: ["8 099", "8 909", "8 990", "8 919"], ans: 2,
      explain: "All four have 8 thousands. Compare hundreds: 8 909, 8 990 and 8 919 have 9 hundreds. Then compare tens: 9 tens beats 0 tens and 1 ten, so 8 990 is greatest." },
    { id: "R4", skill: "Rounding (Grade 4)",
      q: "Round 3 462 to the nearest hundred.", ans: 3500,
      hint: "Is 3 462 closer to 3 400 or to 3 500? Look at the tens digit.",
      explain: "3 462 is between 3 400 and 3 500. The tens digit is 6 (5 or more), so round up to 3 500." },
    { id: "R5", skill: "1 000 more (Grade 4)",
      q: "What number is 1 000 more than 9 450?", ans: 10450,
      hint: "9 thousands + 1 thousand = 10 thousands.",
      explain: "9 450 + 1 000 = 10 450. Nine thousands plus one more thousand makes ten thousands, so the number gets a new digit on the left." }
  ],

  items: [
    { id: "H1", skill: "Value of a digit",
      hint: "Count places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.",
      A: { q: "What is the value of the digit 6 in 364 215?", ans: 60000,
           explain: "In 364 215 the 6 is in the ten thousands place. Its value is 6 × 10 000 = 60 000." },
      B: { q: "What is the value of the digit 4 in 248 731?", ans: 40000,
           explain: "In 248 731 the 4 is in the ten thousands place. Its value is 4 × 10 000 = 40 000." },
      C: { q: "What is the value of the digit 5 in 52 310?", ans: 50000,
           explain: "In 52 310 the 5 is in the ten thousands place. Its value is 5 × 10 000 = 50 000." } },

    { id: "H2", skill: "Name the place",
      hint: "The ten thousands place is the 5th place from the right.",
      A: { q: "Which digit is in the ten thousands place in 815 307?", options: ["8", "1", "5", "3"], ans: 1,
           explain: "8 | 1 | 5 | 3 0 7: hundred thousands = 8, ten thousands = 1, thousands = 5." },
      B: { q: "Which digit is in the ten thousands place in 492 063?", options: ["4", "2", "9", "0"], ans: 2,
           explain: "4 | 9 | 2 | 0 6 3: hundred thousands = 4, ten thousands = 9, thousands = 2." },
      C: { q: "Which digit is in the ten thousands place in 36 418?", options: ["3", "6", "4", "1"], ans: 0,
           explain: "36 418 has only five digits, so the first digit, 3, is in the ten thousands place." } },

    { id: "H3", skill: "Words → standard form",
      hint: "Write the part before the word \"thousand\" first. Then write the last three digits, using 0s for empty places.",
      A: { q: "Write in standard form: two hundred fifty thousand eight hundred", ans: 250800,
           explain: "two hundred fifty thousand → 250 | eight hundred → 800. Together: 250 800." },
      B: { q: "Write in standard form: four hundred seven thousand thirty", ans: 407030,
           explain: "four hundred seven thousand → 407 | thirty → 030 (0 hundreds, 3 tens, 0 ones). Together: 407 030." },
      C: { q: "Write in standard form: sixty thousand five hundred", ans: 60500,
           explain: "sixty thousand → 60 | five hundred → 500. Together: 60 500." } },

    { id: "H4", skill: "Expanded → standard form",
      hint: "Draw a place-value chart. Any place that isn't in the sum gets a 0.",
      A: { q: "Write as a number: 300 000 + 40 000 + 2 000 + 600 + 5", ans: 342605,
           explain: "3 hundred thousands, 4 ten thousands, 2 thousands, 6 hundreds, 0 tens, 5 ones → 342 605." },
      B: { q: "Write as a number: 700 000 + 5 000 + 80 + 1", ans: 705081,
           explain: "7 hundred thousands, 0 ten thousands, 5 thousands, 0 hundreds, 8 tens, 1 one → 705 081." },
      C: { q: "Write as a number: 90 000 + 4 000 + 300", ans: 94300,
           explain: "9 ten thousands, 4 thousands, 3 hundreds, 0 tens, 0 ones → 94 300." } },

    { id: "H5", skill: "Standard form → words",
      hint: "Read the first group of three digits, say \"thousand\", then read the last group of three.",
      A: { q: "Which shows 604 090 in words?",
           options: ["six hundred forty thousand ninety", "six hundred four thousand ninety", "sixty-four thousand ninety", "six hundred four thousand nine hundred"], ans: 1,
           explain: "604 090 → \"604\" thousand + \"090\" → six hundred four thousand ninety." },
      B: { q: "Which shows 380 015 in words?",
           options: ["three hundred eighty thousand fifteen", "three hundred eight thousand fifteen", "three hundred eighty thousand one hundred fifty", "thirty-eight thousand fifteen"], ans: 0,
           explain: "380 015 → \"380\" thousand + \"015\" → three hundred eighty thousand fifteen." },
      C: { q: "Which shows 70 400 in words?",
           options: ["seven thousand four hundred", "seventy thousand forty", "seventy thousand four hundred", "seven hundred four thousand"], ans: 2,
           explain: "70 400 → \"70\" thousand + \"400\" → seventy thousand four hundred." } },

    { id: "H6", skill: "10 000 more (regrouping)", hard: true,
      hint: "Only the ten thousands digit changes, unless it's a 9! Then 10 ten thousands make 1 hundred thousand.",
      A: { q: "What number is 10 000 more than 295 400?", ans: 305400,
           explain: "295 400 has 9 ten thousands. Adding 1 more makes 10 ten thousands = 1 hundred thousand. So 2 hundred thousands become 3, and the ten thousands digit becomes 0: 305 400." },
      B: { q: "What number is 10 000 more than 693 120?", ans: 703120,
           explain: "693 120 has 9 ten thousands. 9 + 1 = 10 ten thousands = 1 hundred thousand, so 6 hundred thousands become 7 and the ten thousands digit becomes 0: 703 120." },
      C: { q: "What number is 10 000 more than 125 000?", ans: 135000,
           explain: "The ten thousands digit goes from 2 to 3: 125 000 → 135 000." } },

    { id: "H7", skill: "How many groups?",
      hint: "Cover up the places smaller than the group you're counting. The digits left over tell you how many groups.",
      A: { q: "How many ten thousands are in 300 000?", ans: 30,
           explain: "Cover the last four places of 300 000 and you see 30. So 300 000 = 30 × 10 000." },
      B: { q: "How many thousands are in 450 000?", ans: 450,
           explain: "Cover the last three places of 450 000 and you see 450. So 450 000 = 450 × 1 000." },
      C: { q: "How many hundred thousands are in 600 000?", ans: 6,
           explain: "600 000 = 6 × 100 000." } },

    { id: "H8", skill: "Each place is 10 times bigger",
      hint: "Write the value of each digit first, then compare the two values.",
      A: { q: "In 770 000, the value of the first 7 is how many times the value of the second 7?", ans: 10,
           explain: "The first 7 is worth 700 000 and the second is worth 70 000. 700 000 = 10 × 70 000. One place to the left is 10 times bigger." },
      B: { q: "In 505 000, the value of the first 5 is how many times the value of the second 5?", ans: 100,
           explain: "The first 5 is worth 500 000 and the second is worth 5 000. They're two places apart, so 10 × 10 = 100 times bigger." },
      C: { q: "In 330 000, the value of the first 3 is how many times the value of the second 3?", ans: 10,
           explain: "300 000 = 10 × 30 000. Neighbouring places are 10 times apart." } },

    { id: "H9", skill: "Build the greatest / smallest number",
      hint: "Greatest: put the biggest digit in the biggest place. Smallest: smallest digit first, but a number can't start with 0!",
      A: { q: "Use each digit once: 1, 3, 4, 6, 8, 0. What is the greatest six-digit number you can make?", ans: 864310,
           explain: "Put the digits from greatest to least: 8, 6, 4, 3, 1, 0 → 864 310." },
      B: { q: "Use each digit once: 2, 0, 5, 9, 7, 1. What is the smallest six-digit number you can make?", ans: 102579,
           explain: "Smallest first would be 0, but a six-digit number can't start with 0. So start with 1, then 0, 2, 5, 7, 9 → 102 579." },
      C: { q: "Use each digit once: 4, 1, 7, 3, 2, 8. What is the greatest six-digit number you can make?", ans: 874321,
           explain: "Greatest to least: 8, 7, 4, 3, 2, 1 → 874 321." } },

    { id: "H10", skill: "Counting past a big boundary",
      hint: "Count on to the next round number first, then add what's left.",
      A: { q: "A car's odometer reads 199 997 km. After driving 5 more km, what does it read?", ans: 200002,
           explain: "199 997 + 3 = 200 000. Then 2 more km → 200 002." },
      B: { q: "A step counter shows 89 995 steps. After 7 more steps, what does it show?", ans: 90002,
           explain: "89 995 + 5 = 90 000. Then 2 more steps → 90 002." },
      C: { q: "A website has 9 998 visits. Then 4 more people visit. How many visits now?", ans: 10002,
           explain: "9 998 + 2 = 10 000. Then 2 more → 10 002." } }
  ]
});

/* Session 1 opening quiz: Grade 4 bridge review (there's no earlier homework yet). */
MathKit.quiz("Q4A_1_1", {
  program: "School Math 4A", session: 1, title: "Warm-up: Numbers to 10 000", minutes: 10,
  intro: "A quick check of the Grade 4 number skills we'll build on today.",
  items: [
    { from: "L4A_1_1", id: "R1", tag: "Grade 4 review" },
    { from: "L4A_1_1", id: "R2", tag: "Grade 4 review" },
    { from: "L4A_1_1", id: "R3", tag: "Grade 4 review" },
    { from: "L4A_1_1", id: "R4", tag: "Grade 4 review" },
    { from: "L4A_1_1", id: "R5", tag: "Grade 4 review" }
  ]
});
