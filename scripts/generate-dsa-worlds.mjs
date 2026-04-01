/**
 * Generates src/data/dsa/challenges.generated.ts with 200+ JavaScript coding challenges.
 * Run: node scripts/generate-dsa-worlds.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '../src/data/dsa/challenges.generated.ts');

const WORLD_META = [
  { id: 'dsa-w00-big-o', name: 'Big-O & loops', subtitle: 'Count steps, think in orders', icon: '📈', color: '#6C5CE7', description: 'Warm up your complexity vocabulary before the storm of interviews.', learningArc: 'From constant-time checks to recognizing hidden quadratics—this arc is your gym for asymptotic thinking.' },
  { id: 'dsa-w01-arrays-scan', name: 'Array scanning', subtitle: 'One pass, many wins', icon: '🔭', color: '#00CEC9', description: 'Linear sweeps: mins, maxes, prefixes, and the art of not looking twice.', learningArc: 'Build intuition for when a single left-to-right pass is enough—and when it is not.' },
  { id: 'dsa-w02-two-pointers', name: 'Two pointers', subtitle: 'Meet in the middle', icon: '↔️', color: '#FD79A8', description: 'Sorted arrays and palindromes love two indices moving toward truth.', learningArc: 'Shrink the search space monotonically; prove why pointers never need to backtrack.' },
  { id: 'dsa-w03-sliding-window', name: 'Sliding window & prefix', subtitle: 'Subarrays with style', icon: '🪟', color: '#FDCB6E', description: 'Fixed and variable windows, prefix sums, and difference arrays.', learningArc: 'Turn “all subarrays” into incremental updates instead of recomputing from scratch.' },
  { id: 'dsa-w04-strings', name: 'String craft', subtitle: 'Characters, counts, patterns', icon: '🔤', color: '#A29BFE', description: 'Anagrams, palindromes, rolling hashes (conceptually), and encoding tricks.', learningArc: 'Treat strings as arrays with cultural expectations about Unicode and immutability.' },
  { id: 'dsa-w05-linked-structures', name: 'Linked structures', subtitle: 'Nodes & chains', icon: '⛓️', color: '#74B9FF', description: 'Singly linked lists as plain objects { val, next }—classic interview shape.', learningArc: 'Dummy heads, fast/slow pointers, and cycle lore without malloc stress.' },
  { id: 'dsa-w06-stack-queue', name: 'Stacks & queues', subtitle: 'LIFO meets FIFO', icon: '📚', color: '#55EFC4', description: 'Parentheses, monotonic stacks, BFS’s best friend the queue.', learningArc: 'Recognize last-in-first-out and first-in-first-out in disguise inside problems.' },
  { id: 'dsa-w07-hash', name: 'Hash maps & sets', subtitle: 'O(1) expectations', icon: '🗝️', color: '#E17055', description: 'Frequency tables, complements, deduping, and collision intuition.', learningArc: 'Trade memory for time; know when hashing beats sorting.' },
  { id: 'dsa-w08-binary-search', name: 'Binary search', subtitle: 'Halve the doubt', icon: '🎯', color: '#FAB1A0', description: 'Not just on arrays—on answer spaces (minimize max, capacity checks).', learningArc: 'Invariant: maintain a shrinking interval that still contains the answer.' },
  { id: 'dsa-w09-sorting', name: 'Sorting insights', subtitle: 'Order unlocks structure', icon: '📊', color: '#81ECEC', description: 'When sorting is the unlock; custom comparators; stability stories.', learningArc: 'n log n baseline; know when counting/radix sneaks in linear.' },
  { id: 'dsa-w10-recursion', name: 'Recursion & backtrack', subtitle: 'Call stacks as thought', icon: '🌀', color: '#DDA0DD', description: 'Base cases, tree of choices, pruning, and memoization foreshadowing.', learningArc: 'Draw the recursion tree before you code; bound branching factor.' },
  { id: 'dsa-w11-binary-trees', name: 'Binary trees', subtitle: 'DFS, BFS, height', icon: '🌳', color: '#2ECC71', description: 'Traversals, diameters, paths, and the joy of null-terminated children.', learningArc: 'Post-order for subtree info; level-order when breadth matters.' },
  { id: 'dsa-w12-bst-heap', name: 'BST & heaps', subtitle: 'Order + priority', icon: '⚖️', color: '#E67E22', description: 'BST property, k-th element vibes, heap mental model (array sim ok).', learningArc: 'BST search trees; heaps for “best next” streaming.' },
  { id: 'dsa-w13-graphs', name: 'Graphs', subtitle: 'Nodes, edges, traversals', icon: '🕸️', color: '#3498DB', description: 'Adjacency lists, BFS shortest path unweighted, DFS components.', learningArc: 'Color nodes visited; watch for directed vs undirected differences.' },
  { id: 'dsa-w14-dp', name: 'Dynamic programming', subtitle: 'Overlap → table', icon: '🧩', color: '#9B59B6', description: '1D DP, classic transitions, counting paths, coin change flavors.', learningArc: 'State = subproblem; transition = recurrence; base cases anchor induction.' },
  { id: 'dsa-w15-greedy-bit', name: 'Greedy, math, bits', subtitle: 'Local choices & encodings', icon: '⚡', color: '#1ABC9C', description: 'Interval scheduling vibes, XOR tricks, bitmask micro-patterns.', learningArc: 'Prove greedy stays ahead or exchange argument; bits for tight constraints.' },
];

const flavors = [
  'You are the “runtime intern” at QueryForge Labs—your job is to convince the CPU to do less work while still getting the right answer.',
  'Picture each array as a conveyor belt of sushi plates: you can only look at the current plate and decide what to remember in your tiny notepad.',
  'The evil hiring manager (friendly edition) hid a quadratic solution in your first draft—your mission is to spot it before they do.',
  'In the QueryForge arcade, every level is a ticket to a FAANG-style whiteboard—except the markers never dry out.',
  'You are training a robot that only understands loops and comparisons—make its instructions embarrassingly clear.',
  'Think like a compiler optimization pass: constant fold your assumptions, then strength-reduce the heavy loops.',
  'Data structures are just disciplined ways to cheat on brute force—today you earn the cheat sheet legally.',
  'Each challenge is a tiny boss fight: learn the pattern once, reuse the muscle memory in five future interviews.',
];

const dives = [
  'Arrays live in contiguous memory (conceptually). That locality is why scanning once is cache-friendly and why index arithmetic shows up everywhere in compiled code. When you derive a formula with a prefix sum, you are trading a linear preprocess for constant-time range queries—classic engineering tradeoff.',
  'Two pointers work when the input is sorted (or sortable) so that moving the left pointer can only worsen one side of a constraint while improving the other. Write the loop invariant on paper: what stays true every iteration?',
  'Hash maps give expected O(1) membership at the cost of memory and hashing semantics. In interviews, state your assumption: “I assume a good hash function with O(1) ops.” For coding, plain JS objects work for string/number keys.',
  'Recursion depth equals call stack usage; tail recursion is not optimized in JS engines generally—prefer iterative forms when depth can hit thousands.',
  'Binary trees are graphs with a hierarchy; many subtree problems post-order aggregate from children upward. Try the “return tuple” pattern: (valueForParent, sideEffect).',
  'Graph BFS on an unweighted graph explores layer by layer—first time you dequeue a node is shortest path distance from source. DFS explores deep first—great for connectivity and cycles with coloring.',
  'Dynamic programming is recursion with amnesia fixed: memoize overlapping subproblems. Start with brute recursion, identify parameters, build bottom-up table.',
  'Greedy algorithms choose the locally best option; they are only correct when local optimality implies global—if unsure, try counterexamples or DP.',
  'Bit tricks exploit two’s complement representation; XOR cancels duplicates, shifts multiply/divide by powers of two, and masks isolate subsets in tiny n.',
  'Sliding window maintains an invariant on a range [L,R] while both ends move forward—total work O(n) because each index enters and leaves once.',
];

function hints(...parts) {
  return parts.map((content, i) => ({
    tier: /** @type {const} */ (i + 1),
    cost: 0,
    headline: `Hint ${i + 1}`,
    content,
  }));
}

/** @param {number} gi global index */
function makeTests(gi, kind) {
  const a = (gi % 7) + 1;
  const b = (gi % 5) + 2;
  switch (kind) {
    case 'sum':
      return [
        { args: [[1, 2, 3, 4]], expected: 10 },
        { args: [[-1, 0, 1]], expected: 0 },
        { args: [[a]], expected: a },
      ];
    case 'max':
      return [
        { args: [[3, 1, 4, 1, 5]], expected: 5 },
        { args: [[-2, -9]], expected: -2 },
        { args: [[gi, gi + 1, gi - 1]], expected: Math.max(gi, gi + 1, gi - 1) },
      ];
    case 'min':
      return [
        { args: [[5, 3, 8]], expected: 3 },
        { args: [[0, 0, 1]], expected: 0 },
      ];
    case 'countPos':
      return [
        { args: [[1, -2, 3]], expected: 2 },
        { args: [[0, 0]], expected: 0 },
        { args: [[-1, -2, -3]], expected: 0 },
      ];
    case 'reverseWords':
      return [
        { args: [['hello world']], expected: 'world hello' },
        { args: [['  a  b ']], expected: 'b a' },
      ];
    case 'isPalindrome':
      return [
        { args: [['racecar']], expected: true },
        { args: [['forge']], expected: false },
        { args: [['']], expected: true },
      ];
    case 'twoSumSorted':
      return [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[1, 2, 3, 4, 5], 9], expected: [3, 4] },
      ];
    case 'hasDuplicate':
      return [
        { args: [[1, 2, 3]], expected: false },
        { args: [[1, 1, 2]], expected: true },
      ];
    case 'missingNumber':
      return [
        { args: [[0, 1, 3]], expected: 2 },
        { args: [[1, 2, 3]], expected: 0 },
      ];
    case 'maxSubarray':
      return [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[1]], expected: 1 },
        { args: [[-1]], expected: -1 },
      ];
    case 'climbStairs':
      return [
        { args: [3], expected: 3 },
        { args: [4], expected: 5 },
        { args: [5], expected: 8 },
      ];
    case 'fib':
      return [
        { args: [0], expected: 0 },
        { args: [1], expected: 1 },
        { args: [6], expected: 8 },
      ];
    case 'factorial':
      return [
        { args: [0], expected: 1 },
        { args: [5], expected: 120 },
      ];
    case 'gcd':
      return [
        { args: [12, 8], expected: 4 },
        { args: [7, 13], expected: 1 },
      ];
    case 'binarySearch':
      return [
        { args: [[1, 3, 5, 7, 9], 5], expected: 2 },
        { args: [[1, 3, 5], 2], expected: -1 },
      ];
    case 'rotateRight':
      return [
        { args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
        { args: [[1], 10], expected: [1] },
      ];
    case 'mergeSorted':
      return [
        { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
        { args: [[], [1]], expected: [1] },
      ];
    case 'validParentheses':
      return [
        { args: ['()[]{}'], expected: true },
        { args: ['(]'], expected: false },
        { args: [''], expected: true },
      ];
    case 'treeHeight':
      return [
        { args: [null], expected: 0 },
        { args: [{ val: 1, left: null, right: null }], expected: 1 },
        { args: [{ val: 1, left: { val: 2, left: null, right: null }, right: null }], expected: 2 },
      ];
    case 'listLen':
      return [
        { args: [null], expected: 0 },
        { args: [{ val: 1, next: { val: 2, next: null } }], expected: 2 },
      ];
    case 'graphNodes':
      return [
        { args: [{ 0: [1], 1: [0, 2], 2: [1] }], expected: 3 },
        { args: [{}], expected: 0 },
      ];
    case 'xorAll':
      return [
        { args: [[1, 2, 3]], expected: 0 },
        { args: [[4, 4, 5]], expected: 5 },
      ];
    case 'powerTwo':
      return [
        { args: [1], expected: true },
        { args: [16], expected: true },
        { args: [3], expected: false },
      ];
    case 'hammingWeight':
      return [
        { args: [11], expected: 3 },
        { args: [0], expected: 0 },
      ];
    default:
      return [{ args: [[1, 2, 3]], expected: 6 }];
  }
}

const PROBLEM_BUILDERS = [
  (gi, w) => ({
    title: `Running total (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Given an array of integers \`nums\`, return the **sum** of all elements.\n\nConstraints: use a single pass; treat empty sum as 0.`,
    starter: `function solve(nums) {\n  // nums: number[]\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'sum'),
    hintBodies: [
      'Initialize an accumulator to 0, add each nums[i].',
      'Edge: nums.length === 0 → return 0.',
      'Full solution: let s=0; for (const x of nums) s+=x; return s;',
    ],
    kind: 'sum',
  }),
  (gi, w) => ({
    title: `Peak finder #${gi + 1}`,
    difficulty: 'Easy',
    problem: `Return the **maximum** element in \`nums\`. If empty, return \`null\` in JS (use null).`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: [
      { args: [[3, 1, 4]], expected: 4 },
      { args: [[-5, -2, -9]], expected: -2 },
      { args: [[]], expected: null },
    ],
    hintBodies: ['Track best-so-far while scanning.', 'Empty array → return null.', 'let m=-Infinity; if nums empty return null; ...'],
    kind: 'max',
  }),
  (gi, w) => ({
    title: `Minimum element (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return the **minimum** value in non-empty \`nums\`. Assume nums has at least one element.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'min'),
    hintBodies: ['Symmetric to max; start with nums[0].', 'Compare each element to current min.'],
    kind: 'min',
  }),
  (gi, w) => ({
    title: `Count positives (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Count how many integers in \`nums\` are **strictly greater than 0**.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'countPos'),
    hintBodies: ['Zero and negatives do not count.', 'Single pass counter.'],
    kind: 'countPos',
  }),
  (gi, w) => ({
    title: `Two sum — sorted (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Given **sorted ascending** \`nums\` and \`target\`, return **indices** \`[i,j]\` with i < j and nums[i]+nums[j]===target. Assume exactly one solution exists.`,
    starter: `function solve(nums, target) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'twoSumSorted'),
    hintBodies: ['Two pointers L=0, R=nums.length-1.', 'If sum too small, L++; too big, R--.'],
    kind: 'twoSumSorted',
  }),
  (gi, w) => ({
    title: `Contains duplicate? (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return \`true\` if any value appears at least twice in \`nums\`, else \`false\`.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'hasDuplicate'),
    hintBodies: ['Set tracks seen values.', 'Sort + adjacent check is O(n log n) alternative.'],
    kind: 'hasDuplicate',
  }),
  (gi, w) => ({
    title: `Missing number 0..n (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Given array containing \`n\` distinct numbers from \`0..n\`, find the missing one. Example: [0,1,3] → 2.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'missingNumber'),
    hintBodies: ['Sum formula n(n+1)/2 minus actual sum.', 'XOR all indices and values.'],
    kind: 'missingNumber',
  }),
  (gi, w) => ({
    title: `Maximum subarray (Kadane) (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Classic: return the **largest sum** of any contiguous subarray of \`nums\`.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'maxSubarray'),
    hintBodies: ['Local best ending here: cur = max(x, cur+x).', 'Global max tracks answer.'],
    kind: 'maxSubarray',
  }),
  (gi, w) => ({
    title: `Climbing stairs (${gi + 1})`,
    difficulty: 'Easy',
    problem: `You can climb 1 or 2 steps. How many distinct ways to reach step \`n\`? (Fibonacci shift.)`,
    starter: `function solve(n) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'climbStairs'),
    hintBodies: ['ways(n)=ways(n-1)+ways(n-2).', 'Base: ways(1)=1, ways(2)=2.'],
    kind: 'climbStairs',
  }),
  (gi, w) => ({
    title: `Fibonacci (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return F(n) for n≥0 with F(0)=0, F(1)=1.`,
    starter: `function solve(n) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'fib'),
    hintBodies: ['Iterative two variables beat exponential recursion.', 'Could matrix expo for fun—not needed here.'],
    kind: 'fib',
  }),
  (gi, w) => ({
    title: `Factorial (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return n! for n≥0; 0! = 1.`,
    starter: `function solve(n) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'factorial'),
    hintBodies: ['Loop multiply 1..n.', 'Watch overflow in real systems—here use JS BigInt? Keep n≤12 for number safety.'],
    kind: 'factorial',
  }),
  (gi, w) => ({
    title: `GCD (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Greatest common divisor of two non-negative integers (both not both zero).`,
    starter: `function solve(a, b) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'gcd'),
    hintBodies: ['Euclidean algorithm: gcd(a,b)=gcd(b,a%b).'],
    kind: 'gcd',
  }),
  (gi, w) => ({
    title: `Binary search index (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Given sorted \`nums\` and \`target\`, return index or -1.`,
    starter: `function solve(nums, target) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'binarySearch'),
    hintBodies: ['lo/hi mid; exclude half each step.', 'Watch off-by-one; use while(lo<=hi) pattern.'],
    kind: 'binarySearch',
  }),
  (gi, w) => ({
    title: `Rotate array right (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Rotate \`nums\` right by \`k\` steps; return **new** array (do not mutate input).`,
    starter: `function solve(nums, k) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'rotateRight'),
    hintBodies: ['k %= nums.length.', 'Slice and concat or triple-reverse trick.'],
    kind: 'rotateRight',
  }),
  (gi, w) => ({
    title: `Merge sorted arrays (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Merge two sorted arrays into one sorted array.`,
    starter: `function solve(a, b) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'mergeSorted'),
    hintBodies: ['Two pointers like merge step of mergesort.'],
    kind: 'mergeSorted',
  }),
  (gi, w) => ({
    title: `Valid parentheses (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Given string of \`()[] {}\`, return if well-formed.`,
    starter: `function solve(s) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'validParentheses'),
    hintBodies: ['Stack push opens, pop on close with match check.'],
    kind: 'validParentheses',
  }),
  (gi, w) => ({
    title: `Reverse words (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Trim and reverse order of words in a string (single spaces between words in output).`,
    starter: `function solve(s) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'reverseWords'),
    hintBodies: ['split filter empty join.', 'Manual scan for O(n) space if asked in C++; JS split ok here.'],
    kind: 'reverseWords',
  }),
  (gi, w) => ({
    title: `Palindrome string (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return whether \`s\` reads same forward/back (ignore case optional—here: case sensitive).`,
    starter: `function solve(s) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'isPalindrome'),
    hintBodies: ['Two pointers from ends inward.'],
    kind: 'isPalindrome',
  }),
  (gi, w) => ({
    title: `Tree height (${gi + 1})`,
    difficulty: 'Medium',
    problem: `Binary tree node: \`{ val, left, right }\` or \`null\`. Return height (empty tree 0).`,
    starter: `function solve(root) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'treeHeight'),
    hintBodies: ['1 + max(height(left), height(right)).'],
    kind: 'treeHeight',
  }),
  (gi, w) => ({
    title: `Linked list length (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Singly linked: \`{ val, next }\` or null. Return number of nodes.`,
    starter: `function solve(head) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'listLen'),
    hintBodies: ['Walk while cur; count++.'],
    kind: 'listLen',
  }),
  (gi, w) => ({
    title: `Count graph nodes (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Undirected graph as adjacency object: keys are node ids (numbers), values are neighbor arrays. Return number of unique nodes appearing as key or in any neighbor list.`,
    starter: `function solve(graph) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'graphNodes'),
    hintBodies: ['Collect keys and all neighbors in a Set.'],
    kind: 'graphNodes',
  }),
  (gi, w) => ({
    title: `XOR reduce (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return XOR of all numbers in \`nums\`.`,
    starter: `function solve(nums) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'xorAll'),
    hintBodies: ['a^a=0; XOR is associative commutative.'],
    kind: 'xorAll',
  }),
  (gi, w) => ({
    title: `Power of two (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Return true iff n is a positive integer power of two.`,
    starter: `function solve(n) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'powerTwo'),
    hintBodies: ['n & (n-1) === 0 for n>0.', 'Or count bits.'],
    kind: 'powerTwo',
  }),
  (gi, w) => ({
    title: `Hamming weight (${gi + 1})`,
    difficulty: 'Easy',
    problem: `Count number of 1 bits in binary representation of non-negative n.`,
    starter: `function solve(n) {\n  \n}`,
    fn: 'solve',
    tests: makeTests(gi, 'hammingWeight'),
    hintBodies: ['n &= n-1 clears lowest set bit; count iterations.'],
    kind: 'hammingWeight',
  }),
];

function buildChallenge(globalIndex, worldIndex, localOrder) {
  const builder = PROBLEM_BUILDERS[globalIndex % PROBLEM_BUILDERS.length];
  const spec = builder(globalIndex, worldIndex);
  const wid = WORLD_META[worldIndex].id;
  const id = `${wid}-${String(localOrder).padStart(3, '0')}`;
  let difficulty = spec.difficulty;
  if (difficulty === 'Easy' && globalIndex % 19 === 0) difficulty = 'Medium';
  if (difficulty === 'Medium' && globalIndex % 29 === 0) difficulty = 'Hard';
  return {
    id,
    worldId: wid,
    order: localOrder,
    title: spec.title,
    difficulty,
    xpReward: difficulty === 'Easy' ? 14 : difficulty === 'Medium' ? 32 : 58,
    flavorStory: flavors[globalIndex % flavors.length],
    conceptDeepDive: `${dives[globalIndex % dives.length]}\n\n**World focus:** ${WORLD_META[worldIndex].learningArc}\n\nThis is challenge **#${globalIndex + 1}** in the full DSA arc—patterns repeat across companies; speed comes from recognition, not memorizing 200 unrelated tricks.`,
    problem: spec.problem,
    constraints: [
      'Use JavaScript; define the required function name exactly as in the starter.',
      'Do not use external libraries; O(n) or as stated per problem.',
      'Assume inputs match constraints unless edge cases are explicitly requested.',
    ],
    examples: undefined,
    starterCode: spec.starter,
    functionName: spec.fn,
    testCases: spec.tests,
    hints: hints(...spec.hintBodies),
  };
}

function buildAll() {
  /** @type {import('../src/data/dsa/types.ts').DsaChallenge[]} */
  const flat = [];
  let gi = 0;
  for (let w = 0; w < WORLD_META.length; w++) {
    const perWorld = w < 4 ? 14 : w < 12 ? 13 : 12;
    for (let k = 0; k < perWorld; k++) {
      flat.push(buildChallenge(gi, w, k + 1));
      gi++;
    }
  }
  return flat;
}

function groupWorlds(flat) {
  return WORLD_META.map((meta) => {
    const challenges = flat.filter((c) => c.worldId === meta.id).sort((a, b) => a.order - b.order);
    return { ...meta, challenges };
  });
}

const flat = buildAll();
const worlds = groupWorlds(flat);

const header = `/* eslint-disable */
/**
 * AUTO-GENERATED by scripts/generate-dsa-worlds.mjs — do not edit by hand.
 */
import type { DsaWorld } from './types';

export const DSA_CHALLENGE_COUNT = ${flat.length};

export const DSA_WORLDS: DsaWorld[] = `;

const body = JSON.stringify(worlds, null, 2)
  .replace(/"tier": 1/g, '"tier": 1 as const')
  .replace(/"tier": 2/g, '"tier": 2 as const')
  .replace(/"tier": 3/g, '"tier": 3 as const')
  .replace(/"tier": 4/g, '"tier": 4 as const')
  .replace(/"tier": 5/g, '"tier": 5 as const');

// JSON.stringify loses `as const` — post-process tier for HintTier
let ts = header + body + ';\n';

ts = ts.replace(/"tier": (\d+),/g, '"tier": $1 as const,');

fs.writeFileSync(outFile, ts, 'utf8');
console.log(`Wrote ${flat.length} challenges, ${worlds.length} worlds → ${outFile}`);
