export const sections = [
  { id: "about", label: "Abstract", navLabel: "Abstract", idx: "§0" },
  { id: "education", label: "Education", navLabel: "Education", idx: "§1" },
  { id: "research", label: "Research", navLabel: "Research", idx: "§2" },
  { id: "log", label: "Log", navLabel: "Log", idx: "§3" },
  { id: "projects", label: "Projects", navLabel: "Projects", idx: "§4" },
  { id: "results", label: "Results", navLabel: "Results", idx: "§5" },
  { id: "stack", label: "Stack", navLabel: "Stack", idx: "§6" },
  { id: "code", label: "Code", navLabel: "Code", idx: "§7" },
  { id: "toys", label: "Toy Projects", navLabel: "Toys", idx: "§8" },
  { id: "hobbies", label: "Off the Clock", navLabel: "Hobbies", idx: "§9" },
  { id: "contact", label: "Contact", navLabel: "Contact", idx: "" },
] as const;

export const summary =
  "Data Scientist, AI Engineer, and Researcher with 2+ years of combined industry, research, and freelance experience across machine learning, Generative AI, NLP, RAG, Computer Vision, 3D Vision, Virtual Try-On, and Generative Modeling. Hands-on with Python, SQL, PyTorch, MLflow, Azure Databricks/Spark, MLOps, production deployments, HPC-scale training, structured tool calling, typed agent state, MCP/A2A protocols, and production retrieval/serving patterns. Proven track record of architecting multi-agent orchestration systems, training and fine-tuning LLMs with verifiable reward signals, and building end-to-end pipelines that bridge language-driven reasoning with real-world execution. Research contributions include two papers under review, one introducing the largest virtual try-on benchmark to date. Equally comfortable operating at the systems level — distributed training, cloud infrastructure, and large-scale data engineering — and at the research frontier.";

export const logEntries = [
  {
    date: "Feb 2026 — present",
    duration: "8 months",
    role: "Founding Research Engineer (Part-time)",
    org: "AI Lab Pvt. Ltd.",
    logo: "/images/logo-ailab.png",
    logoBg: "#ffffff",
    desc: "Researching a code-mixed Nepali–English–Medical speech recognition system for streaming, edge-device deployment: low-latency inference pipeline design, model distillation for edge-deployable ASR backbones without accuracy loss, large-scale SFT data pipeline construction, and a custom benchmark suite for accented, domain-specific, streaming ASR evaluation.",
  },
  {
    date: "Jan 2026 — present",
    duration: "9 months",
    role: "Research Engineer",
    org: "NAAMII Multimodal Learning Lab",
    logo: "/images/logo-naamii.svg",
    logoBg: "#ffffff",
    desc: "Researching Edge AI and world models alongside medical imaging, reproducing and stress-testing SOTA multimodal models while resolving bottlenecks in optimization, data pipelines, and GPU memory. Deployed distributed SLURM/AWS training infrastructure with mixed-precision, gradient checkpointing, and unified MLflow/WandB tracking. Provisioned and managed rented GPU instances across RunPod, Vast.ai, and Lightning AI, with checkpoint persistence and cost-aware instance selection and teardown.",
  },
  {
    date: "Jun — Dec 2025",
    duration: "7 months",
    role: "Junior Research Engineer",
    org: "Accelerated Komputing",
    logo: "/images/logo-ank.png",
    logoBg: "#111111",
    desc: "Architected DAG-based multi-agent LLM orchestration decomposing engineering queries into reasoning graphs for CAD/CAE automation. Built closed-loop LLM–FEM pipelines for autonomous tool invocation and self-correction; led NVIDIA Isaac GR00T integration with constrained decoding for human-free execution.",
  },
  {
    date: "Feb 2024 — Dec 2025",
    duration: "23 months",
    role: "Freelance AI Engineer & Technical Instructor",
    org: "Independent",
    logo: "/images/logo-freelance.svg",
    logoBg: "#ffffff",
    desc: "Built a voice-to-video system with LLM script generation, diffusion-based lip sync, and mel-spectrogram-to-landmark alignment for identity-consistent, temporally stable output. Delivered 255+ hours of instruction across Data Science, Python, prompt engineering, and Agentic AI/RAG. Integrated AI agents into client workflows via structured tool-calling, shared typed state, DAG orchestration, and execution-feedback loops. Built a skin-analysis system classifying 21+ conditions with severity estimation and an ingredient-based recommendation engine; separately benchmarked 3D part segmentation across point cloud, mesh, and implicit representations. Collaborated with an engineer at Bigtincan on applied computer-vision research.",
  },
] as const;

export const research = [
  {
    id: "curvton",
    fig: "FIG. 01",
    status: { label: "Under anonymous review", tone: "accent2" as const },
    title: "CURVTON-205K: A Scalable Mask-Free Synthetic Dataset for Virtual Try-On",
    role: "First Author",
    compute: "4,500 H200 GPU-hours",
    desc: [
      "Introduces the largest virtual try-on benchmark to date (205K+ samples), establishing a new state-of-the-art in dataset diversity across poses, occlusions, illumination conditions, background density, and garment categories — entirely mask-free. Evaluation transparency is enforced via stratification into difficulty tiers, enabling rigorous benchmarking across the full distribution of generation challenge rather than aggregate metrics alone. Dataset artifacts and trained model checkpoints are published to the Hugging Face Hub, including Croissant/metadata files and repository documentation.",
    ],
    inlineImage: {
      src: "/images/curvton-results.png",
      caption: "Feedback-loop iterations over the source person and garment images",
    },
    images: [
      { src: "/images/curvton-pipeline.png", caption: "Synthetic data generation & editing pipeline", wide: true },
      { src: "/images/curvton-teaser.png", caption: "Source person, target garment, and composited result" },
    ],
  },
  {
    id: "dreamcloth",
    fig: "FIG. 02",
    status: { label: "Under anonymous review", tone: "accent2" as const },
    title: "DreamCloth: Inverse Estimation of Cloth Simulation Parameters via Video Priors",
    role: "First Author",
    compute: "500 H200 GPU-hours",
    desc: [
      "DreamCloth asks whether a frozen video-generation model can act as the objective for inverse physics. From one monocular image it reconstructs an SMPL-X body proxy and garment mesh, discretises the garment into material points, and rolls it out in a differentiable codimensional MPM simulator with frictional body contact. A frozen rectified-flow video prior (Wan2.1-T2V, LTX-Video) scores the rendered rollout, and gradients flow back through renderer and simulator into four explicit, re-simulatable parameters — density, stretching stiffness, shell thickness and friction — with no tracked supervision and no weights trained.",
      "The core idea is structural counterfactual score factorization. A raw video score entangles appearance and body motion with the cloth dynamics the solver controls, so DreamCloth renders a matched 2×2 lattice — clothed rollout, static clothed frame, garment-free moving body, garment-free static body — scores all four under one shared noise draw and takes the (+, −, −, +) mixed difference, which cancels every nuisance main effect exactly and isolates the garment–motion interaction. On ActorsHQ and 4D-DRESS this beats direct score distillation on held-out geometry (Chamfer 0.606→0.468, 0.507→0.375), while the paper keeps behavioral identification explicitly separate from claiming unique material constants.",
    ],
    inlineImage: null,
    images: [
      { src: "/images/dreamcloth-pipeline.png", caption: "Overview: monocular input to optimized material parameters", wide: true },
      { src: "/images/dreamcloth-stage1.png", caption: "Stage 1 — from images to a classified 3D particle volume" },
    ],
  },
] as const;

export const projects = [
  {
    title: "Agentic ML System",
    subtitle: "Autonomous end-to-end machine-learning pipeline",
    image: "/images/projects/agentic-ml.jpg",
    accent: "#7c3aed",
    summary:
      "A multi-agent system that runs the whole machine-learning lifecycle from a single natural-language request. Domain-specialised LLM agents own each phase — EDA, preprocessing, feature engineering, model selection and monitoring — and hand off through shared typed state and a structured tool-calling protocol. A meta-learner reads a dataset's geometry and statistics to choose algorithms without exhaustive search, Bayesian optimisation with GP surrogates tunes hyperparameters, and drift detectors (KS-test, PSI) trigger retraining while SHAP/PDP explanations are produced by default. It cut manual ML engineering effort by 70%+ and ships production-ready pipelines with minimal supervision.",
  },
  {
    title: "CAD/CAE Agents & RLVR",
    subtitle: "Reinforcement learning from verifiable rewards for simulation code",
    image: "/images/projects/cad-cae.jpg",
    accent: "#f97316",
    summary:
      "An agentic system that turns free-form engineering descriptions into runnable structural, thermal and fluid simulations. An LLM parsing layer extracts structured configs — geometry, materials, boundary conditions, solver settings — validated against a domain ontology; the code generator adds symbolic pre-execution checks (units, boundary completeness, mesh–solver compatibility) and refinement loops that adjust mesh, time-stepping or tolerances when a run fails to converge. The code model (Qwen) was trained with QLoRA SFT and GRPO-based RL from verifiable rewards — code-execution outcomes plus multimodal 3D understanding — over an asynchronous rollout pipeline with KL regularisation, and solver logs are parsed to localise failures for self-repair, all within a consumer-GPU memory footprint.",
  },
  {
    title: "DeepFit",
    subtitle: "Diffusion-based virtual try-on",
    image: "/images/projects/deepfit.jpg",
    accent: "#e11d48",
    summary:
      "A diffusion virtual try-on system built on Stable Diffusion 1.5. Pose-conditioned attention keeps the garment locked to the wearer's articulation, and LoRA fine-tuning adapts the model with 90% fewer trainable parameters on a single 24 GB GPU. The pipeline runs human parsing → CLIP feature extraction → appearance-flow estimation with thin-plate-spline warping → diffusion inpainting, so the garment is first deformed to the body's geometry and then painted in photorealistically. It delivers geometry-preserving garment transfer competitive with systems using twice the compute, with pixel-space and latent-space conditioning compared along the way, and ships as a reproducible config-driven pipeline served through a Flask REST API with versioned checkpoints.",
  },
  {
    title: "3D Asset Editing Pipeline",
    subtitle: "Text-driven modification of NeRF & Gaussian-splat scenes",
    image: "/images/projects/asset-edit.jpg",
    accent: "#10b981",
    summary:
      "A pipeline for editing a 3D asset with a text prompt. The edit is first made in image space with Qwen-Edit 2509 and HunyuanDiT — where generative editors are strongest — and then propagated into NeRF and 3D Gaussian Splatting scenes through score distillation sampling with multi-view consensus averaging, so every viewpoint agrees on the change instead of drifting. CLIP+SAM segmentation confines the edit to the intended region, and Flash Attention with model parallelism keeps high-splat-count scenes tractable. The result is intuitive, view-consistent 3D content editing that lowers the technical barrier for production asset pipelines.",
  },
  {
    title: "On-Device Edge AI",
    subtitle: "Efficient RAG, model portability & mobile vision",
    image: "/images/projects/edge-ai.jpg",
    accent: "#06b6d4",
    summary:
      "A fully on-device stack with no cloud dependence. TurboVec provides a compact, high-throughput vector database for low-latency retrieval, paired with proactive video processing that prunes redundant computation. Models are made portable with ONNX and TensorRT and deployed to iOS and Android through MLX compilation and ONNX Runtime, and MobileOne (featured at CVPR 2026) was fine-tuned for deepfake detection and medical imaging within tight mobile compute and memory budgets — guided by per-operator latency and memory profiling for graph optimisation and quantisation.",
  },
  {
    title: "AI Agents Integration & Engineering",
    subtitle: "Tool-calling, orchestration & reliability",
    image: "/images/projects/agents.jpg",
    accent: "#f59e0b",
    summary:
      "Reusable agent integrations for ML and engineering workflows built on structured tool and function calling, shared typed state, DAG-based orchestration, MCP/A2A protocols and constrained decoding. Execution-driven self-correction loops inspect tool outputs, propagate structured results between agents and route failures back through the reasoning graph, so a workflow recovers from a bad step instead of halting on it.",
  },
] as const;

/** Smaller, self-contained builds — fun, finished, and on GitHub. */
export const toyProjects = [
  {
    title: "LLM-Driven Lecture Video Adaptation",
    subtitle: "Playback that slows for the hard parts and speeds through the easy ones",
    image: "/images/toys/lecture-video.svg",
    href: "https://github.com/DipanBartaula/Lecture-Optimization-Via-LLM-based-video-adaptation",
    tags: ["Python", "WhisperX", "GPT o4-mini", "Flask", "Cloudinary"],
    summary:
      "A pipeline that re-times lecture videos to how difficult each moment actually is. WhisperX transcribes the audio, an LLM (OpenAI's o4-mini) rates the difficulty of each topic segment, and the video is recompiled with smoothly varying playback speed — slower through dense material, faster through the easy stretches — while keeping the audio intelligible. The result is uploaded to Cloudinary and served through a small Flask API, with a command-line interface for batch processing.",
  },
  {
    title: "8085 Microprocessor Simulator",
    subtitle: "Assembly in, register and memory state out — step by step",
    image: "/images/toys/sim-8085.svg",
    href: "https://github.com/DipanBartaula/Microprocess-8085-Simulation-Backend",
    tags: ["C#", "ASP.NET Core", "Node.js", "DSA project"],
    summary:
      "A full-stack simulator for the Intel 8085. The ASP.NET Core backend parses 8085 assembly, executes it instruction by instruction, and exposes the machine state; a Node.js front end visualises registers and memory in real time and lets you step through a program to debug it. Built as a data-structures-and-algorithms project — the parser, execution loop and memory model are the point — and released under MIT.",
  },
] as const;

export type RepoCategory =
  | "Physics & Simulation"
  | "Generative AI & Agents"
  | "From-Scratch CUDA/C"
  | "Systems & Big Data";

export const repoCategories: RepoCategory[] = [
  "Physics & Simulation",
  "Generative AI & Agents",
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
  { name: "CAE_Physics_Simulations_Agent", href: "https://github.com/DipanBartaula/CAE_Physics_Simulations_Agent", desc: "Agentic system that writes and runs Julia simulation scripts for CAE tasks, on CPU and GPU.", lang: "Python", stars: 2, forks: 1, category: "Physics & Simulation" },
  { name: "MPM-Simulation-human-cloth-mesh", href: "https://github.com/DipanBartaula/MPM-Simulation-human-cloth-mesh", desc: "Soft-tissue and cloth dynamics via the Material Point Method.", lang: "Python", stars: 0, forks: 0, category: "Physics & Simulation" },
  { name: "ClothSimPriori", href: "https://github.com/DipanBartaula/ClothSimPriori", desc: "Cloth-physics parameter estimation guided by prior knowledge.", lang: "Python", stars: 1, forks: 0, category: "Physics & Simulation" },
  { name: "GRPO-CADesigner", href: "https://github.com/DipanBartaula/GRPO-CADesigner", desc: "RL (GRPO)-trained LLM that writes accurate CADQuery scripts.", lang: "Python", stars: 2, forks: 1, category: "Generative AI & Agents" },
  { name: "CLI-Automation", href: "https://github.com/DipanBartaula/CLI-Automation", desc: "Agentic CLI automation built on the OpenAI Agents SDK.", lang: "Python", stars: 3, forks: 1, category: "Generative AI & Agents" },
  { name: "AssetEdit_Pipeline", href: "https://github.com/DipanBartaula/AssetEdit_Pipeline", desc: "End-to-end pipeline for 3D asset editing.", lang: "Python", stars: 2, forks: 2, category: "Generative AI & Agents" },
  { name: "QWEN-2.5-Instruct-Finetuning", href: "https://github.com/DipanBartaula/QWEN-2.5-Instruct-Finetuning", desc: "QLoRA fine-tuning of Qwen 2.5 Instruct.", lang: "Python", stars: 1, forks: 0, category: "Generative AI & Agents" },
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
    src: "/images/cert-ieee.png",
    title: "IEEEXtreme 18.0 — Certificate of Participation",
    sub: "Team NoobCoders · ranked #1 among teams from Nepal · 19,000+ participants · Oct 2024",
  },
  {
    src: "/images/cert-samsung.png",
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
    logo: "/images/logo-ioe.png",
    logoBg: "#ffffff",
  },
  {
    yr: "+2 Science",
    school: "Hetauda School of Management and Social Sciences",
    deg: "Physics, Mathematics, Chemistry, Computer Science",
    extra: "",
    logo: "/images/logo-hsm.png",
    logoBg: "#1f2433",
  },
] as const;

export const hobbies = [
  {
    title: "Anime",
    sub: "Watching, mostly in queue order",
    image: "/images/hobbies/anime.png",
    credit: { text: "jsks · CC0", href: "https://commons.wikimedia.org/wiki/File:Red_suit_anime_girl_temple.png" },
  },
  {
    title: "Papers & eng. writing",
    sub: "Papers, blogs, conference talks",
    image: "/images/hobbies/papers.svg",
    credit: null,
  },
  {
    title: "Music",
    sub: "Near-constant background process",
    image: "/images/hobbies/music.jpg",
    credit: { text: "Shixart1985 · CC BY 2.0", href: "https://commons.wikimedia.org/wiki/File:Enjoying_a_cozy_afternoon_with_coffee_and_vinyl_records_at_home.jpg" },
  },
  {
    title: "Markets",
    sub: "Tracking & trading financial markets",
    image: "/images/hobbies/markets.svg",
    credit: null,
  },
] as const;

/** Competitions shown as an orbit below the Results list. */
export const competitions = [
  { name: "Patternverse — Alternative Technology", logo: "/images/logo-alttech.png", bg: "#ffffff" },
  { name: "NAAMII Ultrasound AI Hackathon", logo: "/images/logo-naamii.svg", bg: "#ffffff" },
  { name: "IEEEXtreme 18.0", logo: "/images/logo-ieeextreme.png", bg: "#ffffff" },
  { name: "Semicolon — MLH Hackathon", logo: "/images/stack/majorleaguehacking.svg", bg: "#ffffff" },
] as const;

export const contactLinks = {
  email: "deepanzcreed001@gmail.com",
  emailAlt: "078bct040.dipan@pcampus.edu.np",
  github: "https://github.com/DipanBartaula",
  linkedin: "https://linkedin.com/in/dipan-bartaula",
  instagram: "https://www.instagram.com/dipanbartaula/",
  // Paste your Facebook profile URL here (e.g. "https://www.facebook.com/<username>");
  // the Facebook pill only renders once this is non-empty.
  facebook: "",
  location: "Pulchowk, Lalitpur, Nepal",
};
