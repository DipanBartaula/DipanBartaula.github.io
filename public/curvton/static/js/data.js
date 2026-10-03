/* All numbers below are transcribed from the CURVTON-205K paper (arXiv version). */
window.CV = (function () {
  const pretty = {
    kasavu_saree: "Kasavu saree", kimono: "Kimono", flamenco_dress: "Flamenco dress", lace_dress: "Lace dress",
    romanian_ie: "Romanian ie", mom_jeans: "Mom jeans", cholita_dress: "Cholita dress", ruffle_top: "Ruffle top",
    barong_tagalog: "Barong tagalog", hakama: "Hakama", dashiki: "Dashiki", blazer: "Blazer", lederhosen: "Lederhosen",
    hanfu: "Hanfu", sherwani: "Sherwani", sweatshirt: "Sweatshirt", muga_silk_saree: "Muga silk saree", kebaya: "Kebaya",
    fair_isle_sweater: "Fair Isle sweater", kitenge_dress: "Kitenge dress", abaya: "Abaya", little_black_dress: "Little black dress",
    cape_coat: "Cape coat", tuxedo: "Tuxedo", yukata: "Yukata", balochi_suit: "Balochi suit", poncho: "Poncho", jeans: "Jeans",
    tracksuit: "Tracksuit", cheongsam: "Cheongsam", tehuana_dress: "Tehuana dress", bomber_jacket: "Bomber jacket",
    limbu_mekhli: "Limbu mekhli", jumpsuit: "Jumpsuit", hanbok: "Hanbok", thobe: "Thobe", pashtun_dress: "Pashtun dress",
    korean_dopo: "Korean dopo", shenyi: "Shenyi"
  };
  const raw = ["easy_female_kasavu_saree","easy_female_kimono","easy_female_flamenco_dress","easy_female_lace_dress","easy_female_romanian_ie","easy_female_mom_jeans","easy_female_cholita_dress","easy_female_ruffle_top","easy_male_barong_tagalog","easy_male_hakama","easy_male_dashiki","easy_male_blazer","easy_male_lederhosen","easy_male_hanfu","easy_male_sherwani","easy_male_sweatshirt","medium_female_muga_silk_saree","medium_female_kebaya","medium_female_fair_isle_sweater","medium_female_kitenge_dress","medium_female_abaya","medium_female_cholita_dress","medium_female_little_black_dress","medium_female_cape_coat","medium_male_tuxedo","medium_male_yukata","medium_male_balochi_suit","medium_male_poncho","medium_male_jeans","medium_male_dashiki","medium_male_tracksuit","hard_female_cheongsam","hard_female_tehuana_dress","hard_female_bomber_jacket","hard_female_limbu_mekhli","hard_female_jumpsuit","hard_female_hanbok","hard_female_kimono","hard_female_kitenge_dress","hard_male_thobe","hard_male_pashtun_dress","hard_male_lederhosen","hard_male_korean_dopo","hard_male_blazer","hard_male_shenyi","hard_male_hakama","hard_male_dashiki"];
  const samples = raw.map(key => {
    const [tier, gender, ...g] = key.split("_");
    const slug = g.join("_");
    const base = "static/img/samples/" + key;
    return { key, tier, gender, garment: pretty[slug] || slug,
      person: base + "_person.jpg", cloth: base + "_cloth.jpg", tryon: base + "_tryon.jpg",
      personSm: base + "_person_sm.jpg", clothSm: base + "_cloth_sm.jpg", tryonSm: base + "_tryon_sm.jpg" };
  });
  const byKey = Object.fromEntries(samples.map(s => [s.key, s]));
  const hero = ["easy_female_kimono","hard_female_tehuana_dress","medium_male_yukata","easy_male_dashiki","hard_male_lederhosen","medium_female_kebaya","hard_female_limbu_mekhli","medium_female_kitenge_dress"].map(k => byKey[k]);

  const tiers = [
    { id: "easy", name: "Easy", short: "E" },
    { id: "medium", name: "Medium", short: "M" },
    { id: "hard", name: "Hard", short: "H" }
  ];

  /* Table 6: artifact rate (%) by refinement iteration, VLM threshold 0.8 */
  const refine = {
    iters: ["0", "I", "II", "III", "IV"],
    train: { easy: [38, 25, 15, 8, 3], medium: [48, 32, 19, 10, 4], hard: [60, 40, 24, 13, 5] },
    test:  { easy: [39, 26, 16, 8, 3], medium: [49, 33, 20, 11, 4], hard: [61, 41, 25, 14, 5] },
    preGen: { easy: 17, medium: 25, hard: 35 }, preFilt: { easy: 3, medium: 4.4, hard: 5.7 }
  };

  /* Table 7: cross-generator / cross-evaluator robustness, artifact rate E/M/H */
  const robust = [
    { gen: "FLUX.2-klein-9B", cost: "$25k", ev: "Qwen3-VL 32B", it0: [44, 54, 66], it4: [8, 11, 14], primary: true },
    { gen: "FLUX.2-klein-9B", cost: "$25k", ev: "Qwen3-VL-30B-A3B Thinking", it0: [44, 54, 66], it4: [9, 12, 13] },
    { gen: "FLUX.2-klein-9B", cost: "$25k", ev: "PaliGemma", it0: [44, 54, 66], it4: [13, 16, 20] },
    { gen: "FLUX.2-klein-4B", cost: "$18k", ev: "Qwen3-VL 32B", it0: [55, 63, 74], it4: [15, 18, 22] },
    { gen: "FLUX.2-klein-4B", cost: "$18k", ev: "PaliGemma", it0: [55, 63, 74], it4: [18, 22, 27], optional: true },
    { gen: "Qwen-Image-Edit-2509", cost: "$90k", ev: "Qwen3-VL 32B", it0: [65, 73, 82], it4: [21, 25, 30] },
    { gen: "Qwen-Image-Edit-2509", cost: "$90k", ev: "PaliGemma", it0: [65, 73, 82], it4: [28, 33, 38] },
    { gen: "Nano Banana Pro", cost: "$160k", ev: "Qwen3-VL 32B", it0: [40, 48, 60], it4: [5, 8, 10] }
  ];

  /* Table 1 */
  const datasets = [
    { name: "VITON", train: "14K", test: "2K", type: "Real", mask: 0, tiers: 0, wild: 0, pairs: 1, cov: 1 },
    { name: "VITON-HD", train: "12.3K", test: "1.4K", type: "Real", mask: 0, tiers: 0, wild: 0, pairs: 1, cov: 1 },
    { name: "DressCode", train: "50K", test: "3K", type: "Real", mask: 0, tiers: 0, wild: 0, pairs: 1, cov: 1 },
    { name: "StreetTryOn", train: "12.5K", test: "1.9K", type: "Real", mask: 0, tiers: 0, wild: 1, pairs: 0, cov: 2 },
    { name: "WildVTON", train: "N/A", test: "1.2K", type: "Hybrid", mask: 1, tiers: 0, wild: 1, pairs: 1, cov: 1 },
    { name: "OpenVTON-Bench", train: "~90K", test: "~10K", type: "Real", mask: 1, tiers: 0, wild: 1, pairs: 1, cov: 2 },
    { name: "CURVTON-205K", train: "205K", test: "4.5K", type: "Synthetic", mask: 1, tiers: 1, wild: 1, pairs: 1, cov: 3, ours: true }
  ];

  /* Table 4: task-free diversity. dir: 1 higher is better, -1 lower is better, 0 no direction stated */
  const divRows = ["VITON-HD", "DressCode", "StreetTryOn", "Dress-ED", "CURVTON Easy", "CURVTON Medium", "CURVTON Hard", "CURVTON-205K (All)"];
  const divCols = [
    { id: "pose", dim: "Pose", label: "Pose variance σ²", dir: 1, v: [145.55, 127.79, 204.48, 129.92, 66.68, 178.45, 201.88, 182.22] },
    { id: "occl", dim: "Occlusion", label: "Occlusion complexity", dir: 1, v: [0.52, 0.45, 0.62, 0.43, 0.53, 0.62, 0.66, 0.61] },
    { id: "vis", dim: "Occlusion", label: "Person visibility", dir: -1, v: [0.31, 0.45, 0.23, 0.43, 0.33, 0.27, 0.24, 0.28] },
    { id: "bge", dim: "Background", label: "Texture entropy (BGE)", dir: 1, v: [2.93, 1.60, 4.57, 1.63, 4.00, 4.78, 4.81, 4.54] },
    { id: "bse", dim: "Background", label: "Semantic entropy (BSE)", dir: 1, v: [0.01, 0.07, 0.54, 0.07, 0.43, 0.57, 0.50, 0.50] },
    { id: "bod", dim: "Background", label: "Object density (BOD)", dir: 1, v: [0.29, 0.56, 3.15, 0.60, 3.45, 5.17, 5.09, 4.61] },
    { id: "igm", dim: "Illumination", label: "Gradient mean (IGM)", dir: 0, v: [0.60, 0.73, 0.45, 0.80, 0.50, 0.37, 0.33, 0.40] },
    { id: "lvm", dim: "Illumination", label: "Luminance variance (LVM)", dir: 1, v: [0.06, 0.10, 0.10, 0.09, 0.16, 0.09, 0.09, 0.12] },
    { id: "shape", dim: "Body shape", label: "Body-shape variance σ²", dir: 1, v: [0.54, 0.76, 0.47, 0.77, 0.62, 0.74, 1.02, 0.89] },
    { id: "gvar", dim: "Garment", label: "Garment variance", dir: 1, v: [475.81, 669.59, 621.65, 725.11, 831.32, 821.99, 827.66, 823.06] },
    { id: "gdiv", dim: "Garment", label: "Garment diversity", dir: 1, v: [0.04, 0.26, 0.15, 0.32, 0.52, 0.49, 0.51, 0.50] },
    { id: "phi", dim: "Camera", label: "Azimuth spread σφ", dir: 1, v: [0.070, 0.140, 0.120, 0.170, 0.022, 0.347, 1.197, 0.683] },
    { id: "theta", dim: "Camera", label: "Elevation spread σθ", dir: 1, v: [0.090, 0.070, 0.140, 0.113, 0.066, 0.292, 0.422, 0.295] }
  ];

  /* Table 8 (superset of Table 2): CURVTON-205K test set. Subsets in order. */
  const subsets = ["Overall", "Easy", "Medium", "Hard", "Upper body", "Lower body", "Full-body (G)", "Traditional", "Non-trad."];
  const subsetsShort = ["All", "Easy", "Med", "Hard", "UB", "LB", "G", "Tr", "NTr"];
  const bench = {
    "OOTDiffusion": {
      zs: { FID: [18.90, 25.20, 24.40, 25.50, 19.50, 27.15, 29.70, 29.95, 17.15], SSIM: [.75, .78, .77, .70, .78, .75, .72, .73, .81], LPIPS: [.19, .18, .18, .22, .16, .20, .21, .22, .16] },
      tr: { FID: [8.75, 9.88, 11.54, 14.12, 11.42, 11.83, 13.79, 14.22, 13.83], SSIM: [.85, .86, .85, .83, .86, .87, .80, .78, .88], LPIPS: [.13, .12, .12, .15, .12, .11, .15, .18, .12] }
    },
    "CatVTON": {
      zs: { FID: [23.85, 22.55, 24.40, 27.55, 22.60, 23.55, 28.90, 31.35, 20.16], SSIM: [.45, .55, .41, .37, .45, .45, .42, .50, .54], LPIPS: [.36, .30, .36, .41, .35, .34, .38, .36, .32] },
      tr: { FID: [9.14, 9.14, 9.23, 12.88, 10.62, 11.34, 14.94, 15.57, 12.70], SSIM: [.86, .86, .86, .81, .87, .88, .82, .80, .90], LPIPS: [.12, .12, .09, .12, .11, .10, .14, .16, .10] }
    },
    "IDM-VTON": {
      zs: { FID: [17.05, 16.20, 17.30, 19.30, 16.70, 17.25, 22.00, 25.55, 15.15], SSIM: [.80, .82, .80, .77, .81, .83, .75, .71, .80], LPIPS: [.15, .14, .14, .17, .14, .13, .18, .24, .16] },
      tr: { FID: [8.44, 8.28, 8.85, 10.29, 10.21, 10.57, 13.54, 15.75, 7.98], SSIM: [.87, .88, .87, .84, .88, .89, .82, .77, .88], LPIPS: [.11, .10, .10, .12, .10, .09, .13, .18, .10] }
    },
    "DCI-VTON": {
      zs: { FID: [19.20, 18.00, 19.30, 20.80, 20.15, 17.05, 24.10, 18.05, 25.55], SSIM: [.81, .82, .81, .79, .80, .84, .77, .79, .72], LPIPS: [.17, .16, .16, .18, .18, .14, .19, .19, .25] }
    },
    "FLUX.2 [klein] 9B": {
      zs: { FID: [14.50, 13.10, 15.35, 17.95, 14.75, 16.05, 17.50, 23.27, 20.23], SSIM: [.77, .79, .78, .73, .79, .79, .73, .47, .52], LPIPS: [.15, .14, .15, .18, .14, .15, .18, .35, .31] }
    }
  };

  /* Table 3: cross-dataset generalization */
  const cross = {
    models: ["CatVTON", "IDM-VTON", "StableVITON", "OOTDiffusion"],
    settings: [{ id: "real", name: "Real baseline" }, { id: "curv", name: "CURVTON-205K" }, { id: "mix", name: "Real + CURVTON" }],
    data: {
      "VITON-HD": {
        SSIM: { CatVTON: [.87, .78, .89], "IDM-VTON": [.85, .80, .87], StableVITON: [.85, .77, .86], OOTDiffusion: [.83, .75, .84] },
        LPIPS: { CatVTON: [.11, .13, .10], "IDM-VTON": [.12, .13, .11], StableVITON: [.15, .18, .14], OOTDiffusion: [.14, .16, .13] },
        FID: { CatVTON: [9.01, 11.74, 8.72], "IDM-VTON": [9.26, 11.02, 8.98], StableVITON: [8.93, 11.01, 8.71], OOTDiffusion: [11.73, 12.21, 11.62] },
        KID: { CatVTON: [1.09, 1.41, 1.04], "IDM-VTON": [1.27, 1.46, 1.22], StableVITON: [2.54, 3.08, 2.46], OOTDiffusion: [3.15, 4.90, 3.19] }
      },
      "DressCode": {
        SSIM: { CatVTON: [.89, .80, .90], "IDM-VTON": [.89, .83, .90], StableVITON: [.88, .80, .89], OOTDiffusion: [.85, .77, .87] },
        LPIPS: { CatVTON: [.10, .12, .10], "IDM-VTON": [.12, .13, .11], StableVITON: [.11, .13, .11], OOTDiffusion: [.12, .15, .11] },
        FID: { CatVTON: [6.14, 7.98, 5.92], "IDM-VTON": [14.13, 16.94, 13.68], StableVITON: [13.60, 17.08, 13.05], OOTDiffusion: [9.21, 17.73, 9.08] },
        KID: { CatVTON: [1.40, 1.79, 1.36], "IDM-VTON": [6.03, 6.88, 5.86], StableVITON: [6.05, 7.11, 5.72], OOTDiffusion: [2.66, 3.45, 2.61] }
      },
      "StreetTryOn": {
        FID: { CatVTON: [25.31, 21.36, 20.45], "IDM-VTON": [23.62, 19.08, 18.55], StableVITON: [23.15, 18.44, 17.95], OOTDiffusion: [27.62, 23.31, 18.70] },
        KID: { CatVTON: [6.95, 5.42, 5.18], "IDM-VTON": [6.18, 4.96, 4.82], StableVITON: [4.63, 3.71, 3.60], OOTDiffusion: [8.08, 7.25, 4.58] }
      }
    }
  };

  /* Table 5: in-the-wild (OOTDiffusion trained on each source; FLUX and IDM-VTON as pretrained references) */
  const wild = [
    { name: "VITON-HD", clip: .71, vlm: .69, q: 10, r: 11 },
    { name: "DressCode", clip: .74, vlm: .73, q: 12, r: 13 },
    { name: "VHD + DC", clip: .77, vlm: .76, q: 14, r: 15 },
    { name: "FLUX (pretrained)", clip: .76, vlm: .74, q: 14, r: 14 },
    { name: "IDM-VTON", clip: .80, vlm: .78, q: 15, r: 19 },
    { name: "CURVTON-205K", clip: .83, vlm: .86, q: 35, r: 28, ours: true }
  ];

  /* Table 10: curriculum vs no curriculum (Stable Diffusion finetuning) */
  const curriculum = {
    budgets: [3.6, 7.2, 14.4, 28.8],
    budgetNames: ["Minimal", "Limited", "Medium", "Full"],
    splits: ["Easy", "Medium", "Hard", "All Mixed"],
    // [SSIM, LPIPS, FID, KID] per budget
    nc: {
      "Easy": [[.78, .17, 21.4, .02], [.81, .14, 19.3, .01], [.83, .13, 17.9, .02], [.84, .12, 16.8, .01]],
      "Medium": [[.74, .21, 26.7, .03], [.77, .18, 23.8, .02], [.79, .16, 21.7, .02], [.81, .15, 20.3, .02]],
      "Hard": [[.66, .27, 36.3, .03], [.70, .23, 32.7, .03], [.73, .21, 28.4, .03], [.76, .19, 26.1, .02]],
      "All Mixed": [[.73, .22, 28.1, .03], [.76, .19, 25.2, .02], [.78, .17, 22.7, .02], [.80, .16, 21.1, .02]]
    },
    sc: {
      "Easy": [[.79, .16, 20.2, .02], [.82, .13, 18.4, .02], [.83, .12, 17.3, .015], [.85, .11, 16.2, .01]],
      "Medium": [[.77, .19, 25.3, .02], [.78, .17, 22.4, .02], [.80, .15, 21.1, .02], [.82, .14, 19.4, .02]],
      "Hard": [[.68, .25, 33.8, .03], [.72, .21, 29.8, .03], [.74, .20, 27.6, .03], [.77, .18, 25.3, .02]],
      "All Mixed": [[.75, .21, 26.4, .02], [.77, .17, 23.5, .02], [.79, .16, 22.0, .02], [.81, .15, 20.3, .02]]
    }
  };

  /* Table 9: tier composition and scale. [SSIM, LPIPS, FID, KID] per test split (Easy, Medium, Hard, All mixed) */
  const composition = [
    { name: "Easy only", v: [[.86, .11, 9.86, .95], [.83, .12, 12.70, .92], [.76, .18, 19.87, 2.29], [.85, .11, 10.29, .94]] },
    { name: "Medium only", v: [[.82, .18, 12.89, 1.75], [.83, .12, 11.02, .46], [.78, .15, 15.32, .61], [.82, .17, 12.52, 1.73]] },
    { name: "Hard only", v: [[.83, .16, 13.08, 2.51], [.84, .12, 11.47, 1.08], [.77, .15, 15.10, 1.08], [.83, .15, 13.15, 2.75]] },
    { name: "Medium + Hard", v: [[.81, .20, 12.75, 1.82], [.82, .13, 11.11, .39], [.77, .16, 15.25, .59], [.80, .16, 13.92, .64]] },
    { name: "Easy + Hard (full)", v: [[.83, .16, 11.46, 1.20], [.84, .11, 10.42, .48], [.75, .17, 15.50, .95], [.81, .15, 13.54, .70]] },
    { name: "All tiers · 10%", v: [[.81, .19, 11.08, 1.38], [.82, .14, 10.35, .30], [.74, .18, 14.94, .64], [.77, .21, 12.02, 2.54]], sep: true },
    { name: "All tiers · 20%", v: [[.80, .20, 12.23, 1.70], [.81, .14, 10.91, .47], [.77, .16, 14.01, .30], [.80, .19, 11.99, 1.79]] },
    { name: "All tiers · 50%", v: [[.83, .16, 10.35, 1.42], [.85, .10, 9.51, .26], [.80, .13, 13.15, .37], [.83, .15, 10.18, 1.23]] },
    { name: "All tiers · 100%", v: [[.86, .12, 9.14, .96], [.86, .09, 9.23, .20], [.81, .12, 12.88, .22], [.86, .12, 9.14, .97]] }
  ];

  return { samples, byKey, hero, tiers, refine, robust, datasets, divRows, divCols, subsets, subsetsShort, bench, cross, wild, curriculum, composition };
})();
