/**
 * Result tables from the papers, as data for components/PaperCharts.tsx.
 * CURVTON-205K: main paper Tables 1 and 4, supplementary Table 5.
 * DreamCloth: ICLR 2027 submission Tables 1, 2 and 3.
 */

export type Dir = "up" | "down" | "none";
export type Metric = { key: string; label: string; dir: Dir; digits: number; group?: string; hint?: string };
export type Row = { name: string; tag?: "ours" | "ourstier" | "base" | "capture"; v: Record<string, number> };

// ---------------------------------------------------------------- CURVTON

/** Table 1 — comparison of virtual try-on datasets. Sizes in thousands; null = N/A. */
export const vtonDatasets: {
  name: string;
  train: number | null;
  test: number;
  approx?: boolean;
  type: "Real" | "Hybrid" | "Synth.";
  maskFree: boolean;
  tiers: boolean;
  wild: boolean;
  pairs: boolean;
  coverage: "Limited" | "Moderate" | "Broad";
  ours?: boolean;
}[] = [
  { name: "VITON", train: 14, test: 2, type: "Real", maskFree: false, tiers: false, wild: false, pairs: true, coverage: "Limited" },
  { name: "VITON-HD", train: 12.3, test: 1.4, type: "Real", maskFree: false, tiers: false, wild: false, pairs: true, coverage: "Limited" },
  { name: "DressCode", train: 50, test: 3, type: "Real", maskFree: false, tiers: false, wild: false, pairs: true, coverage: "Limited" },
  { name: "StreetTryOn", train: 12.5, test: 1.9, type: "Real", maskFree: false, tiers: false, wild: true, pairs: false, coverage: "Moderate" },
  { name: "WildVTON", train: null, test: 1.2, type: "Hybrid", maskFree: true, tiers: false, wild: true, pairs: true, coverage: "Limited" },
  { name: "OpenVTON-Bench", train: 90, test: 10, approx: true, type: "Real", maskFree: true, tiers: false, wild: true, pairs: true, coverage: "Moderate" },
  { name: "CURVTON-205K", train: 205, test: 4.5, type: "Synth.", maskFree: true, tiers: true, wild: true, pairs: true, coverage: "Broad", ours: true },
];

/** Table 4 — task-free dataset diversity across seven dimensions. */
export const diversityMetrics: Metric[] = [
  { key: "pose", label: "σ² pose", dir: "up", digits: 2, group: "Pose", hint: "pose variance" },
  { key: "occl", label: "Occl. complexity", dir: "up", digits: 2, group: "Occlusion" },
  { key: "vis", label: "Person visibility", dir: "down", digits: 2, group: "Occlusion", hint: "lower = more occluded" },
  { key: "bge", label: "BGE (C)", dir: "up", digits: 2, group: "Background", hint: "background entropy" },
  { key: "bse", label: "BSE (D)", dir: "up", digits: 2, group: "Background" },
  { key: "bod", label: "BOD (D)", dir: "up", digits: 2, group: "Background" },
  { key: "igm", label: "IGM", dir: "none", digits: 2, group: "Illumination", hint: "global illumination mean" },
  { key: "lvm", label: "LVM (D)", dir: "up", digits: 2, group: "Illumination" },
  { key: "shape", label: "σ² shape", dir: "up", digits: 2, group: "Body shape" },
  { key: "gvar", label: "Garment var.", dir: "up", digits: 2, group: "Garment" },
  { key: "gdiv", label: "Garment div.", dir: "up", digits: 2, group: "Garment" },
  { key: "phi", label: "σ̂ φ", dir: "up", digits: 3, group: "Camera", hint: "camera azimuth spread" },
  { key: "theta", label: "σ̂ θ", dir: "up", digits: 3, group: "Camera", hint: "camera elevation spread" },
];
const div = (name: string, tag: Row["tag"], a: number[]): Row => ({
  name,
  tag,
  v: Object.fromEntries(diversityMetrics.map((m, i) => [m.key, a[i]])),
});
export const diversityRows: Row[] = [
  div("VITON-HD", undefined, [145.55, 0.52, 0.31, 2.93, 0.01, 0.29, 0.6, 0.06, 0.54, 475.81, 0.04, 0.07, 0.09]),
  div("DressCode", undefined, [127.79, 0.45, 0.45, 1.6, 0.07, 0.56, 0.73, 0.1, 0.76, 669.59, 0.26, 0.14, 0.07]),
  div("StreetTryOn", undefined, [204.48, 0.62, 0.23, 4.57, 0.54, 3.15, 0.45, 0.1, 0.47, 621.65, 0.15, 0.12, 0.14]),
  div("Dress-ED", undefined, [129.92, 0.43, 0.43, 1.63, 0.07, 0.6, 0.8, 0.09, 0.77, 725.11, 0.32, 0.17, 0.113]),
  div("CURVTON · Easy", "ourstier", [66.68, 0.53, 0.33, 4.0, 0.43, 3.45, 0.5, 0.16, 0.62, 831.32, 0.52, 0.022, 0.066]),
  div("CURVTON · Medium", "ourstier", [178.45, 0.62, 0.27, 4.78, 0.57, 5.17, 0.37, 0.09, 0.74, 821.99, 0.49, 0.347, 0.292]),
  div("CURVTON · Hard", "ourstier", [201.88, 0.66, 0.24, 4.81, 0.5, 5.09, 0.33, 0.09, 1.02, 827.66, 0.51, 1.197, 0.422]),
  div("CURVTON-205K (all)", "ours", [182.22, 0.61, 0.28, 4.54, 0.5, 4.61, 0.4, 0.12, 0.89, 823.06, 0.5, 0.683, 0.295]),
];

/** Supplementary Table 5 — curriculum vs. no curriculum (Stable Diffusion finetuning). */
export const curriculumBudgets = ["3.6k", "7.2k", "14.4k", "28.8k"];
export const curriculumSplits = ["Easy", "Medium", "Hard", "All mixed"] as const;
export const curriculumMetrics: Metric[] = [
  { key: "fid", label: "FID", dir: "down", digits: 1 },
  { key: "ssim", label: "SSIM", dir: "up", digits: 2 },
  { key: "lpips", label: "LPIPS", dir: "down", digits: 2 },
  { key: "kid", label: "KID", dir: "down", digits: 3 },
];
// [budget][split] = [SSIM, LPIPS, FID, KID]
type Q = [number, number, number, number];
const NO: Q[][] = [
  [[0.78, 0.17, 21.4, 0.02], [0.74, 0.21, 26.7, 0.03], [0.66, 0.27, 36.3, 0.03], [0.73, 0.22, 28.1, 0.03]],
  [[0.81, 0.14, 19.3, 0.01], [0.77, 0.18, 23.8, 0.02], [0.7, 0.23, 32.7, 0.03], [0.76, 0.19, 25.2, 0.02]],
  [[0.83, 0.13, 17.9, 0.02], [0.79, 0.16, 21.7, 0.02], [0.73, 0.21, 28.4, 0.03], [0.78, 0.17, 22.7, 0.02]],
  [[0.84, 0.12, 16.8, 0.01], [0.81, 0.15, 20.3, 0.02], [0.76, 0.19, 26.1, 0.02], [0.8, 0.16, 21.1, 0.02]],
];
const CU: Q[][] = [
  [[0.79, 0.16, 20.2, 0.02], [0.77, 0.19, 25.3, 0.02], [0.68, 0.25, 33.8, 0.03], [0.75, 0.21, 26.4, 0.02]],
  [[0.82, 0.13, 18.4, 0.02], [0.78, 0.17, 22.4, 0.02], [0.72, 0.21, 29.8, 0.03], [0.77, 0.17, 23.5, 0.02]],
  [[0.83, 0.12, 17.3, 0.015], [0.8, 0.15, 21.1, 0.02], [0.74, 0.2, 27.6, 0.03], [0.79, 0.16, 22.0, 0.02]],
  [[0.85, 0.11, 16.2, 0.01], [0.82, 0.14, 19.4, 0.02], [0.77, 0.18, 25.3, 0.02], [0.81, 0.15, 20.3, 0.02]],
];
const MI: Record<string, number> = { ssim: 0, lpips: 1, fid: 2, kid: 3 };
export function curriculumSeries(split: number, metric: string) {
  const pick = (t: Q[][]) => t.map((b) => b[split][MI[metric]]);
  return { none: pick(NO), curriculum: pick(CU) };
}

// ---------------------------------------------------------------- DreamCloth

/** Table 1 — held-out comparison on ActorsHQ and 4D-DRESS. */
export const dcMetrics: Metric[] = [
  { key: "cd", label: "CD ×10³", dir: "down", digits: 3, group: "Geometry", hint: "Chamfer distance" },
  { key: "mcd", label: "Masked CD ×10³", dir: "down", digits: 3, group: "Geometry", hint: "garment-only Chamfer (SAM 3 masks)" },
  { key: "f", label: "F-score", dir: "up", digits: 1, group: "Geometry" },
  { key: "lpips", label: "LPIPS", dir: "down", digits: 4, group: "Appearance" },
  { key: "psnr", label: "PSNR", dir: "up", digits: 2, group: "Appearance" },
  { key: "ssim", label: "SSIM", dir: "up", digits: 3, group: "Appearance" },
];
const dc = (name: string, tag: Row["tag"], a: number[]): Row => ({ name, tag, v: Object.fromEntries(dcMetrics.map((m, i) => [m.key, a[i]])) });
export const dcGroups: { key: string; label: string; note: string; rows: Row[] }[] = [
  {
    key: "actorshq",
    label: "ActorsHQ",
    note: "4 sequences · 200 held-out frames each",
    rows: [
      dc("ARAH", "capture", [1.098, 2.149, 87.8, 0.0539, 29.17, 0.976]),
      dc("TAVA", "capture", [0.647, 1.16, 94.1, 0.05, 30.19, 0.981]),
      dc("GaussianAvatar", "capture", [0.892, 1.794, 91.2, 0.0431, 31.21, 0.981]),
      dc("PhysAvatar", "capture", [0.539, 1.097, 94.8, 0.0343, 30.8, 0.976]),
      dc("MPMAvatar", "capture", [0.412, 0.693, 97.6, 0.0323, 32.64, 0.982]),
      dc("DreamCloth · Base SDS", "base", [0.606, 1.301, 90.0, 0.0361, 27.18, 0.955]),
      dc("DreamCloth · Four-branch FSD", "ourstier", [0.491, 0.947, 90.8, 0.0351, 28.12, 0.957]),
      dc("DreamCloth · FSD + time schedule", "ours", [0.468, 0.922, 91.0, 0.0334, 28.79, 0.958]),
    ],
  },
  {
    key: "4ddress",
    label: "4D-DRESS",
    note: "4 sequences · 100 held-out frames each",
    rows: [
      dc("PhysAvatar", "capture", [0.363, 0.743, 98.5, 0.0216, 33.86, 0.996]),
      dc("MPMAvatar", "capture", [0.323, 0.631, 99.1, 0.0176, 34.78, 0.997]),
      dc("DreamCloth · Base SDS", "base", [0.507, 1.004, 91.7, 0.0206, 29.35, 0.97]),
      dc("DreamCloth · Four-branch FSD", "ourstier", [0.405, 0.743, 92.2, 0.0199, 30.15, 0.97]),
      dc("DreamCloth · FSD + time schedule", "ours", [0.375, 0.722, 92.3, 0.0186, 30.97, 0.971]),
    ],
  },
];

/** Table 2 — fourth-corner ablation (4D-DRESS s190, same initialisation and settings). */
export const fourthCorner = {
  four: { rho: 0.563, ks: 50, h: 0.881, cd: 0.362 },
  three: { rho: 0.109, ks: 535, h: 1.2, cd: 0.422 },
};

/** Table 3 — where 25 repeated optimisations land (auxiliary geometric optimiser). */
export const landscape = {
  bounds: { rho: [0.1, 3.0], ks: [50, 2000], h: [0.8, 1.2] } as Record<string, [number, number]>,
  rows: [
    { seq: "s170", garment: "upper", rho: [1.675, 0.015, 0.9], ks: [1497, 42, 2.81], ksRange: [1376, 1534], h: 0.975 },
    { seq: "s185", garment: "upper", rho: [1.668, 0.001, 0.06], ks: [1498, 6, 0.4], ksRange: [1489, 1509], h: 0.986 },
    { seq: "s190", garment: "", rho: [1.773, 0.114, 6.43], ks: [1242, 133, 10.71], ksRange: [789, 1358], h: 0.987 },
    { seq: "s191", garment: "", rho: [0.689, 0.002, 0.29], ks: [2000, 0.2, 0.01], ksRange: [1998, 2000], h: 0.984 },
  ],
};
