import type { FlowName } from "./flows";

export const sections = [
  { id: "about", label: "Abstract", navLabel: "Abstract", idx: "§0" },
  { id: "education", label: "Education", navLabel: "Education", idx: "§1" },
  { id: "research", label: "Research", navLabel: "Research", idx: "§2" },
  { id: "log", label: "Log", navLabel: "Log", idx: "§3" },
  { id: "projects", label: "Projects", navLabel: "Projects", idx: "§4" },
  { id: "toys", label: "Toy Projects", navLabel: "Toys", idx: "§5" },
  { id: "results", label: "Results", navLabel: "Results", idx: "§6" },
  { id: "stack", label: "Stack", navLabel: "Stack", idx: "§7" },
  { id: "code", label: "Code", navLabel: "Code", idx: "§8" },
  { id: "hobbies", label: "Off the Clock", navLabel: "Hobbies", idx: "§9" },
  { id: "contact", label: "Contact", navLabel: "Contact", idx: "" },
] as const;

export const summary =
  "Data Scientist, AI Engineer, and Researcher with about 3 years of combined industry, research, and freelance experience across machine learning, Generative AI, NLP, RAG, Computer Vision, 3D Vision, Virtual Try-On, and Generative Modeling. Hands-on with Python, SQL, PyTorch, MLflow, Azure Databricks/Spark, MLOps, production deployments, HPC-scale training, structured tool calling, typed agent state, MCP/A2A protocols, and production retrieval/serving patterns. Proven track record of architecting multi-agent orchestration systems, training and fine-tuning LLMs with verifiable reward signals, and building end-to-end pipelines that bridge language-driven reasoning with real-world execution. Research contributions include two papers under review, one introducing the largest virtual try-on benchmark to date. Equally comfortable operating at the systems level — distributed training, cloud infrastructure, and large-scale data engineering — and at the research frontier.";

export const logEntries = [
  {
    date: "Jan 2026 — present",
    duration: "10 months",
    role: "Research Engineer",
    org: "NAAMII Multimodal Learning Lab",
    logo: "/images/logo-naamii.svg",
    logoBg: "#ffffff",
    desc: "Researching Edge AI and world models alongside medical imaging, reproducing and stress-testing SOTA multimodal models while resolving bottlenecks in optimization, data pipelines, and GPU memory. Deployed distributed SLURM/AWS training infrastructure with mixed-precision, gradient checkpointing, and unified MLflow/WandB tracking. Provisioned and managed rented GPU instances across RunPod, Vast.ai, and Lightning AI, with checkpoint persistence and cost-aware instance selection and teardown.",
  },
  {
    date: "Dec 2025 — present",
    duration: "11 months",
    role: "Founding Research Engineer (Part-time)",
    org: "AI Lab Pvt. Ltd.",
    logo: "/images/logo-ailab-sm.webp",
    logoBg: "#ffffff",
    desc: "Researching a code-mixed Nepali–English–Medical speech recognition system for streaming, edge-device deployment: low-latency inference pipeline design, model distillation for edge-deployable ASR backbones without accuracy loss, large-scale SFT data pipeline construction, and a custom benchmark suite for accented, domain-specific, streaming ASR evaluation.",
  },
  {
    date: "Jun — Dec 2025",
    duration: "7 months",
    role: "Junior Research Engineer",
    org: "Accelerated Komputing",
    logo: "/images/logo-ank-sm.webp",
    logoBg: "#111111",
    desc: "Architected DAG-based multi-agent LLM orchestration decomposing engineering queries into reasoning graphs for CAD/CAE automation. Built closed-loop LLM–FEM pipelines for autonomous tool invocation and self-correction; led NVIDIA Isaac GR00T integration with constrained decoding for human-free execution.",
  },
  {
    date: "Feb 2024 — Dec 2025",
    duration: "1 yr 6 months, intermittent",
    role: "Freelance AI Engineer & Technical Instructor",
    org: "Independent",
    logo: "/images/logo-freelance.svg",
    logoBg: "#ffffff",
    desc: "Contributed to part-level 3D asset generation for an Israel-based stealth 3D-printing startup; delivered a voice-to-video system (LLM scripting, diffusion lip sync), a skin analysis pipeline (21+ conditions, severity, ingredient recommendations), and DAG-orchestrated tool-calling agents for clients. Supported paper writing and peer review; taught 255+ hours of Data Science, Python, and Agentic AI/RAG.",
  },
] as const;

export type ResearchFigure = { src: string; w: number; h: number; caption: string; wide?: boolean; flow?: FlowName };
export type ResearchPaper = {
  id: string;
  fig: string;
  status: { label: string; tone: "accent" | "accent2" };
  title: string;
  role: string;
  compute?: string;
  desc: string[];
  links?: { label: string; href: string }[];
  stats?: { value: string; label: string }[];
  inlineImage: { src: string; w: number; h: number; caption: string; flow?: FlowName } | null;
  images: ResearchFigure[];
  leaderboard?: boolean;
  /** Interactive result charts (components/PaperCharts.tsx). */
  charts?: "curvton" | "dreamcloth";
};

export const research: ResearchPaper[] = [
  {
    id: "curvton",
    fig: "FIG. 01",
    status: { label: "Under anonymous review", tone: "accent2" },
    title: "CURVTON-205K: A Scalable Mask-Free Synthetic Dataset for Virtual Try-On",
    role: "First Author",
    compute: "4,500 H200 GPU-hours",
    desc: [
      "Introduces the largest virtual try-on benchmark to date (205K+ samples), establishing a new state-of-the-art in dataset diversity across poses, occlusions, illumination conditions, background density, and garment categories — entirely mask-free. Evaluation transparency is enforced via stratification into difficulty tiers, enabling rigorous benchmarking across the full distribution of generation challenge rather than aggregate metrics alone. Dataset artifacts and trained model checkpoints are published to the Hugging Face Hub, including Croissant/metadata files and repository documentation.",
    ],
    inlineImage: {
      src: "/images/curvton-results.webp", w: 1265, h: 296,
      caption: "Feedback-loop iterations over the source person and garment images",
      flow: "curvtonIter",
    },
    images: [
      { src: "/images/curvton-pipeline.webp", w: 1800, h: 1376, caption: "Synthetic data generation & editing pipeline", wide: true, flow: "curvton" },
      { src: "/images/curvton-teaser.webp", w: 1800, h: 600, caption: "Source person, target garment, and composited result" },
    ],
    charts: "curvton",
  },
  {
    id: "dreamcloth",
    fig: "FIG. 02",
    status: { label: "Under anonymous review", tone: "accent2" },
    title: "DreamCloth: Structural Counterfactual Score Factorization for Behavioral System Identification",
    role: "First Author",
    compute: "500 H200 GPU-hours",
    desc: [
      "Frozen generative models are increasingly reused as differentiable objectives, but their scores mix every change that makes a scene more likely — while an inverse solver controls only one factor. DreamCloth introduces structural counterfactual score factorization: a differentiable renderer builds a matched 2×2 lattice of the same scene (clothed rollout, static clothed frame, garment-free moving body, garment-free static body) and a frozen video prior scores all four under one shared noise draw. Their (+, −, −, +) mixed difference cancels the constant and both one-factor main effects exactly, for any nonlinear black-box score, leaving only the garment–motion interaction.",
      "That interaction is distilled through a differentiable codimensional MPM cloth simulator with body contact to optimise density, stretching stiffness, thickness and contact friction, from multi-view images with no tracked garment supervision. On ActorsHQ and 4D-DRESS, factored guidance beats direct score distillation on held-out geometry (Chamfer 0.606 → 0.468 and 0.507 → 0.375), and removing the fourth corner worsens it (0.362 → 0.422). The paper is explicit about what this identifies: held-out rollout fidelity supports behavioral identification, while sign agreement, boundary saturation and a 25-initialization landscape study show where unique material constants are not supported.",
    ],
    inlineImage: null,
    images: [
      { src: "/images/dreamcloth-arch.webp", w: 1974, h: 1047, caption: "DreamCloth overview (paper Fig. 1): reconstruct → MPM state → coupled simulation → factored-prior optimisation", wide: true, flow: "dreamcloth" },
      { src: "/images/dreamcloth-stage1.webp", w: 1408, h: 768, caption: "Stage 1 — from images to a classified 3D particle volume" },
    ],
    charts: "dreamcloth",
  },
  {
    id: "foresight",
    fig: "FIG. 03",
    status: { label: "Preprint · arXiv soon", tone: "accent2" },
    title: "Foresight: Planning Future Perception in Streaming VLMs without Retraining",
    role: "Co-First Author",
    desc: [
      "Streaming vision-language models watch a live feed but spend the same compute on every frame, whatever is about to happen. Foresight shows that a streaming VLM can already anticipate the next few seconds — and uses that ability to plan its own future perception, with no retraining at all.",
      "One frozen Qwen3-VL-8B runs as two twins over a shared KV cache. The Ingest LLM keeps absorbing frames and never stops; the Think LLM wakes only at scheduled checks, reads a snapshot of the cache and writes a plan — when to look again, what to look for, and how densely to sample. A Live Executor applies each plan through schema-guided decoding and lightweight diff updates, and answers the moment the evidence is sufficient. It reaches 23.0 mean joint F1 on OmniPro Online, 9.5 points above the strongest trained baseline, and lifts its backbone by +6.7 on StreamingBench and +15.4 on OVO-Bench — the largest gain (+18.7) when evidence arrives late in the stream.",
    ],
    links: [
      { label: "Project page", href: "https://thenaivekid.github.io/foresight/" },
      { label: "Paper (PDF)", href: "https://thenaivekid.github.io/foresight/static/pdf/foresight.pdf" },
      { label: "Code", href: "https://github.com/thenaivekid/foresight" },
    ],
    stats: [
      { value: "23.0", label: "joint F1 · OmniPro Online" },
      { value: "+6.7", label: "over backbone · StreamingBench" },
      { value: "+15.4", label: "over backbone · OVO-Bench" },
      { value: "0", label: "training steps" },
    ],
    inlineImage: null,
    images: [
      { src: "/images/foresight-arch.webp", w: 1761, h: 850, caption: "Foresight overview: Ingest + Think twins over a shared KV cache", wide: true, flow: "foresight" },
      { src: "/images/foresight-teaser.webp", w: 1309, h: 631, caption: "From reactive to proactive streaming inference — training-free", flow: "foresightTeaser" },
    ],
    leaderboard: true,
  },
];

export const projects = [
  {
    title: "Agentic ML System",
    subtitle: "Autonomous end-to-end machine-learning pipeline",
    image: "/images/projects/agentic-ml.webp",
    imageW: 2400,
    imageH: 1350,
    accent: "#7c3aed",
    summary:
      "A multi-agent system that runs the whole machine-learning lifecycle from a single natural-language request. Domain-specialised LLM agents own each phase — EDA, preprocessing, feature engineering, model selection and monitoring — and hand off through shared typed state and a structured tool-calling protocol. A meta-learner reads a dataset's geometry and statistics to choose algorithms without exhaustive search, Bayesian optimisation with GP surrogates tunes hyperparameters, and drift detectors (KS-test, PSI) trigger retraining while SHAP/PDP explanations are produced by default. It cut manual ML engineering effort by 70%+ and ships production-ready pipelines with minimal supervision.",
  },
  {
    title: "CAD/CAE Agents & RLVR",
    subtitle: "Agentic engineering design & RL gym",
    image: "/images/projects/cad-design.webp",
    flow: "cadDesign" as FlowName,
    imageW: 2400,
    imageH: 840,
    image2: { src: "/images/projects/cad-gym.webp", w: 2400, h: 840, flow: "cadGym" as FlowName, caption: "RL gym" },
    accent: "#f97316",
    summary:
      "Agentic Engineering Design: turns text into structural, thermal, and fluid simulations, routing each task by design complexity across models with a spectrum of coding and engineering capability; code is ontology-validated (units, boundary conditions, mesh-solver fit) before running, solver logs drive self-repair, and guardrails wrap every step. RAG over drawings, design docs, and the client's scripting framework: structure-aware chunking, BM25 + dense retrieval, reranking, recall@k/MRR evals. RL Gym: a headless, always-on Python gym where 3D foundation reward models and rule-based checks (code quality, compile and runtime success, latency, complexity, constraints) score agent-written scripts to train Qwen via QLoRA SFT and GRPO-based RLVR, with async multi-GPU rollouts and KL regularization against reward hacking. Langfuse traces evals, regressions, and token cost.",
  },
  {
    title: "DeepFit",
    subtitle: "Diffusion-based virtual try-on",
    image: "/images/projects/deepfit.webp",
    imageW: 1408,
    imageH: 768,
    accent: "#e11d48",
    summary:
      "A diffusion virtual try-on system built on Stable Diffusion 1.5. Pose-conditioned attention keeps the garment locked to the wearer's articulation, and LoRA fine-tuning adapts the model with 90% fewer trainable parameters on a single 24 GB GPU. The pipeline runs human parsing → CLIP feature extraction → appearance-flow estimation with thin-plate-spline warping → diffusion inpainting, so the garment is first deformed to the body's geometry and then painted in photorealistically. It delivers geometry-preserving garment transfer competitive with systems using twice the compute, with pixel-space and latent-space conditioning compared along the way, and ships as a reproducible config-driven pipeline served through a Flask REST API with versioned checkpoints.",
  },
  {
    title: "3D Asset Editing Pipeline",
    subtitle: "Text-driven modification of NeRF & Gaussian-splat scenes",
    image: "/images/projects/asset-edit.webp",
    flow: "assetedit" as FlowName,
    imageW: 2400,
    imageH: 1350,
    accent: "#10b981",
    summary:
      "A pipeline for editing a 3D asset with a text prompt. The edit is first made in image space with Qwen-Edit 2509 and HunyuanDiT — where generative editors are strongest — and then propagated into NeRF and 3D Gaussian Splatting scenes through score distillation sampling with multi-view consensus averaging, so every viewpoint agrees on the change instead of drifting. CLIP+SAM segmentation confines the edit to the intended region, and Flash Attention with model parallelism keeps high-splat-count scenes tractable. The result is intuitive, view-consistent 3D content editing that lowers the technical barrier for production asset pipelines.",
  },
  {
    title: "Edge AI",
    subtitle: "Efficient RAG, model portability & mobile vision",
    image: "/images/projects/edge-ai.webp",
    imageW: 2400,
    imageH: 1350,
    accent: "#06b6d4",
    summary:
      "A fully on-device stack with no cloud dependence. TurboVec provides a compact, high-throughput vector database for low-latency retrieval, paired with proactive video processing that prunes redundant computation. Models are made portable with ONNX and TensorRT and deployed to iOS and Android through MLX compilation and ONNX Runtime, and MobileOne (featured at CVPR 2026) was fine-tuned for deepfake detection and medical imaging within tight mobile compute and memory budgets — guided by per-operator latency and memory profiling for graph optimisation and quantisation.",
  },
  {
    title: "AI Agents Integration & Engineering",
    subtitle: "Custom MCP, agent harnesses & self-evolving skills",
    image: "/images/projects/agents.webp",
    imageW: 2400,
    imageH: 1350,
    accent: "#f59e0b",
    summary:
      "Built custom MCP servers and an integration layer giving agents tool, SSH, and API-gateway access via structured tool calling, typed state, DAG orchestration, A2A, and constrained decoding. Harness loops checkpoint persistent state to resume long runs, route tool failures back through the reasoning graph, and distill each run's takeaways into optimized skill files. Red-teamed with YAML attack scenarios (indirect prompt injection, data exfiltration) and AI-generated attacks, co-evolving guardrails.",
  },
] as const;

/** Smaller, self-contained builds — fun, finished, and on GitHub. */
export const toyProjects = [
  {
    title: "LLM-Driven Lecture Video Adaptation",
    subtitle: "Playback that slows for the hard parts and speeds through the easy ones",
    image: "/images/toys/lecture-video.webp",
    flow: "lecture" as FlowName,
    href: "https://github.com/DipanBartaula/Lecture-Optimization-Via-LLM-based-video-adaptation",
    tags: ["Python", "WhisperX", "GPT o4-mini", "Flask", "Cloudinary"],
    summary:
      "A pipeline that re-times lecture videos to how difficult each moment actually is. WhisperX transcribes the audio, an LLM (OpenAI's o4-mini) rates the difficulty of each topic segment, and the video is recompiled with smoothly varying playback speed — slower through dense material, faster through the easy stretches — while keeping the audio intelligible. The result is uploaded to Cloudinary and served through a small Flask API, with a command-line interface for batch processing.",
  },
  {
    title: "8085 Microprocessor Simulator",
    subtitle: "Assembly in, register and memory state out — step by step",
    image: "/images/toys/sim-8085.webp",
    flow: "sim8085" as FlowName,
    href: "https://github.com/DipanBartaula/Microprocess-8085-Simulation-Backend",
    tags: ["C#", "ASP.NET Core", "Node.js", "DSA project"],
    summary:
      "A full-stack simulator for the Intel 8085. The ASP.NET Core backend parses 8085 assembly, executes it instruction by instruction, and exposes the machine state; a Node.js front end visualises registers and memory in real time and lets you step through a program to debug it. Built as a data-structures-and-algorithms project — the parser, execution loop and memory model are the point — and released under MIT.",
  },
] as const;

export type RepoCategory =
  | "From-Scratch CUDA/C"
  | "Systems & Big Data";

export const repoCategories: RepoCategory[] = [
  "From-Scratch CUDA/C",
  "Systems & Big Data",
];

export const repos: {
  name: string;
  href: string;
  desc: string;
  lang: string;
  stars: number;
  forks: number;
  category: RepoCategory;
}[] = [
  { name: "Transformers-from-scratch-in-C/CUDA", href: "https://github.com/DipanBartaula/Transformers-implementation-from-scratch-using-C-and-CUDA", desc: "The transformer architecture implemented from first principles.", lang: "CUDA", stars: 3, forks: 1, category: "From-Scratch CUDA/C" },
  { name: "Diffusion-Models-Using-C-CUDA", href: "https://github.com/DipanBartaula/Diffusion-Models-Using-C-CUDA", desc: "DDPM-style diffusion generative models, full C/CUDA implementation.", lang: "CUDA", stars: 2, forks: 0, category: "From-Scratch CUDA/C" },
  { name: "Beta-VAE-from-scratch-in-C/CUDA", href: "https://github.com/DipanBartaula/Disentangled-Variational-AutoEncoders-or-Beta-VAE-using-C-and-CUDA", desc: "Disentangled (β-VAE) variational autoencoders, built from scratch.", lang: "CUDA", stars: 1, forks: 0, category: "From-Scratch CUDA/C" },
  { name: "Real-time-Weather-Analysis-LAMBDA", href: "https://github.com/DipanBartaula/Real-time-Weather-Analysis-LAMBDA-Architecture", desc: "Lambda-architecture flood and heat-wave risk prediction for Nepal's Terai region.", lang: "Python", stars: 3, forks: 0, category: "Systems & Big Data" },
  { name: "MedImage_pipeline (DICOM/NIfTI)", href: "https://github.com/DipanBartaula/MedImage_pipeline-_for_DICOM_NIFTY_preprocessing", desc: "Preprocessing pipeline for medical-imaging data.", lang: "Python", stars: 2, forks: 0, category: "Systems & Big Data" },
  { name: "Julia_CPU_GPU_Benchmark", href: "https://github.com/DipanBartaula/Julia_CPU_GPU_Benchmark", desc: "Benchmark suite comparing Julia and Julia+CUDA.", lang: "Julia", stars: 2, forks: 0, category: "Systems & Big Data" },
];

export type StackItem = { name: string; icon: string | null; note?: string };

export const stackGroups: { title: string; tagline: string; items: StackItem[] }[] = [
  {
    title: "AI / Computer Vision",
    tagline: "Training, fine-tuning and generative modelling",
    items: [
      { name: "PyTorch", icon: "/images/stack/pytorch.svg" },
      { name: "Hugging Face", icon: "/images/stack/huggingface.svg", note: "Transformers · Diffusers · Hub" },
      { name: "Diffusion & LLM fine-tuning", icon: null, note: "LoRA / QLoRA" },
      { name: "RL from verifiable rewards", icon: null, note: "GRPO · RLVR" },
      { name: "OpenCV", icon: "/images/stack/opencv.svg" },
      { name: "SAM · CLIP", icon: "/images/stack/meta.svg" },
      { name: "NeRF · 3D Gaussian Splatting", icon: null, note: "3D reconstruction" },
      { name: "Weights & Biases", icon: "/images/stack/weightsandbiases.svg" },
    ],
  },
  {
    title: "Agentic AI / RAG",
    tagline: "Multi-agent orchestration and retrieval",
    items: [
      { name: "LangChain", icon: "/images/stack/langchain.svg" },
      { name: "LangGraph", icon: "/images/stack/langgraph.svg" },
      { name: "Model Context Protocol", icon: "/images/stack/modelcontextprotocol.svg" },
      { name: "A2A protocol", icon: null, note: "Agent-to-agent" },
      { name: "Pydantic", icon: "/images/stack/pydantic.svg", note: "Typed agent state · tool calling" },
      { name: "Qdrant", icon: "/images/stack/qdrant.svg" },
      { name: "pgvector", icon: "/images/stack/postgresql.svg" },
      { name: "Hybrid retrieval", icon: null, note: "Dense + sparse · reranking" },
    ],
  },
  {
    title: "Inference / Edge AI",
    tagline: "Runtimes, compilers and quantization",
    items: [
      { name: "ONNX Runtime", icon: "/images/stack/onnx.svg" },
      { name: "TensorRT", icon: "/images/stack/nvidia.svg" },
      { name: "CUDA · C++", icon: "/images/stack/cplusplus.svg" },
      { name: "MLX · Core ML", icon: "/images/stack/apple.svg" },
      { name: "LiteRT / TFLite", icon: "/images/stack/tensorflow.svg" },
      { name: "llama.cpp · MLC-LLM", icon: null, note: "On-device LLMs" },
      { name: "Quantization", icon: null, note: "GGUF · INT8/INT4 · AWQ · GPTQ" },
    ],
  },
  {
    title: "Cloud & Data Engineering",
    tagline: "Distributed training and data pipelines",
    items: [
      { name: "Docker", icon: "/images/stack/docker.svg" },
      { name: "Kubernetes", icon: "/images/stack/kubernetes.svg" },
      { name: "AWS", icon: "/images/stack/aws.svg" },
      { name: "Azure Databricks", icon: "/images/stack/databricks.svg" },
      { name: "Apache Spark", icon: "/images/stack/apachespark.svg" },
      { name: "Kafka", icon: "/images/stack/apachekafka.svg" },
      { name: "Airflow", icon: "/images/stack/apacheairflow.svg" },
      { name: "MLflow", icon: "/images/stack/mlflow.svg" },
      { name: "HPC / SLURM", icon: "/images/stack/linux.svg", note: "DDP · FSDP" },
    ],
  },
];

export const results = [
  { metric: "TOP 5", body: "Patternverse Competition (Alternative Technology) — Top 5 Finalist among 50+ competing teams." },
  { metric: "SELECTED", body: "NAAMII Ultrasound AI Hackathon — selected for a competitive international medical AI challenge." },
  { metric: "RANK 1", body: "IEEEXtreme 2024 Winner — Rank 1 in Nepal out of all participating university teams." },
  { metric: "TOP 10", body: "Semicolon MLH Hackathon — Top 10 Finalist among 70+ competing teams." },
  { metric: "SELECTED 30", body: "Samsung Innovation Campus — one of 30 students selected nationally." },
] as const;

export const certificates = [
  {
    src: "/images/cert-deepfusion-reviewer.webp",
    w: 1600,
    title: "Deepfusion Nepal CS Researchers Meetup — Certificate of Appreciation",
    sub: "Paper Reviewer · Mini-Conference by IEEE Computer Society Pulchowk SBC × Deepfusion AI Labs · Aug 2026",
  },
  {
    src: "/images/cert-ieee.webp",
    w: 1005,
    title: "IEEEXtreme 18.0 — Certificate of Participation",
    sub: "Team NoobCoders · ranked #1 among teams from Nepal · 19,000+ participants · Oct 2024",
  },
  {
    src: "/images/cert-samsung.webp",
    w: 2400,
    title: "Samsung Innovation Campus — Big Data",
    sub: "Certificate of Completion · Samsung × Tribhuvan University IOE · Jun–Dec 2025",
  },
] as const;

export const education = [
  {
    yr: "2022 — 2026",
    school: "IOE, Pulchowk Campus — Tribhuvan University",
    deg: "B.E. in Computer Engineering",
    extra: "Training: Big Data Engineering, Generative AI",
    logo: "/images/logo-ioe-sm.webp",
    logoBg: "#ffffff",
  },
  {
    yr: "+2 Science",
    school: "Hetauda School of Management and Social Sciences",
    deg: "Physics, Mathematics, Chemistry, Computer Science",
    extra: "",
    logo: "/images/logo-hsm-sm.webp",
    logoBg: "#1f2433",
  },
] as const;

export const hobbies = [
  {
    title: "Anime",
    sub: "Watching, mostly in queue order",
    image: "/images/hobbies/anime-sm.webp",
    credit: { text: "jsks · CC0", href: "https://commons.wikimedia.org/wiki/File:Red_suit_anime_girl_temple.png" },
  },
  {
    title: "Papers & eng. writing",
    sub: "Papers, blogs, conference talks",
    image: "/images/hobbies/papers.webp",
    credit: null,
  },
  {
    title: "Music",
    sub: "Near-constant background process",
    image: "/images/hobbies/music-sm.webp",
    credit: { text: "Shixart1985 · CC BY 2.0", href: "https://commons.wikimedia.org/wiki/File:Enjoying_a_cozy_afternoon_with_coffee_and_vinyl_records_at_home.jpg" },
  },
  {
    title: "Markets",
    sub: "Tracking & trading financial markets",
    image: "/images/hobbies/markets.webp",
    credit: null,
  },
] as const;

/** Competitions shown as an orbit below the Results list. */
export const competitions = [
  { name: "Patternverse — Alternative Technology", logo: "/images/logo-alttech.png", bg: "#ffffff" },
  { name: "NAAMII Ultrasound AI Hackathon", logo: "/images/logo-naamii.svg", bg: "#ffffff" },
  { name: "IEEEXtreme 18.0", logo: "/images/logo-ieeextreme-sm.webp", bg: "#ffffff" },
  { name: "Semicolon — MLH Hackathon", logo: "/images/stack/majorleaguehacking.svg", bg: "#ffffff" },
] as const;

export const contactLinks = {
  email: "deepanzcreed001@gmail.com",
  emailAlt: "078bct040.dipan@pcampus.edu.np",
  github: "https://github.com/DipanBartaula",
  linkedin: "https://linkedin.com/in/dipan-bartaula",
  cv: "/Dipan_Bartaula_CV.pdf",
  instagram: "https://www.instagram.com/dipanbartaula/",
  // Paste your Facebook profile URL here (e.g. "https://www.facebook.com/<username>");
  // the Facebook pill only renders once this is non-empty.
  facebook: "",
  location: "Pulchowk, Lalitpur, Nepal",
};
