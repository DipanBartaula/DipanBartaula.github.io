/**
 * Animation specs for the research figures rendered by components/FlowFigure.
 * All coordinates live in each figure's own pixel space (its natural width ×
 * height), so the overlay stays locked to the artwork at any rendered size.
 *
 *  paths — SVG path data a token travels along
 *  boxes — highlight rectangles [x, y, w, h]
 *  dots  — [path, start s, duration s, kind, linear?] (linear = constant speed, no easing)
 *  marks — [box, start s, duration s] (a soft glow that fades in and out)
 *  steps — [start s, caption] shown top-left while that stage plays
 */
export type DotKind = "data" | "ctrl" | "accept" | "reject" | "loop" | "cloth" | "person";
export type FlowSpec = {
  w: number;
  h: number;
  loop: number;
  paths: Record<string, string>;
  boxes: Record<string, [number, number, number, number]>;
  dots: [string, number, number, DotKind, boolean?][];
  marks: [string, number, number][];
  steps: [number, string][];
};

/** Token colours shared by every figure. */
export const DOT_COLORS: Record<DotKind, string> = {
  data: "#f59e0b",
  ctrl: "#22c55e",
  accept: "#16a34a",
  reject: "#e11d48",
  loop: "#7c3aed",
  cloth: "#0f766e",
  person: "#0ea5e9",
};

/**
 * Foresight overview — ported from the paper's project page
 * (thenaivekid.github.io/foresight) and kept on its 1761×850 figure space and
 * 9 s timeline: data flows in amber, the Live Executor's control lines in green.
 */
const foresight: FlowSpec = {
  w: 1761,
  h: 850,
  loop: 9,
  paths: {
    frames: "M395,302 L575,302",
    task: "M250,512 L250,655 Q250,668 265,668 L800,668",
    enc2ing: "M658,365 L658,655 Q658,668 672,668 L800,668",
    ing2kv: "M862,605 L862,482",
    kv2think: "M890,448 L890,372",
    think2plan: "M977,302 L1025,302",
    plan2exec: "M1107,243 L1107,172",
    exec2resp: "M1220,172 L1220,668 L1328,668",
    cGate: "M547,172 L547,270 Q547,286 530,286 L490,286",
    cEnc: "M655,172 L655,242",
    cThink: "M882,172 L882,242",
    cKV: "M772,172 L772,450 Q772,462 790,462 L818,462",
  },
  boxes: {
    gate: [470, 218, 24, 150],
    enc: [575, 245, 168, 118],
    kv: [818, 442, 140, 44],
    ingest: [806, 612, 166, 112],
    think: [806, 245, 160, 118],
    plan: [1025, 245, 172, 118],
    exec: [525, 70, 715, 100],
    resp: [1355, 630, 250, 80],
  },
  dots: [
    ["frames", 0, 1.1, "data"],
    ["task", 0, 1.6, "data"],
    ["enc2ing", 1.1, 1.3, "data"],
    ["ing2kv", 2.4, 0.7, "data"],
    ["kv2think", 3.1, 0.7, "data"],
    ["think2plan", 3.8, 0.6, "data"],
    ["plan2exec", 4.4, 0.6, "data"],
    ["cGate", 5.0, 1.0, "ctrl"],
    ["cEnc", 5.0, 0.6, "ctrl"],
    ["cThink", 5.0, 0.6, "ctrl"],
    ["cKV", 5.0, 1.1, "ctrl"],
    ["exec2resp", 6.2, 1.4, "data"],
  ],
  marks: [
    ["gate", 0.7, 1.2],
    ["enc", 1.0, 1.4],
    ["ingest", 2.2, 1.0],
    ["kv", 2.9, 1.0],
    ["think", 3.6, 1.0],
    ["plan", 4.3, 0.8],
    ["exec", 4.9, 1.3],
    ["gate", 5.8, 0.8],
    ["enc", 5.5, 0.8],
    ["resp", 7.4, 1.4],
  ],
  steps: [
    [0, "1 · Frames pass the Vision Gate and are encoded"],
    [2.2, "2 · Ingest LLM appends them to the shared KV cache"],
    [3.1, "3 · Think LLM reads a cache snapshot"],
    [3.8, "4 · Think LLM writes a plan"],
    [4.4, "5 · Live Executor applies the plan (control lines)"],
    [6.2, "6 · Evidence is sufficient: the answer is emitted"],
  ],
};

/** CURVTON-205K data engine on its 1800×1376 pipeline figure. */
// CURVTON feedback loop timing: retry rounds start after IT.1 is judged.
const RETRY_START = 7.2;
const RETRY_ROUND = 2.1;
const ACCEPT_AT = RETRY_START + 3 * RETRY_ROUND + 0.1;

const curvton: FlowSpec = {
  w: 1800,
  h: 1376,
  loop: 16.5,
  paths: {
    clothKw: "M182,155 L398,155",
    clothLlm: "M530,155 L652,155",
    clothDiff: "M826,155 L922,155",
    personKw: "M182,411 L398,411",
    personLlm: "M530,411 L652,411",
    personDiff: "M826,411 L922,411",
    easyKw: "M190,618 L380,810",
    medKw: "M188,852 L366,852",
    hardKw: "M188,1122 L380,897",
    personToEdit: "M1012,478 L1012,588 L415,594 L415,796",
    promptToFlux: "M456,852 L560,852",
    fluxToVlm: "M615,886 L615,1042",
    vlmAccept: "M680,1095 L808,1095 L808,902",
    vlmReject: "M680,1150 L808,1150 L808,1188",
    clothToVton: "M1012,220 L1012,305 L1187,305 L1187,630 L1012,630 L1012,822 L1122,822",
    editToVton: "M870,855 L1122,855",
    basePrompt: "M1183,748 L1183,806",
    vtonToInter: "M1245,838 L1310,838",
    interToJudge: "M1378,884 L1378,950",
    clothToJudge: "M1012,822 L1012,988 L1308,988",
    personToJudge: "M972,855 L972,1042 L1308,1042",
    judgeReject: "M1378,1078 L1378,1120",
    rejToIt2: "M1378,1188 L1378,1243",
    it2ToInter: "M1438,1275 L1503,1275",
    loopBack: "M1637,1275 L1727,1275 L1727,1040 L1447,1040",
    clothToIt2: "M1012,988 L1012,1253 L1312,1253",
    personToIt2: "M972,1042 L972,1285 L1312,1285",
    judgeAccept: "M1445,988 L1592,988",
    upToCamera: "M1652,755 L1652,460",
    cameraToFinal: "M1578,418 L1437,418",
  },
  boxes: {
    clothImg: [924, 88, 192, 132],
    personImg: [924, 345, 192, 132],
    promptGen: [364, 800, 102, 102],
    flux: [564, 814, 104, 74],
    vlm: [548, 1056, 136, 130],
    edited: [750, 806, 122, 92],
    it1: [1124, 796, 122, 84],
    judge: [1308, 948, 140, 132],
    improved: [1321, 1120, 114, 70],
    it2: [1318, 1232, 122, 86],
    accepted: [1541, 755, 211, 209],
    camera: [1263, 333, 170, 168],
  },
  dots: [
    ["clothKw", 0, 0.7, "data"],
    ["clothLlm", 0.7, 0.5, "data"],
    ["clothDiff", 1.2, 0.5, "data"],
    ["personKw", 0, 0.7, "data"],
    ["personLlm", 0.7, 0.5, "data"],
    ["personDiff", 1.2, 0.5, "data"],
    ["easyKw", 1.9, 0.8, "data"],
    ["medKw", 1.9, 0.7, "data"],
    ["hardKw", 1.9, 0.8, "data"],
    ["personToEdit", 1.9, 1.1, "person"],
    ["promptToFlux", 2.8, 0.5, "data"],
    ["fluxToVlm", 3.3, 0.7, "data"],
    ["vlmAccept", 4.0, 0.8, "accept"],
    ["vlmReject", 4.0, 0.6, "reject"],
    ["clothToVton", 4.9, 1.4, "cloth"],
    ["editToVton", 4.9, 0.9, "data"],
    ["basePrompt", 5.3, 0.5, "data"],
    ["vtonToInter", 6.3, 0.4, "data"],
    ["interToJudge", 6.7, 0.4, "data"],
    ["clothToJudge", 6.3, 0.8, "cloth"],
    ["personToJudge", 6.3, 0.8, "data"],
    // feedback loop: three retry rounds (IT.2 → IT.3 → IT.4), each re-scored by the judge
    ...[0, 1, 2].flatMap((k): [string, number, number, DotKind][] => {
      const b = RETRY_START + k * RETRY_ROUND;
      return [
        ["judgeReject", b, 0.35, "reject"],
        ["clothToIt2", b + 0.25, 0.55, "cloth"],
        ["personToIt2", b + 0.25, 0.55, "data"],
        ["rejToIt2", b + 0.45, 0.35, "data"],
        ["it2ToInter", b + 0.85, 0.35, "data"],
        ["loopBack", b + 1.2, 0.8, "loop"],
      ];
    }),
    ["judgeAccept", ACCEPT_AT, 0.6, "accept"],
    ["upToCamera", ACCEPT_AT + 0.6, 0.8, "accept"],
    ["cameraToFinal", ACCEPT_AT + 1.4, 0.6, "accept"],
  ],
  marks: [
    ["clothImg", 1.5, 0.9],
    ["personImg", 1.5, 0.9],
    ["promptGen", 2.5, 0.8],
    ["flux", 3.0, 0.7],
    ["vlm", 3.8, 0.9],
    ["edited", 4.6, 0.9],
    ["it1", 6.0, 0.8],
    ["judge", 6.9, 0.6],
    ...[0, 1, 2].flatMap((k): [string, number, number][] => {
      const b = RETRY_START + k * RETRY_ROUND;
      return [
        ["improved", b + 0.25, 0.6],
        ["it2", b + 0.75, 0.6],
        ["judge", b + 1.85, 0.5],
      ];
    }),
    ["accepted", ACCEPT_AT + 0.3, 1.0],
    ["camera", ACCEPT_AT + 1.6, 0.9],
  ],
  steps: [
    [0, "1 · LLM prompts + diffusion synthesise garments and people"],
    [1.9, "2 · Difficulty-tiered prompts edit each person (Flux2 Klein 9B)"],
    [3.4, "3 · A VLM keeps good edits and discards the rest"],
    [4.9, "4 · Garment + edited person → try-on (IT.1)"],
    [RETRY_START, "5 · Rejected → improved prompt → retry as IT.2 (round 1)"],
    [RETRY_START + RETRY_ROUND, "5 · Rejected again → refine the prompt → IT.3 (round 2)"],
    [RETRY_START + 2 * RETRY_ROUND, "5 · Rejected again → refine the prompt → IT.4 (round 3)"],
    [ACCEPT_AT, "6 · Accepted → joins the dataset (+ new camera angles)"],
  ],
};

/** DreamCloth overview (Figure 1 of the ICLR 2027 submission) on its 1974×1047 figure. */
const dreamcloth: FlowSpec = {
  w: 1974,
  h: 1047,
  loop: 12,
  paths: {
    input: "M178,440 L212,440",
    toGarment: "M338,440 L365,440 L365,290 L398,290",
    toMotion: "M338,440 L365,440 L365,562 L398,562",
    garmentToState: "M542,290 L568,290 L568,440 L605,440",
    motionToState: "M542,562 L568,562 L568,440 L605,440",
    textMotion: "M352,738 L790,738 L790,448",
    toSim: "M748,440 L855,440",
    thetaIn: "M1072,720 L1072,658",
    p2g: "M1072,297 L1072,331",
    grid: "M1072,412 L1072,443",
    contact: "M1072,527 L1072,564",
    g2pLoop: "M965,606 L930,606 L930,252 L965,252",
    toRender: "M1232,520 L1368,520",
    renderToVideo: "M1455,448 L1507,448",
    totalScore: "M1635,448 L1743,448",
    appearance: "M1700,646 L1745,646",
    bodyMotion: "M1660,748 L1688,748 L1688,668",
    combine: "M1700,556 L1745,556",
    objective: "M1815,662 L1867,690 L1867,542",
    regularizers: "M1758,230 L1940,230 L1940,416",
    gradient: "M1900,542 L1900,940 Q1900,968 1872,968 L1106,968 Q1078,968 1078,940 L1078,818",
    gradSim: "M1253,484 L1253,770 L1190,770",
  },
  boxes: {
    image: [30, 300, 147, 257],
    mono: [213, 296, 126, 296],
    garment: [398, 183, 144, 260],
    motion: [398, 452, 136, 285],
    t2m: [213, 610, 142, 202],
    particles: [605, 303, 144, 289],
    p2g: [966, 211, 212, 86],
    grid: [966, 331, 212, 81],
    contact: [966, 443, 212, 84],
    g2p: [966, 564, 212, 86],
    material: [966, 720, 212, 90],
    rollout: [1253, 203, 194, 269],
    renderer: [1365, 336, 92, 259],
    video: [1510, 391, 126, 111],
    model: [1743, 314, 84, 354],
    branches: [1500, 520, 210, 290],
    loss: [1831, 418, 138, 119],
    regs: [1610, 206, 149, 56],
  },
  dots: [
    ["input", 0, 0.5, "data"],
    ["toGarment", 0.5, 0.6, "cloth"],
    ["toMotion", 0.5, 0.6, "person"],
    ["textMotion", 1.0, 1.2, "person"],
    ["garmentToState", 1.6, 0.6, "cloth"],
    ["motionToState", 1.6, 0.6, "person"],
    ["toSim", 2.6, 0.5, "data"],
    ["thetaIn", 3.0, 0.4, "ctrl"],
    ["p2g", 3.4, 0.3, "data"],
    ["grid", 3.9, 0.3, "data"],
    ["contact", 4.4, 0.3, "data"],
    ["g2pLoop", 4.9, 0.7, "loop"],
    ["toRender", 5.7, 0.5, "cloth"],
    ["renderToVideo", 6.4, 0.4, "data"],
    ["totalScore", 7.2, 0.5, "data"],
    ["appearance", 7.3, 0.4, "data"],
    ["bodyMotion", 7.2, 0.6, "person"],
    ["combine", 7.6, 0.4, "data"],
    ["objective", 8.3, 0.6, "data"],
    ["regularizers", 8.3, 0.7, "ctrl"],
    ["gradient", 9.3, 1.7, "reject"],
    ["gradSim", 9.6, 0.9, "reject"],
  ],
  marks: [
    ["image", 0, 0.8],
    ["mono", 0.3, 0.8],
    ["garment", 1.0, 0.8],
    ["motion", 1.0, 0.8],
    ["t2m", 0.8, 0.8],
    ["particles", 2.0, 0.8],
    ["material", 2.9, 0.7],
    ["p2g", 3.2, 0.5],
    ["grid", 3.7, 0.5],
    ["contact", 4.2, 0.5],
    ["g2p", 4.7, 0.5],
    ["rollout", 5.5, 0.8],
    ["renderer", 6.0, 0.6],
    ["video", 6.7, 0.6],
    ["branches", 7.2, 0.8],
    ["model", 7.6, 0.8],
    ["regs", 8.3, 0.6],
    ["loss", 8.7, 0.7],
    ["material", 10.6, 1.1],
  ],
  steps: [
    [0, "1 · Images → SMPL-X body proxy, garment mesh and motion"],
    [1.9, "2 · The garment becomes MPM particles; the body is the collider"],
    [2.9, "3 · Differentiable MPM: P2G → forces → contact → G2P, driven by Θ"],
    [5.5, "4 · The rendered rollout is scored by a frozen video prior"],
    [8.2, "5 · (+, −, −, +) composition → loss, plus regularizers"],
    [9.3, "6 · Gradients flow back through renderer + simulator to Θ"],
  ],
};

// ---------------------------------------------------------------------------
// Project diagrams (Figma frames). Paths follow the drawn arrows.
// ---------------------------------------------------------------------------

const assetedit: FlowSpec = {
  w: 1600,
  h: 900,
  loop: 9,
  paths: {
    s1: "M277,262 L307,262",
    s2: "M531,262 L561,262",
    s3: "M785,262 L815,262",
    s4: "M1039,262 L1069,262",
    s5: "M1293,262 L1323,262",
    v1: "M339,581 C354.3,581 368.2,596.6 380.5,627.7",
    v2: "M339,665.1 C354.3,665.1 367.2,661.4 377.5,654",
    v3: "M339,749.5 C354.3,749.5 368.4,724 381.3,673",
    avg: "M459,651 L494,651",
    region: "M1154,662 L1209,662",
  },
  boxes: {
    inputs: [53, 136, 224, 252],
    render: [307, 136, 224, 252],
    target: [561, 136, 224, 252],
    edit: [815, 136, 224, 252],
    distil: [1069, 136, 224, 252],
    out: [1323, 136, 224, 252],
    view1: [77, 546, 260, 70],
    view2: [77, 630, 260, 70],
    view3: [77, 714, 260, 70],
    avg: [386, 616, 68, 68],
    update: [504, 546, 269, 238],
    after: [1214, 520, 312, 282],
  },
  dots: [
    ["s1", 0, 0.4, "data"],
    ["s2", 0.9, 0.4, "data"],
    ["s3", 1.8, 0.4, "data"],
    ["s4", 2.8, 0.4, "data"],
    ["v1", 3.6, 0.6, "loop"],
    ["v2", 3.6, 0.6, "loop"],
    ["v3", 3.6, 0.6, "loop"],
    ["avg", 4.5, 0.4, "ctrl"],
    ["region", 5.8, 0.5, "data"],
    ["s5", 7.0, 0.4, "accept"],
  ],
  marks: [
    ["inputs", 0, 0.6],
    ["render", 0.5, 0.7],
    ["target", 1.4, 0.7],
    ["edit", 2.1, 0.7],
    ["distil", 3.1, 0.7],
    ["view1", 3.4, 0.6],
    ["view2", 3.4, 0.6],
    ["view3", 3.4, 0.6],
    ["avg", 4.1, 0.6],
    ["update", 4.8, 0.8],
    ["after", 6.1, 0.8],
    ["out", 7.3, 1.1],
  ],
  steps: [
    [0, "1 · Inputs: a 3D asset (NeRF / 3DGS) and a text instruction"],
    [0.8, "2 · Render views and mask the target region (CLIP + SAM)"],
    [2.0, "3 · Edit in image space with Qwen-Edit / HunyuanDiT"],
    [2.8, "4 · Distil into 3D — per-view edits average into one update"],
    [5.7, "5 · Region-aware: only the masked part changes"],
    [6.9, "6 · A view-consistent edited asset"],
  ],
};

// CAD/CAE split into its two diagrams (1600×560 each).
const cadDesign: FlowSpec = {
  w: 1600,
  h: 560,
  loop: 9,
  paths: {
    a1: "M297,282 L325,282",
    a2: "M541,282 L570,282",
    a3: "M786,282 L814,282",
    a4: "M1030,282 L1059,282",
    a5: "M1275,282 L1303,282",
    rag: "M541,420 L605,420 L605,366",
    ontFail: "M922,365 L922,414 L746,414 L746,366",
    solverFail: "M1167,365 L1167,414 L746,414 L746,366",
  },
  boxes: {
    spec: [81, 200, 216, 164],
    router: [325, 200, 216, 164],
    code: [570, 200, 216, 164],
    onto: [814, 200, 216, 164],
    solver: [1059, 200, 216, 164],
    result: [1303, 200, 216, 164],
    rag: [81, 394, 460, 80],
    repair: [759, 398, 150, 36],
    guard: [1301, 167, 222, 36],
  },
  dots: [
    ["a1", 0, 0.4, "data"],
    ["rag", 0.3, 0.6, "ctrl"],
    ["a2", 0.9, 0.4, "data"],
    ["a3", 1.8, 0.4, "data"],
    ["ontFail", 2.4, 0.9, "reject"],
    ["a3", 3.6, 0.4, "data"],
    ["a4", 4.4, 0.4, "data"],
    ["solverFail", 5.0, 1.1, "reject"],
    ["a3", 6.3, 0.3, "data"],
    ["a4", 6.8, 0.3, "data"],
    ["a5", 7.4, 0.4, "accept"],
  ],
  marks: [
    ["spec", 0, 0.6],
    ["rag", 0.2, 0.7],
    ["router", 0.4, 0.7],
    ["code", 1.2, 0.8],
    ["onto", 2.1, 0.5],
    ["repair", 2.8, 0.7],
    ["code", 3.3, 0.5],
    ["onto", 3.9, 0.5],
    ["solver", 4.7, 0.5],
    ["repair", 5.4, 0.6],
    ["code", 6.0, 0.5],
    ["solver", 7.0, 0.5],
    ["result", 7.7, 0.8],
    ["guard", 7.9, 0.8],
  ],
  steps: [
    [0, "1 · A text spec (+ hybrid RAG context) is routed by complexity"],
    [1.2, "2 · Code is generated and checked against the domain ontology"],
    [2.4, "3 · Invalid config or solver error → self-repair loop"],
    [7.4, "4 · A converged run returns stress / thermal / flow fields"],
  ],
};

const cadGym: FlowSpec = {
  w: 1600,
  h: 560,
  loop: 7.5,
  paths: {
    b1: "M345,268 L375,268",
    b2: "M639,268 L668,268",
    b3: "M932,268 L962,268",
    b4: "M1226,268 L1255,268",
    bLoop: "M1387,349 L1387,374 L213,374 L213,350",
  },
  boxes: {
    policy: [81, 188, 264, 160],
    roll: [375, 188, 264, 160],
    gym: [668, 188, 264, 160],
    rew: [962, 188, 264, 160],
    grpo: [1255, 188, 264, 160],
    updated: [733, 358, 135, 36],
    checks: [180, 395, 581, 36],
    langfuse: [1193, 395, 330, 36],
  },
  dots: [
    ["b1", 0.5, 0.4, "data"],
    ["b2", 1.4, 0.4, "data"],
    ["b3", 2.4, 0.4, "data"],
    ["b4", 3.3, 0.4, "accept"],
    ["bLoop", 4.3, 1.2, "loop"],
  ],
  marks: [
    ["policy", 0, 0.6],
    ["roll", 0.8, 0.6],
    ["gym", 1.7, 0.6],
    ["checks", 2.0, 0.8],
    ["rew", 2.7, 0.6],
    ["grpo", 3.6, 0.7],
    ["updated", 4.7, 0.7],
    ["policy", 5.4, 0.6],
    ["langfuse", 5.9, 0.9],
  ],
  steps: [
    [0, "1 · Policy: Qwen, warm-started with QLoRA SFT"],
    [0.8, "2 · Async multi-GPU rollouts write simulation scripts"],
    [1.7, "3 · A headless solver gym compiles and runs each one"],
    [2.7, "4 · Verifiable rewards: reward models + rule checks"],
    [3.6, "5 · GRPO: group-relative advantages, KL-regularised"],
    [4.3, "6 · The updated policy loops back; Langfuse tracks every run"],
  ],
};

// Toy projects (generated SVGs, 1600×900).
// Lecture: a playhead runs over the original and adapted timelines at the
// same real-time rate, so it visibly slows through the dense derivation.
const SEG = [
  { o: [250, 110], a: [250, 91.67], bar: [256, 589, 98, 27], pill: [270, 679, 60, 34], k: 2 },
  { o: [360, 165], a: [341.67, 165], bar: [366, 551, 153, 65], pill: [403, 679, 60, 34], k: 1 },
  { o: [525, 220], a: [506.67, 275], bar: [531, 522, 208, 94], pill: [610, 679, 60, 34], k: 0 },
  { o: [745, 165], a: [781.67, 165], bar: [751, 560, 153, 56], pill: [816, 679, 60, 34], k: 1 },
  { o: [910, 110], a: [946.67, 91.67], bar: [916, 579, 98, 37], pill: [949, 679, 60, 34], k: 2 },
];
const SEG_DUR = [0.83, 1.5, 2.5, 1.5, 0.83];
const SEG_KIND: DotKind[] = ["reject", "loop", "accept"];
const SEG_T0 = 5.6;
const segStart = (i: number) => SEG_T0 + SEG_DUR.slice(0, i).reduce((x, y) => x + y, 0);
const lecture: FlowSpec = {
  w: 1600,
  h: 900,
  loop: 13.6,
  paths: {
    ...Object.fromEntries([0, 1, 2, 3, 4].map((i) => [`p${i}`, `M${280 + 254 * i},265 L${304 + 254 * i},265`])),
    ...Object.fromEntries(SEG.map((s, i) => [`o${i}`, `M${s.o[0]},647 L${s.o[0] + s.o[1]},647`])),
    ...Object.fromEntries(SEG.map((s, i) => [`a${i}`, `M${s.a[0]},745 L${s.a[0] + s.a[1]},745`])),
  },
  boxes: {
    ...Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [`s${i}`, [53 + 254 * i, 140, 224, 250] as [number, number, number, number]])),
    ...Object.fromEntries(SEG.map((s, i) => [`bar${i}`, s.bar as [number, number, number, number]])),
    ...Object.fromEntries(SEG.map((s, i) => [`pill${i}`, s.pill as [number, number, number, number]])),
    ...Object.fromEntries([0, 1, 2].map((k) => [`rule${k}`, [1113, 510 + 76 * k, 414, 64] as [number, number, number, number]])),
  },
  dots: [
    ...[0, 1, 2, 3, 4].map((i): [string, number, number, DotKind] => [`p${i}`, 0.5 + 0.9 * i, 0.4, i === 4 ? "accept" : "data"]),
    ...SEG.flatMap((s, i): [string, number, number, DotKind, boolean][] => [
      [`o${i}`, segStart(i), SEG_DUR[i], SEG_KIND[s.k], true],
      [`a${i}`, segStart(i), SEG_DUR[i], SEG_KIND[s.k], true],
    ]),
  ],
  marks: [
    ...[0, 1, 2, 3, 4, 5].map((i): [string, number, number] => [`s${i}`, 0.9 * i, 0.8]),
    ...SEG.flatMap((s, i): [string, number, number][] => [
      [`bar${i}`, segStart(i), SEG_DUR[i]],
      [`pill${i}`, segStart(i), SEG_DUR[i]],
      [`rule${s.k}`, segStart(i), SEG_DUR[i]],
    ]),
  ],
  steps: [
    [0, "1 · A lecture video arrives through the Flask API"],
    [0.9, "2 · Audio is extracted; WhisperX transcribes it with timestamps"],
    [2.7, "3 · o4-mini rates each topic segment's difficulty, 1–10"],
    [3.6, "4 · Each segment is re-timed: 0.8× · 1.0× · 1.2×"],
    [4.5, "5 · The adapted video is uploaded to Cloudinary"],
    [SEG_T0, "6 · Playback: slower through the derivation, faster on the easy parts"],
  ],
};

const sim8085: FlowSpec = {
  w: 1600,
  h: 900,
  loop: 11,
  paths: {
    request: "M497,252 L696,252",
    toLoader: "M973,254 L995.5,254",
    toMemory: "M1251.5,254 L1274,254",
    fetch: "M1337,299 L1337,308 L916,308 L916,381",
    decode: "M990,416 Q1036,422 1020,497",
    execute: "M928,528 L884,528",
    toUnits: "M1095,470 L1114,470",
    toStateA: "M1216.75,580 L1216.75,601",
    toStateB: "M1428.25,580 L1428.25,601",
    next: "M792,497 Q784,418 838,412",
    response: "M696,662 L497,662",
  },
  boxes: {
    run: [333, 200, 72, 36],
    line: [73, 338, 400, 35],
    editor: [69, 238, 408, 174],
    controller: [720, 212, 250, 84],
    loader: [998.5, 212, 250, 84],
    memmap: [1277, 212, 250, 84],
    fetchN: [842, 385, 148, 54],
    decodeN: [932, 501, 148, 54],
    executeN: [732, 501, 148, 54],
    alu: [1329.5, 350, 197.5, 104],
    state: [720, 604, 807, 198],
    regs: [69, 446, 408, 156],
    flags: [69, 642, 408, 48],
    mem: [69, 730, 404, 72],
  },
  dots: [
    ["request", 0.6, 0.6, "data"],
    ["toLoader", 1.5, 0.3, "data"],
    ["toMemory", 2.1, 0.3, "data"],
    ["fetch", 2.8, 0.8, "data"],
    ["decode", 3.8, 0.5, "loop"],
    ["execute", 4.5, 0.4, "loop"],
    ["toUnits", 5.0, 0.3, "ctrl"],
    ["toStateA", 5.6, 0.3, "data"],
    ["toStateB", 5.6, 0.3, "data"],
    ["next", 6.2, 0.6, "loop"],
    ["decode", 6.9, 0.4, "loop"],
    ["execute", 7.4, 0.3, "loop"],
    ["response", 8.0, 0.8, "accept"],
  ],
  marks: [
    ["editor", 0, 0.7],
    ["run", 0.3, 0.6],
    ["controller", 1.1, 0.6],
    ["loader", 1.7, 0.6],
    ["memmap", 2.3, 0.7],
    ["fetchN", 3.4, 0.6],
    ["decodeN", 4.1, 0.6],
    ["executeN", 4.7, 0.6],
    ["alu", 5.1, 0.7],
    ["state", 5.7, 0.8],
    ["line", 6.4, 1.2],
    ["regs", 8.6, 1.0],
    ["flags", 8.8, 0.9],
    ["mem", 9.0, 1.0],
  ],
  steps: [
    [0, "1 · A hex program is entered in the browser and run"],
    [0.6, "2 · POST /ExecuteCode → controller → loader → memory map"],
    [2.8, "3 · Fetch the opcode at PC, decode it via lookup tables"],
    [4.6, "4 · Execute in the matching unit (here: ALU for ADD B)"],
    [5.6, "5 · Machine state updates; PC advances to the next instruction"],
    [8.0, "6 · JSON state returns — registers, flags and memory light up"],
  ],
};

// Foresight teaser (paper Fig. 1, 1309×631): where Foresight sits, then the
// accuracy-vs-speed zoom.
const foresightTeaser: FlowSpec = {
  w: 1309,
  h: 631,
  loop: 9,
  paths: {
    sweep: "M170,470 C270,320 420,150 520,98",
    zoom: "M620,22 L772,22",
    zoomLow: "M620,316 L772,522",
    rt: "M966,528 L966,92",
    f1: "M782,67 L944,67",
  },
  boxes: {
    required: [90, 185, 452, 440],
    proAsync: [316, 36, 302, 278],
    starL: [496, 52, 82, 82],
    starR: [924, 36, 84, 64],
    mini: [1040, 228, 70, 60],
    baselines: [776, 368, 528, 156],
  },
  dots: [
    ["sweep", 0.9, 1.1, "accept"],
    ["zoom", 3.0, 0.6, "data"],
    ["zoomLow", 3.0, 0.6, "data"],
    ["rt", 3.8, 0.8, "accept"],
    ["f1", 3.8, 0.8, "accept"],
  ],
  marks: [
    ["required", 0, 1.2],
    ["proAsync", 1.2, 0.9],
    ["starL", 1.8, 1.0],
    ["starR", 4.4, 1.2],
    ["mini", 5.6, 0.9],
    ["baselines", 6.4, 1.1],
    ["starR", 7.5, 1.2],
  ],
  steps: [
    [0, "1 · Most streaming VLMs are reactive, or need extra training"],
    [1.2, "2 · Foresight alone is proactive and asynchronous — training-free"],
    [3.0, "3 · Zoom in: accuracy (joint F1) vs speed (real-time factor)"],
    [4.4, "4 · 23.0 joint F1 at real time — best overall"],
    [5.6, "5 · Next best: MiniCPM-o 4.5 at 13.5, slower than real time"],
    [6.4, "6 · The other streaming baselines cluster far lower"],
  ],
};

// CURVTON feedback-loop strip (1265×296): inputs, then try-on iterations IT.1 → IT.4.
const curvtonIter: FlowSpec = {
  w: 1265,
  h: 296,
  loop: 8,
  paths: {
    inPerson: "M80,78 C118,78 128,146 152,146",
    inGarment: "M80,215 C118,215 128,146 152,146",
    i12: "M288,22 L566,22",
    i23: "M566,22 L843,22",
    i34: "M843,22 L1120,22",
  },
  boxes: {
    person: [10, 8, 140, 138],
    garment: [10, 147, 140, 139],
    p1: [150, 8, 277, 278],
    p2: [427, 8, 277, 278],
    p3: [704, 8, 277, 278],
    p4: [981, 8, 277, 278],
  },
  dots: [
    ["inPerson", 0.1, 0.6, "person"],
    ["inGarment", 0.1, 0.6, "cloth"],
    ["i12", 1.6, 0.7, "reject"],
    ["i23", 3.0, 0.7, "reject"],
    ["i34", 4.4, 0.7, "loop"],
  ],
  marks: [
    ["person", 0, 0.8],
    ["garment", 0, 0.8],
    ["p1", 0.6, 0.9],
    ["p2", 2.1, 0.9],
    ["p3", 3.5, 0.9],
    ["p4", 4.9, 1.5],
    ["garment", 5.6, 1.0],
  ],
  steps: [
    [0, "1 · Inputs: source person + target garment"],
    [0.6, "2 · IT.1 — the first try-on"],
    [1.6, "3 · The VLM judge rejects → refined prompt → IT.2"],
    [3.0, "4 · Rejected again → IT.3"],
    [4.4, "5 · IT.4 — long sleeves and embroidered cuffs now match the garment"],
  ],
};

export const FLOWS = { foresight, foresightTeaser, curvton, curvtonIter, dreamcloth, cadDesign, cadGym, assetedit, lecture, sim8085 } as const;
export type FlowName = keyof typeof FLOWS;
