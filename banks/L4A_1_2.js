/* School Math 4A · Unit 1 · Session 2 · Compare, Order & Round
   BC Mathematics 5: comparing and ordering numbers to 1 000 000, estimating.
   A = homework · B = next session's opening quiz · C = retry practice. */
MathKit.bank("L4A_1_2", {
  program: "School Math 4A", session: 2, unit: "Unit 1 · Number",
  title: "Compare, Order & Round Big Numbers",
  items: [
    { id: "H1", skill: "Compare with < > =",
      hint: "Line the numbers up and compare place by place from the left. Stop at the first digit that's different.",
      A: { q: "Which symbol makes this true?   503 218 ___ 530 128", options: [">", "<", "="], ans: 1,
           explain: "Both have 5 hundred thousands. Ten thousands: 0 < 3, so 503 218 < 530 128." },
      B: { q: "Which symbol makes this true?   712 450 ___ 712 405", options: [">", "<", "="], ans: 0,
           explain: "The first difference is in the tens place: 5 tens > 0 tens, so 712 450 > 712 405." },
      C: { q: "Which symbol makes this true?   88 120 ___ 81 920", options: [">", "<", "="], ans: 0,
           explain: "Thousands: 8 > 1, so 88 120 > 81 920." } },

    { id: "H2", skill: "Greatest / least",
      hint: "Compare the biggest places first. Only look further right if those digits are the same.",
      A: { q: "Which number is the greatest?", options: ["409 999", "410 001", "401 100", "399 999"], ans: 1,
           explain: "Three numbers have 4 hundred thousands. Ten thousands: 410 001 has 1, the others have 0, so 410 001 is greatest." },
      B: { q: "Which number is the least?", options: ["250 300", "205 300", "253 000", "205 030"], ans: 3,
           explain: "205 300 and 205 030 have the fewest ten thousands (0). Hundreds: 0 < 3, so 205 030 is least." },
      C: { q: "Which number is the greatest?", options: ["76 540", "76 405", "67 540", "76 450"], ans: 0,
           explain: "76 540, 76 405 and 76 450 tie up to the thousands. Hundreds: 5 is biggest, and 76 540 beats 76 450 in the hundreds." } },

    { id: "H3", skill: "Order numbers",
      hint: "Find the least number first, then the next, then the greatest.",
      A: { q: "Which list is in order from least to greatest?",
           options: ["345 120, 345 210, 354 012", "354 012, 345 210, 345 120", "345 210, 345 120, 354 012", "345 120, 354 012, 345 210"], ans: 0,
           explain: "354 012 has the most ten thousands, so it's greatest. 345 120 vs 345 210: hundreds 1 < 2. Order: 345 120, 345 210, 354 012." },
      B: { q: "Which list is in order from least to greatest?",
           options: ["608 900, 608 090, 690 800", "690 800, 608 900, 608 090", "608 090, 608 900, 690 800", "608 090, 690 800, 608 900"], ans: 2,
           explain: "690 800 has 9 ten thousands, so it's greatest. 608 090 vs 608 900: hundreds 0 < 9. Order: 608 090, 608 900, 690 800." },
      C: { q: "Which list is in order from least to greatest?",
           options: ["41 700, 40 170, 47 100", "40 170, 41 700, 47 100", "47 100, 41 700, 40 170", "40 170, 47 100, 41 700"], ans: 1,
           explain: "Thousands: 0 < 1 < 7. Order: 40 170, 41 700, 47 100." } },

    { id: "H4", skill: "Round to the nearest 1 000",
      hint: "Look at the hundreds digit. 0–4: round down. 5–9: round up.",
      A: { q: "Round 562 418 to the nearest thousand.", ans: 562000,
           explain: "562 418 is between 562 000 and 563 000. The hundreds digit is 4, so round down: 562 000." },
      B: { q: "Round 238 765 to the nearest thousand.", ans: 239000,
           explain: "238 765 is between 238 000 and 239 000. The hundreds digit is 7, so round up: 239 000." },
      C: { q: "Round 41 520 to the nearest thousand.", ans: 42000,
           explain: "41 520 is between 41 000 and 42 000. The hundreds digit is 5, so round up: 42 000." } },

    { id: "H5", skill: "Round to the nearest 10 000",
      hint: "Look at the thousands digit. 0–4: round down. 5–9: round up.",
      A: { q: "Round 562 418 to the nearest ten thousand.", ans: 560000,
           explain: "562 418 is between 560 000 and 570 000. The thousands digit is 2, so round down: 560 000." },
      B: { q: "Round 735 210 to the nearest ten thousand.", ans: 740000,
           explain: "735 210 is between 730 000 and 740 000. The thousands digit is 5, so round up: 740 000." },
      C: { q: "Round 84 999 to the nearest ten thousand.", ans: 80000,
           explain: "84 999 is between 80 000 and 90 000. The thousands digit is 4, so round down: 80 000, even though the digits after it are all 9s." } },

    { id: "H6", skill: "Round to the nearest 100 000", hard: true,
      hint: "Look ONLY at the ten thousands digit. The digits after it don't matter!",
      A: { q: "Round 649 999 to the nearest hundred thousand.", ans: 600000,
           explain: "The ten thousands digit is 4, so round down to 600 000. The 9s after it don't push it up." },
      B: { q: "Round 350 000 to the nearest hundred thousand.", ans: 400000,
           explain: "350 000 is exactly halfway between 300 000 and 400 000. The ten thousands digit is 5, so round up: 400 000." },
      C: { q: "Round 251 000 to the nearest hundred thousand.", ans: 300000,
           explain: "The ten thousands digit is 5, so round up to 300 000." } },

    { id: "H7", skill: "Estimate a sum by rounding",
      hint: "Round each number first, then add the rounded numbers.",
      A: { q: "Estimate 398 500 + 201 700 by rounding each number to the nearest hundred thousand first.", ans: 600000,
           explain: "398 500 ≈ 400 000 and 201 700 ≈ 200 000. 400 000 + 200 000 = 600 000." },
      B: { q: "Estimate 512 300 + 289 900 by rounding each number to the nearest hundred thousand first.", ans: 800000,
           explain: "512 300 ≈ 500 000 and 289 900 ≈ 300 000. 500 000 + 300 000 = 800 000." },
      C: { q: "Estimate 199 000 + 302 000 by rounding each number to the nearest hundred thousand first.", ans: 500000,
           explain: "199 000 ≈ 200 000 and 302 000 ≈ 300 000. 200 000 + 300 000 = 500 000." } },

    { id: "H8", skill: "Rounding backwards", hard: false,
      hint: "Find the halfway points on each side. Which numbers round to this value?",
      A: { q: "What is the greatest whole number that rounds to 70 000 when rounded to the nearest ten thousand?", ans: 74999,
           explain: "Numbers from 65 000 to 74 999 round to 70 000. At 75 000 you reach halfway and round up to 80 000. So the greatest is 74 999." },
      B: { q: "What is the smallest whole number that rounds to 300 000 when rounded to the nearest hundred thousand?", ans: 250000,
           explain: "Halfway between 200 000 and 300 000 is 250 000, and halfway rounds up. So 250 000 is the smallest number that rounds to 300 000." },
      C: { q: "What is the greatest whole number that rounds to 500 when rounded to the nearest hundred?", ans: 549,
           explain: "Numbers from 450 to 549 round to 500. 550 rounds up to 600, so the greatest is 549." } },

    { id: "H9", skill: "Missing digit",
      hint: "Which digit decides the rounding? Try each possible digit in that place.",
      A: { q: "47■ 215 rounds to 480 000 (nearest ten thousand). What is the smallest digit that could go in the ■?", ans: 5,
           explain: "The ■ is the thousands digit, and it decides the rounding. To round 47■ 215 up to 480 000 it must be 5 or more. The smallest is 5." },
      B: { q: "63■ 900 rounds to 630 000 (nearest ten thousand). What is the greatest digit that could go in the ■?", ans: 4,
           explain: "The ■ is the thousands digit. To round down to 630 000 it must be 4 or less. The greatest is 4." },
      C: { q: "2■8 rounds to 200 (nearest hundred). What is the greatest digit that could go in the ■?", ans: 4,
           explain: "The ■ is the tens digit. To round down to 200 it must be 4 or less, so 248 is the biggest that works." } },

    { id: "H10", skill: "Word problem: add, then round",
      hint: "Add the two numbers exactly first. Then round the total.",
      A: { q: "A music festival had 128 450 fans on Friday and 131 200 fans on Saturday. Find the total, then round it to the nearest ten thousand.", ans: 260000,
           explain: "128 450 + 131 200 = 259 650. The thousands digit is 9, so round up: 260 000." },
      B: { q: "A library lent 214 300 books last year and 187 900 books this year. Find the total, then round it to the nearest ten thousand.", ans: 400000,
           explain: "214 300 + 187 900 = 402 200. The thousands digit is 2, so round down: 400 000." },
      C: { q: "A town recycled 45 600 cans in May and 38 900 cans in June. Find the total, then round it to the nearest ten thousand.", ans: 80000,
           explain: "45 600 + 38 900 = 84 500. The thousands digit is 4, so round down: 80 000." } },

    { id: "H11", skill: "Compare tricky pairs",
      hint: "Count the digits first. If they're equal, compare from the left.",
      A: { q: "Which symbol makes this true?   99 999 ___ 100 000", options: [">", "<", "="], ans: 1,
           explain: "99 999 has five digits and 100 000 has six, so 99 999 < 100 000. Big digits don't beat an extra place." },
      B: { q: "Which symbol makes this true?   640 000 ___ 64 000", options: [">", "<", "="], ans: 0,
           explain: "640 000 has six digits and 64 000 has five: 640 000 > 64 000." },
      C: { q: "Which symbol makes this true?   300 000 + 30 000 ___ 330 000", options: [">", "<", "="], ans: 2,
           explain: "300 000 + 30 000 = 330 000, so the two sides are equal." } },

    { id: "H12", skill: "Order greatest to least",
      hint: "Find the greatest first, then the next greatest.",
      A: { q: "Which list is in order from greatest to least?",
           options: ["249 000, 240 900, 92 400", "92 400, 240 900, 249 000", "240 900, 249 000, 92 400", "249 000, 92 400, 240 900"], ans: 0,
           explain: "92 400 has only five digits, so it's least. 249 000 vs 240 900: thousands 9 > 0. Order: 249 000, 240 900, 92 400." },
      B: { q: "Which list is in order from greatest to least?",
           options: ["503 300, 530 030, 503 030", "530 030, 503 030, 503 300", "530 030, 503 300, 503 030", "503 030, 503 300, 530 030"], ans: 2,
           explain: "530 030 has 3 ten thousands, so it's greatest. 503 300 vs 503 030: hundreds 3 > 0. Order: 530 030, 503 300, 503 030." },
      C: { q: "Which list is in order from greatest to least?",
           options: ["70 800, 78 000, 7 800", "78 000, 70 800, 7 800", "7 800, 70 800, 78 000", "78 000, 7 800, 70 800"], ans: 1,
           explain: "7 800 has four digits, so it's least. 78 000 vs 70 800: thousands 8 > 0. Order: 78 000, 70 800, 7 800." } },

    { id: "H13", skill: "Round to the nearest 100",
      hint: "Look at the tens digit. 0–4: round down. 5–9: round up.",
      A: { q: "Round 452 386 to the nearest hundred.", ans: 452400, explain: "Between 452 300 and 452 400. The tens digit is 8, so round up: 452 400." },
      B: { q: "Round 708 950 to the nearest hundred.", ans: 709000, explain: "Between 708 900 and 709 000. The tens digit is 5, so round up. 9 hundreds + 1 = 10 hundreds, so the answer is 709 000." },
      C: { q: "Round 3 249 to the nearest hundred.", ans: 3200, explain: "Between 3 200 and 3 300. The tens digit is 4, so round down: 3 200." } },

    { id: "H14", skill: "Rounding that rolls over",
      hint: "If the digit you round up is a 9, it becomes 0 and the place to its left goes up by 1.",
      A: { q: "Round 996 400 to the nearest ten thousand.", ans: 1000000, explain: "Between 990 000 and 1 000 000. The thousands digit is 6, so round up: 99 ten thousands + 1 = 100 ten thousands = 1 000 000." },
      B: { q: "Round 497 600 to the nearest ten thousand.", ans: 500000, explain: "Between 490 000 and 500 000. The thousands digit is 7, so round up to 500 000." },
      C: { q: "Round 39 800 to the nearest ten thousand.", ans: 40000, explain: "Between 30 000 and 40 000. The thousands digit is 9, so round up to 40 000." } },

    { id: "H15", skill: "Round two ways",
      hint: "Round each option one way, cross out the ones that don't fit, then check the other way.",
      A: { q: "Which number rounds to 350 000 (nearest ten thousand) AND to 300 000 (nearest hundred thousand)?",
           options: ["345 600", "355 100", "351 000", "344 900"], ans: 0,
           explain: "345 600 → 350 000 and → 300 000 ✓. 355 100 → 360 000. 351 000 → 350 000 but → 400 000. 344 900 → 340 000." },
      B: { q: "Which number rounds to 560 000 (nearest ten thousand) AND to 600 000 (nearest hundred thousand)?",
           options: ["566 000", "548 000", "556 200", "654 000"], ans: 2,
           explain: "556 200 → 560 000 and → 600 000 ✓. 566 000 → 570 000. 548 000 → 550 000. 654 000 → 650 000." },
      C: { q: "Which number rounds to 8 000 (nearest thousand)?",
           options: ["7 650", "8 600", "7 400", "8 510"], ans: 0,
           explain: "7 650 → 8 000 ✓ (hundreds digit 6 rounds up). 8 600 and 8 510 → 9 000. 7 400 → 7 000." } },

    { id: "H16", skill: "Estimate a difference",
      hint: "Round each number first, then subtract the rounded numbers.",
      A: { q: "Estimate 812 400 − 389 700 by rounding each number to the nearest hundred thousand first.", ans: 400000, explain: "812 400 ≈ 800 000 and 389 700 ≈ 400 000. 800 000 − 400 000 = 400 000." },
      B: { q: "Estimate 703 900 − 248 100 by rounding each number to the nearest hundred thousand first.", ans: 500000, explain: "703 900 ≈ 700 000 and 248 100 ≈ 200 000. 700 000 − 200 000 = 500 000." },
      C: { q: "Estimate 61 000 − 29 000 by rounding each number to the nearest ten thousand first.", ans: 30000, explain: "61 000 ≈ 60 000 and 29 000 ≈ 30 000. 60 000 − 30 000 = 30 000." } },

    { id: "H17", skill: "How many numbers round to it?",
      hint: "Find the smallest and the greatest number that round to it, then count from one to the other.",
      A: { q: "How many whole numbers round to 40 when rounded to the nearest ten?", ans: 10, explain: "35, 36, 37 … 44 all round to 40. That's 10 numbers (45 rounds up to 50)." },
      B: { q: "How many whole numbers round to 500 when rounded to the nearest hundred?", ans: 100, explain: "450 to 549 all round to 500. That's 100 numbers." },
      C: { q: "How many whole numbers round to 20 000 when rounded to the nearest thousand?", ans: 1000, explain: "19 500 to 20 499 all round to 20 000. That's 1 000 numbers." } },

    { id: "H18", skill: "Compare, then find the difference",
      hint: "Line the numbers up. Only a few places are different, so subtract carefully.",
      A: { q: "Store A sold 245 380 games and Store B sold 245 830. How many more games did the store with more sales sell?", ans: 450, explain: "245 830 > 245 380. 245 830 − 245 380 = 450." },
      B: { q: "A town counted 108 260 birds in spring and 108 620 in fall. How many more birds were counted in fall?", ans: 360, explain: "108 620 − 108 260 = 360." },
      C: { q: "One lake holds 31 750 fish and another holds 31 570. How many more fish does the bigger lake hold?", ans: 180, explain: "31 750 − 31 570 = 180." } },

    { id: "H19", skill: "Missing digit to compare",
      hint: "Find the first place where the numbers could be different. Try each digit there.",
      A: { q: "What is the smallest digit that makes this true?   5■4 300 > 584 300", ans: 9, explain: "The ■ is in the ten thousands place. 584 300 would be equal, so ■ must be more than 8: the only choice is 9." },
      B: { q: "What is the greatest digit that makes this true?   72■ 500 < 726 000", ans: 5, explain: "The ■ is the thousands digit. 725 500 < 726 000 ✓ but 726 500 > 726 000, so the greatest is 5." },
      C: { q: "What is the smallest digit that makes this true?   4■ 000 > 45 000", ans: 6, explain: "45 000 would be equal, so ■ must be more than 5. The smallest is 6." } },

    { id: "H20", skill: "Word problem: round, then add",
      hint: "Round each number first, then add the rounded numbers.",
      A: { q: "A stadium sold 48 730 tickets on Saturday and 51 290 on Sunday. Round each to the nearest thousand, then add to estimate the total.", ans: 100000,
           explain: "48 730 ≈ 49 000 and 51 290 ≈ 51 000. 49 000 + 51 000 = 100 000." },
      B: { q: "One book has 129 480 words and another has 70 610. Round each to the nearest ten thousand, then add to estimate the total.", ans: 200000,
           explain: "129 480 ≈ 130 000 and 70 610 ≈ 70 000. 130 000 + 70 000 = 200 000." },
      C: { q: "A school collected 3 420 cans in May and 4 680 in June. Round each to the nearest hundred, then add to estimate the total.", ans: 8100,
           explain: "3 420 ≈ 3 400 and 4 680 ≈ 4 700. 3 400 + 4 700 = 8 100." } }
  ]
});

/* Session 2 opening quiz: B twins of Session 1 homework.
   Q1–3 review · Q4 = twin of the item flagged hard · Q5 = spaced review. */
MathKit.quiz("Q4A_1_2", {
  program: "School Math 4A", session: 2, title: "Review: Numbers to One Million", minutes: 10,
  intro: "These are like your Session 1 homework questions, with new numbers.",
  items: [
    { from: "L4A_1_1", id: "H1", v: "B", tag: "Homework review" },
    { from: "L4A_1_1", id: "H3", v: "B", tag: "Homework review" },
    { from: "L4A_1_1", id: "H4", v: "B", tag: "Homework review" },
    { from: "L4A_1_1", id: "H6", v: "B", tag: "Hardest homework skill" },
    { from: "L4A_1_1", id: "H9", v: "B", tag: "Spaced review" }
  ]
});

/* Session 3 opening quiz (ready for when you build Session 3): B twins of Session 2 homework. */
MathKit.quiz("Q4A_1_3", {
  program: "School Math 4A", session: 3, title: "Review: Compare, Order & Round", minutes: 10,
  intro: "These are like your Session 2 homework questions, with new numbers.",
  items: [
    { from: "L4A_1_2", id: "H1", v: "B", tag: "Homework review" },
    { from: "L4A_1_2", id: "H4", v: "B", tag: "Homework review" },
    { from: "L4A_1_2", id: "H5", v: "B", tag: "Homework review" },
    { from: "L4A_1_2", id: "H6", v: "B", tag: "Hardest homework skill" },
    { from: "L4A_1_1", id: "H3", v: "C", tag: "Spaced review" }
  ]
});
