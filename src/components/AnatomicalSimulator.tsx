import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Eye, 
  AlertCircle, 
  Info, 
  Layers, 
  Sliders, 
  Compass, 
  Check, 
  HelpCircle,
  Volume2,
  Sun,
  Maximize2,
  ZoomIn,
  Tv,
  Grid,
  Heart
} from "lucide-react";

interface AnatomicalSimulatorProps {
  questionText: string;
  specialty: string;
  selectedAnswerIndex: number | null;
  isSubmitted: boolean;
  correctAnswerIndex: number;
}

interface Hotspot {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  normalDesc: string;
  pathologyDesc: string;
}

interface SystemConfig {
  name: string;
  image: string;
  pathologyLabel: string;
  waveType: "cardio" | "respiratory" | "neuro" | "reproductive" | "nephrology" | "digestive" | "ortho" | "endocrine";
  normalVitals: { label: string; value: string }[];
  pathologyVitals: { label: string; value: string }[];
  hotspots: Hotspot[];
}

const SYSTEM_IMAGES = {
  Cardiovascular: "/src/assets/images/cardio_simulation_1782492064510.jpg",
  Respiratory: "/src/assets/images/pulmo_simulation_1782492084090.jpg",
  Nervous: "/src/assets/images/neuro_simulation_1782492104992.jpg",
  Reproductive: "/src/assets/images/obgyn_simulation_1782492123527.jpg",
  Nephrology: "/src/assets/images/nephro_simulation_1782492139486.jpg",
  Digestive: "/src/assets/images/gastro_simulation_1782492160980.jpg",
  Musculoskeletal: "/src/assets/images/ortho_simulation_1782492184456.jpg",
  Endocrine: "/src/assets/images/endo_simulation_1782492213629.jpg"
};

const SYSTEM_CONFIGS: Record<string, SystemConfig> = {
  Cardiovascular: {
    name: "Cardiovascular System",
    image: SYSTEM_IMAGES.Cardiovascular,
    pathologyLabel: "Infarction / Valvular Pressure Remodeling",
    waveType: "cardio",
    normalVitals: [
      { label: "Cardiac Rhythm", value: "Normal Sinus (SR)" },
      { label: "Myocardial Wall", value: "Normal Thickness (1.0cm)" },
      { label: "Intracardiac Pressure", value: "Normal Gradients" },
      { label: "Stroke Volume", value: "70 mL" }
    ],
    pathologyVitals: [
      { label: "Cardiac Rhythm", value: "Arrhythmogenic / Scooped ST" },
      { label: "Myocardial Wall", value: "Concentric Remodeling (1.4cm)" },
      { label: "Intracardiac Pressure", value: "Severe Gradient Overload" },
      { label: "Stroke Volume", value: "48 mL (Compensated)" }
    ],
    hotspots: [
      {
        id: "aortic_valve",
        name: "Aortic Valve",
        x: 48,
        y: 45,
        normalDesc: "Trileaflet structure opening smoothly with a valve area > 2.0 cm² and negligible systolic pressure gradient.",
        pathologyDesc: "Severe calcification, thickened leaflets, and narrow orifice area (< 0.8 cm²). Creates a harsh systolic murmur and substantial pressure overload."
      },
      {
        id: "left_ventricle",
        name: "Left Ventricle Myocardium",
        x: 62,
        y: 65,
        normalDesc: "Standard left ventricular mass, normal compliance, and symmetric wall thickness (~1.0 cm).",
        pathologyDesc: "Concentric left ventricular hypertrophy. Thickened walls (1.4 cm+) to overcome outlet obstruction (Laplace's Law), causing diastolic dysfunction."
      },
      {
        id: "mitral_valve",
        name: "Mitral Valve",
        x: 40,
        y: 54,
        normalDesc: "Anterior and posterior mitral leaflets open widely during diastole to allow unobstructed left atrial emptying.",
        pathologyDesc: "Thickened, restricted leaflets, often fused commissures from childhood rheumatic fever, producing a loud diastolic rumble and opening snap."
      }
    ]
  },
  Respiratory: {
    name: "Respiratory System",
    image: SYSTEM_IMAGES.Respiratory,
    pathologyLabel: "Atelectasis / Airway Constriction",
    waveType: "respiratory",
    normalVitals: [
      { label: "Intrapleural Pressure", value: "-5 cm H2O (Negative)" },
      { label: "Spirometry (FEV1/FVC)", value: "0.82 (Normal)" },
      { label: "Oxygen Saturation", value: "98% on Room Air" },
      { label: "Respiratory Rate", value: "14 / min" }
    ],
    pathologyVitals: [
      { label: "Intrapleural Pressure", value: "+4 cm H2O (Tension)" },
      { label: "Spirometry (FEV1/FVC)", value: "0.55 (Severe Obstruction)" },
      { label: "Oxygen Saturation", value: "89% (Hypoxemic)" },
      { label: "Respiratory Rate", value: "26 / min (Tachypnea)" }
    ],
    hotspots: [
      {
        id: "pleural_cavity",
        name: "Pleural Cavity",
        x: 25,
        y: 50,
        normalDesc: "Virtual space filled with a microscopic layer of pleural fluid, maintaining negative pressure during inspiration.",
        pathologyDesc: "Tension Pneumothorax. Accumulation of air under pressure from a one-way valve leak, compressing lung parenchyma and shifting the mediastinum."
      },
      {
        id: "bronchi",
        name: "Bronchial Airway",
        x: 50,
        y: 42,
        normalDesc: "Wide, patent bronchial tree with relaxation of smooth muscles and normal air conductance.",
        pathologyDesc: "Severe Bronchospasm. Smooth muscle contraction, mucosal edema, and mucus plugging leading to expiratory wheezing and air trapping."
      },
      {
        id: "larynx_trachea",
        name: "Laryngotracheal Tract",
        x: 50,
        y: 25,
        normalDesc: "Unobstructed subglottic airway providing seamless flow of air into the mainstem bronchi.",
        pathologyDesc: "Croup (Laryngotracheobronchitis). Inflammatory subglottic narrowing ('steeple sign'), producing a classic barking cough and inspiratory stridor."
      }
    ]
  },
  Nervous: {
    name: "Nervous System",
    image: SYSTEM_IMAGES.Nervous,
    pathologyLabel: "Epileptiform Synchrony / Cortical Shock",
    waveType: "neuro",
    normalVitals: [
      { label: "Synaptic Sync Rate", value: "Desynchronized Alpha/Beta" },
      { label: "Cerebral Perfusion", value: "55 mL/100g/min" },
      { label: "Metabolic Glucose Rate", value: "Baseline Normal" },
      { label: "Intracranial Pressure", value: "10 mmHg (Normal)" }
    ],
    pathologyVitals: [
      { label: "Synaptic Sync Rate", value: "Hypersynchronous Spike-and-Wave" },
      { label: "Cerebral Perfusion", value: "Hyperemic (Ictal Phase)" },
      { label: "Metabolic Glucose Rate", value: "Elevated 250% (Seizure)" },
      { label: "Intracranial Pressure", value: "18 mmHg (Borderline)" }
    ],
    hotspots: [
      {
        id: "cortex",
        name: "Cerebral Cortex",
        x: 55,
        y: 35,
        normalDesc: "Normal electrical potentials with complex feedback systems preventing generalized firing.",
        pathologyDesc: "Epileptogenesis. Paroxysmal depolarizing shifts with loss of GABAergic inhibition, triggering generalized seizure discharges."
      },
      {
        id: "meninges",
        name: "Meningeal Layers",
        x: 50,
        y: 18,
        normalDesc: "Pia, arachnoid, and dura mater encasing the brain without swelling, allowing regular CSF circulation.",
        pathologyDesc: "Acute Meningitis. Severe bacterial/viral inflammation causing leukocyte infiltration, photophobia, nuchal rigidity, and CSF turbidity."
      }
    ]
  },
  Reproductive: {
    name: "Reproductive & Gestational",
    image: SYSTEM_IMAGES.Reproductive,
    pathologyLabel: "Gestational Vasospasm / Preeclampsia",
    waveType: "reproductive",
    normalVitals: [
      { label: "Uterine Perfusion", value: "High Flow, Low Resistance" },
      { label: "Fetal Heart Rate Baseline", value: "140 bpm (Reactive)" },
      { label: "Uterine Tone", value: "Quiescent (Resting)" },
      { label: "Systemic Endothelial Flow", value: "Physiologically Vasodilated" }
    ],
    pathologyVitals: [
      { label: "Uterine Perfusion", value: "Vasospastic, High Resistance" },
      { label: "Fetal Heart Rate Baseline", value: "115 bpm (Late Decelerations)" },
      { label: "Uterine Tone", value: "Irritable Contractions" },
      { label: "Systemic Endothelial Flow", value: "Generalized Endothelial Injury" }
    ],
    hotspots: [
      {
        id: "placenta",
        name: "Placental Interface",
        x: 54,
        y: 48,
        normalDesc: "High-flow spiral arteries thoroughly remodeled by trophoblasts to support optimal nutrient and oxygen exchange.",
        pathologyDesc: "Defective spiral artery remodeling in preeclampsia. Leads to chronic placental hypoxia, release of anti-angiogenic factors (sFlt-1), and systemic vasospasm."
      },
      {
        id: "myometrium",
        name: "Myometrium",
        x: 44,
        y: 58,
        normalDesc: "Relaxed uterine muscle controlled by progesterone dominance in the third trimester.",
        pathologyDesc: "Uterine hyper-irritability. Frequent contractions, reduced uterine blood flow during peaks, predisposing to fetal distress."
      }
    ]
  },
  Nephrology: {
    name: "Renal & Urinary System",
    image: SYSTEM_IMAGES.Nephrology,
    pathologyLabel: "Glomerular Barrier Degradation",
    waveType: "nephrology",
    normalVitals: [
      { label: "Glomerular Filtration Rate", value: "110 mL/min/1.73m²" },
      { label: "Protein Excretion", value: "< 150 mg / day (Negligible)" },
      { label: "Afferent Arteriole Tone", value: "Normal Autoregulation" },
      { label: "BUN / Creatinine", value: "12 / 0.8 mg/dL" }
    ],
    pathologyVitals: [
      { label: "Glomerular Filtration Rate", value: "45 mL/min (Reduced)" },
      { label: "Protein Excretion", value: "> 3.5 g / day (Nephrotic Range)" },
      { label: "Afferent Arteriole Tone", value: "Constricted / Ischemic" },
      { label: "BUN / Creatinine", value: "42 / 2.3 mg/dL" }
    ],
    hotspots: [
      {
        id: "glomerulus",
        name: "Glomerular Basement Membrane",
        x: 52,
        y: 44,
        normalDesc: "Intact podocyte foot processes and negatively charged slit diaphragms that block protein filtration.",
        pathologyDesc: "Podocyte effacement and loss of negative charge barrier. Causes severe proteinuria, leading to hypoalbuminemia and systemic edema."
      },
      {
        id: "renal_tubules",
        name: "Renal Tubules",
        x: 48,
        y: 62,
        normalDesc: "Efficient reabsorption of water, electrolytes, and glucose from glomerular ultrafiltrate.",
        pathologyDesc: "Acute Tubular Necrosis (ATN). Ischemic/toxic sloughing of epithelial cells into lumen, forming muddy brown granular casts."
      }
    ]
  },
  Digestive: {
    name: "Gastrointestinal System",
    image: SYSTEM_IMAGES.Digestive,
    pathologyLabel: "Gastrointestinal Mucosal Inflammation",
    waveType: "digestive",
    normalVitals: [
      { label: "Gastric Luminal pH", value: "1.5 - 2.0 (Acidic)" },
      { label: "Peristaltic Activity", value: "3 cycles / min (Regulated)" },
      { label: "Biliary Secretion Flow", value: "Unobstructed Duodenal Flow" },
      { label: "Pancreatic Enzymes", value: "Inactive in Parenchyma" }
    ],
    pathologyVitals: [
      { label: "Gastric Luminal pH", value: "1.0 (Hypersecretory)" },
      { label: "Peristaltic Activity", value: "Hyperactive / Spasmodic" },
      { label: "Biliary Secretion Flow", value: "Obstructed (Choledocholithiasis)" },
      { label: "Pancreatic Enzymes", value: "Autodigestion Triggered" }
    ],
    hotspots: [
      {
        id: "stomach_mucosa",
        name: "Gastric Mucosa",
        x: 45,
        y: 42,
        normalDesc: "Thick bicarbonate-rich mucus layer shielding the gastric epithelium from corrosive hydrochloric acid.",
        pathologyDesc: "Erosive Gastritis / Peptic Ulcer. Breach in the protective mucosa due to NSAID inhibition of PGE2 or Helicobacter pylori colonization."
      },
      {
        id: "pancreas",
        name: "Pancreatic Acinar Cells",
        x: 55,
        y: 50,
        normalDesc: "Zymogens synthesized and exported as inactive precursors to be activated only in the small intestine.",
        pathologyDesc: "Acute Pancreatitis. Intracellular trypsinogen activation causing severe autodigestion, fat necrosis, and acute epigastric pain radiating to back."
      }
    ]
  },
  Musculoskeletal: {
    name: "Musculoskeletal & Joint",
    image: SYSTEM_IMAGES.Musculoskeletal,
    pathologyLabel: "Articular Friction & Joint Instability",
    waveType: "ortho",
    normalVitals: [
      { label: "Joint Friction Coefficient", value: "0.002 (Virtually Zero)" },
      { label: "Synovial Fluid Volume", value: "Normal, High Viscosity" },
      { label: "Trabecular Density", value: "Sufficient Strength" },
      { label: "Articular Cartilage", value: "Smooth & Hydrogel-rich" }
    ],
    pathologyVitals: [
      { label: "Joint Friction Coefficient", value: "0.085 (High Wear)" },
      { label: "Synovial Fluid Volume", value: "Inflammatory Effusion" },
      { label: "Trabecular Density", value: "Osteoporotic Microfractures" },
      { label: "Articular Cartilage", value: "Fibrillated, Denuded Bone" }
    ],
    hotspots: [
      {
        id: "articular_cartilage",
        name: "Articular Cartilage",
        x: 48,
        y: 52,
        normalDesc: "Polished collagen-proteoglycan matrix cushioning the load and enabling smooth low-friction joint movement.",
        pathologyDesc: "Osteoarthritis. Cartilage degradation, joint space narrowing, subchondral sclerosis, and painful bone-on-bone friction."
      },
      {
        id: "bone_density",
        name: "Trabecular Microarchitecture",
        x: 52,
        y: 35,
        normalDesc: "Thick, interconnected bone trabeculae optimized for weight-bearing force distribution.",
        pathologyDesc: "Osteoporosis / Fracture. Severe bone resorption exceeding osteoblastic formation, weakening structural matrix under load."
      }
    ]
  },
  Endocrine: {
    name: "Endocrine & Metabolic",
    image: SYSTEM_IMAGES.Endocrine,
    pathologyLabel: "Metabolic Hyper-regulation / Receptor Fatigue",
    waveType: "endocrine",
    normalVitals: [
      { label: "Free T4 Hormone Level", value: "1.2 ng/dL (Normal)" },
      { label: "Thyrotropin (TSH)", value: "2.1 uIU/mL" },
      { label: "Basal Metabolic Rate", value: "1800 kcal / day" },
      { label: "Systemic Adrenergic Tone", value: "Balanced Homeostasis" }
    ],
    pathologyVitals: [
      { label: "Free T4 Hormone Level", value: "4.5 ng/dL (Thyrotoxic)" },
      { label: "Thyrotropin (TSH)", value: "< 0.01 uIU/mL (Suppressed)" },
      { label: "Basal Metabolic Rate", value: "3400 kcal / day (Hyperactive)" },
      { label: "Systemic Adrenergic Tone", value: "Upregulated (Tachycardia)" }
    ],
    hotspots: [
      {
        id: "thyroid_gland",
        name: "Thyroid Gland",
        x: 50,
        y: 36,
        normalDesc: "Normal size, utilizing iodine to synthesize thyroid hormones (T3 and T4) regulated strictly by pituitary TSH.",
        pathologyDesc: "Graves Disease / Goiter. Autoantibodies (TSI) stimulate the TSH receptor, causing unrestrained synthesis of T4, heat intolerance, and exophthalmos."
      },
      {
        id: "adrenals",
        name: "Adrenal Cortex",
        x: 45,
        y: 58,
        normalDesc: "Regulated ACTH-mediated release of cortisol, aldosterone, and weak androgens as needed.",
        pathologyDesc: "Cushing Syndrome. Cortisol excess leading to protein wasting, muscle weakness, centripetal obesity, and striae."
      }
    ]
  }
};

type Modality = "schema" | "radiology" | "histology" | "ultrasound";

export default function AnatomicalSimulator({
  questionText,
  specialty,
  selectedAnswerIndex,
  isSubmitted,
  correctAnswerIndex
}: AnatomicalSimulatorProps) {
  const [activeSystem, setActiveSystem] = useState<SystemConfig>(SYSTEM_CONFIGS.Cardiovascular);
  const [viewMode, setViewMode] = useState<"normal" | "pathology">("normal");
  const [modality, setModality] = useState<Modality>("schema");
  
  // Custom workstation states
  const [brightness, setBrightness] = useState(100); // 50 to 150 %
  const [contrast, setContrast] = useState(100);   // 50 to 150 %
  const [zoom, setZoom] = useState(100);           // 100 to 200 %
  const [enableCalipers, setEnableCalipers] = useState(false);
  const [dopplerAudio, setDopplerAudio] = useState(false);
  
  // Interactive pinpoint spotlight for Radiology
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHoveringViewport, setIsHoveringViewport] = useState(false);

  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Auto-detect system based on question text and specialty keywords
  useEffect(() => {
    const text = (questionText + " " + specialty).toLowerCase();
    let matchedSystemKey = "Cardiovascular";

    if (
      text.includes("pneumothorax") || 
      text.includes("lung") || 
      text.includes("trachea") || 
      text.includes("respiratory") || 
      text.includes("bronchial") || 
      text.includes("asthma") || 
      text.includes("copd") || 
      text.includes("croup") || 
      text.includes("stridor") || 
      text.includes("pleura") ||
      text.includes("cough") ||
      text.includes("pulmonology")
    ) {
      matchedSystemKey = "Respiratory";
    } else if (
      text.includes("brain") || 
      text.includes("stroke") || 
      text.includes("seizure") || 
      text.includes("epilepsy") || 
      text.includes("neurology") || 
      text.includes("meningitis") ||
      text.includes("psychiatry") ||
      text.includes("headache")
    ) {
      matchedSystemKey = "Nervous";
    } else if (
      text.includes("pregnant") || 
      text.includes("pregnancy") || 
      text.includes("uterus") || 
      text.includes("gestation") || 
      text.includes("obgyn") || 
      text.includes("gynaecology") || 
      text.includes("preeclampsia") || 
      text.includes("placenta") || 
      text.includes("fetus") ||
      text.includes("primigravida")
    ) {
      matchedSystemKey = "Reproductive";
    } else if (
      text.includes("kidney") || 
      text.includes("renal") || 
      text.includes("urine") || 
      text.includes("proteinuria") || 
      text.includes("nephrology") || 
      text.includes("dialysis") || 
      text.includes("gfr") ||
      text.includes("glomerul")
    ) {
      matchedSystemKey = "Nephrology";
    } else if (
      text.includes("gastroenterology") || 
      text.includes("stomach") || 
      text.includes("digestive") || 
      text.includes("gastric") || 
      text.includes("liver") || 
      text.includes("abdominal") || 
      text.includes("epigastric") || 
      text.includes("pancreas") || 
      text.includes("pancreatitis")
    ) {
      matchedSystemKey = "Digestive";
    } else if (
      text.includes("orthopaedic") || 
      text.includes("bone") || 
      text.includes("joint") || 
      text.includes("fracture") || 
      text.includes("skeletal") || 
      text.includes("femur") || 
      text.includes("spine") || 
      text.includes("cartilage") ||
      text.includes("osteoarthritis")
    ) {
      matchedSystemKey = "Musculoskeletal";
    } else if (
      text.includes("thyroid") || 
      text.includes("diabetes") || 
      text.includes("insulin") || 
      text.includes("hormone") || 
      text.includes("endocrinology") || 
      text.includes("adrenal") || 
      text.includes("cortisol")
    ) {
      matchedSystemKey = "Endocrine";
    } else if (
      text.includes("cardio") || 
      text.includes("heart") || 
      text.includes("mitral") || 
      text.includes("aortic") || 
      text.includes("stenosis") || 
      text.includes("chest pain") || 
      text.includes("stemi") || 
      text.includes("murmur") || 
      text.includes("pulse") || 
      text.includes("digoxin")
    ) {
      matchedSystemKey = "Cardiovascular";
    }

    const config = SYSTEM_CONFIGS[matchedSystemKey] || SYSTEM_CONFIGS.Cardiovascular;
    setActiveSystem(config);
    setSelectedHotspot(null);
  }, [questionText, specialty]);

  // Sync pathology mode with submission state automatically
  useEffect(() => {
    if (isSubmitted) {
      setViewMode("pathology");
    } else {
      setViewMode("normal");
    }
  }, [isSubmitted, questionText]);

  // Real-time Audio Doppler Generator (Synth)
  useEffect(() => {
    if (dopplerAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        
        // Base pitch depending on active system
        let baseFreq = 120;
        if (activeSystem.waveType === "neuro") baseFreq = 250;
        if (activeSystem.waveType === "respiratory") baseFreq = 80;

        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime); // Low safe volume

        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        // Pulse interval loop to simulate heartbeat/breathing rates
        let timer: any;
        const speed = viewMode === "pathology" ? 500 : 850;

        const playPulse = () => {
          if (!gainNodeRef.current || !audioContextRef.current) return;
          const now = audioContextRef.current.currentTime;
          
          if (activeSystem.waveType === "cardio") {
            // Simulated Lub-Dub sound
            gainNodeRef.current.gain.setValueAtTime(0.03, now);
            oscillatorRef.current?.frequency.setValueAtTime(baseFreq + 40, now);
            gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            setTimeout(() => {
              if (!gainNodeRef.current || !audioContextRef.current) return;
              const now2 = audioContextRef.current.currentTime;
              gainNodeRef.current.gain.setValueAtTime(0.025, now2);
              oscillatorRef.current?.frequency.setValueAtTime(baseFreq, now2);
              gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, now2 + 0.18);
            }, 180);
          } else {
            // Respiratory / neural whoosh loop
            gainNodeRef.current.gain.setValueAtTime(0.001, now);
            gainNodeRef.current.gain.linearRampToValueAtTime(0.02, now + 0.2);
            gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          }
        };

        timer = setInterval(playPulse, speed);

        return () => {
          clearInterval(timer);
          osc.stop();
          ctx.close();
        };
      } catch (err) {
        console.warn("Audio Context could not initialize:", err);
      }
    }
  }, [dopplerAudio, activeSystem, viewMode]);

  // Real-time Waveform Sweep Generator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw grid line background
      ctx.strokeStyle = "rgba(186, 230, 253, 0.12)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.lineWidth = 2.5;
      
      // Determine color theme based on normal/pathological mode
      if (viewMode === "normal") {
        ctx.strokeStyle = "#0ea5e9"; // beautiful blue
        ctx.shadowColor = "rgba(14, 165, 233, 0.4)";
      } else {
        ctx.strokeStyle = "#ef4444"; // pathology red
        ctx.shadowColor = "rgba(239, 68, 68, 0.4)";
      }
      ctx.shadowBlur = 6;

      ctx.beginPath();
      
      // Sweep sweep sweep
      for (let x = 0; x < width; x++) {
        let y = centerY;
        const timeFactor = (x + offset) * 0.05;

        switch (activeSystem.waveType) {
          case "cardio":
            if (viewMode === "normal") {
              const cycle = (x + offset) % 120;
              if (cycle < 10) y = centerY;
              else if (cycle < 18) y = centerY - Math.sin((cycle - 10) * Math.PI / 8) * 4; // P wave
              else if (cycle < 22) y = centerY;
              else if (cycle === 23) y = centerY + 3; // Q
              else if (cycle === 24) y = centerY - 25; // R
              else if (cycle === 25) y = centerY + 6; // S
              else if (cycle < 35) y = centerY;
              else if (cycle < 48) y = centerY - Math.sin((cycle - 35) * Math.PI / 13) * 6; // T
              else y = centerY;
            } else {
              const questionLower = questionText.toLowerCase();
              if (questionLower.includes("st-segment") || questionLower.includes("stemi") || questionLower.includes("myocardial")) {
                const cycle = (x + offset) % 100;
                if (cycle < 8) y = centerY;
                else if (cycle < 16) y = centerY - Math.sin((cycle - 8) * Math.PI / 8) * 5;
                else if (cycle < 19) y = centerY;
                else if (cycle === 20) y = centerY + 3;
                else if (cycle === 21) y = centerY - 28;
                else if (cycle === 22) y = centerY - 14; // STEMI Elevation
                else if (cycle < 38) y = centerY - 12 - Math.sin((cycle - 22) * Math.PI / 16) * 6;
                else y = centerY;
              } else {
                const cycle = (x + offset) % 90;
                if (cycle < 10) y = centerY;
                else if (cycle < 16) y = centerY - 2;
                else if (cycle === 18) y = centerY - 20;
                else if (cycle === 19) y = centerY + 8;
                else if (cycle < 30) y = centerY - 5;
                else y = centerY;
              }
            }
            break;

          case "respiratory":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.4) * 16;
            } else {
              y = centerY - Math.sin(timeFactor * 1.1) * 7 - Math.cos(timeFactor * 0.2) * 2;
            }
            break;

          case "neuro":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 2.5) * 4 - Math.cos(timeFactor * 1.4) * 3;
            } else {
              const cycle = (x + offset) % 45;
              if (cycle < 5) y = centerY - 22; // Sharp neuro spike
              else if (cycle === 5) y = centerY + 15;
              else if (cycle < 25) y = centerY - Math.sin((cycle - 5) * Math.PI / 20) * 16;
              else y = centerY + Math.sin((cycle - 25) * Math.PI / 20) * 2;
            }
            break;

          case "reproductive":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.1) * 2;
            } else {
              const cycle = (x + offset) % 240;
              if (cycle < 100) y = centerY;
              else y = centerY - Math.sin((cycle - 100) * Math.PI / 140) * 20;
            }
            break;

          case "nephrology":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.8) * 8 * (Math.sin(timeFactor * 0.05) + 1.2);
            } else {
              y = centerY - Math.sin(timeFactor * 0.2) * 3 - Math.sin(timeFactor * 1.8) * 1.5;
            }
            break;

          case "digestive":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.15) * 10;
            } else {
              y = centerY - Math.sin(timeFactor * 0.6) * 14 - Math.cos(timeFactor * 1.8) * 5;
            }
            break;

          case "ortho":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.5) * 12;
            } else {
              y = centerY - Math.sin(timeFactor * 0.5) * 12 - (Math.random() - 0.5) * 4;
            }
            break;

          case "endocrine":
            if (viewMode === "normal") {
              y = centerY - Math.sin(timeFactor * 0.2) * 9;
            } else {
              y = centerY - Math.sin(timeFactor * 1.4) * 18 - Math.cos(timeFactor * 0.35) * 4;
            }
            break;

          default:
            y = centerY - Math.sin(timeFactor * 0.5) * 10;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Leading edge sweeping indicator
      ctx.fillStyle = viewMode === "normal" ? "#38bdf8" : "#f87171";
      ctx.beginPath();
      ctx.arc(width - 5, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Top corner telemetry sweep speed label
      ctx.fillStyle = "#475569";
      ctx.font = "bold 7px monospace";
      ctx.fillText(`SWEEP APERTURE STATE: ${modality.toUpperCase()}`, 10, 15);
      
      const rhythmName = viewMode === "normal" ? "PHYSIOLOGICAL BASELINE" : activeSystem.pathologyLabel.toUpperCase();
      ctx.fillStyle = viewMode === "normal" ? "#0284c7" : "#ef4444";
      ctx.fillText(`STATUS: ${rhythmName}`, 10, height - 8);

      offset += viewMode === "normal" ? 1.5 : 2.5;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSystem, viewMode, questionText, modality]);

  const activeVitals = viewMode === "normal" ? activeSystem.normalVitals : activeSystem.pathologyVitals;

  // Track cursor position on viewport container to position the spotlight
  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlightPos({ x, y });
  };

  // Render specific modality layout effects
  const getModalityFilters = () => {
    let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (modality === "radiology") {
      // Create cool grayscale x-ray style
      filterString += " grayscale(1) invert(0.9) hue-rotate(180deg) brightness(1.1) contrast(1.3)";
    } else if (modality === "histology") {
      // Classic H&E pink and purple biopsy stain effect
      filterString += " sepia(0.5) hue-rotate(290deg) saturate(2.2) contrast(1.2)";
    } else if (modality === "ultrasound") {
      // Grainy dark sonar contrast
      filterString += " grayscale(1) brightness(0.7) contrast(1.8)";
    } else {
      // Normal Schema view
      if (viewMode === "pathology") {
        filterString += " saturate(1.3) contrast(1.15)";
      } else {
        filterString += " saturate(0.95)";
      }
    }
    return filterString;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full text-slate-100" id="advanced-pacs-simulator-panel">
      
      {/* Top PACS Workstation Header Bar */}
      <div className="bg-[#020617] px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <Tv className={`h-4.5 w-4.5 ${viewMode === "pathology" ? "text-rose-500 animate-pulse" : "text-sky-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest bg-slate-800 text-slate-300 py-0.5 px-1.5 rounded uppercase font-mono">
                PACS WORKSTATION v3.2
              </span>
              <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <h3 className="text-xs font-serif italic font-extrabold text-white mt-0.5">
              MRN: 742-OBX-9 • Patient Twin Simulator
            </h3>
          </div>
        </div>

        {/* Dynamic physiological normal vs pathology toggle */}
        <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest font-mono">
          <button
            onClick={() => setViewMode("normal")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${viewMode === "normal" ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <Activity className="h-3 w-3" />
            <span>Normal</span>
          </button>
          <button
            onClick={() => setViewMode("pathology")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${viewMode === "pathology" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <AlertCircle className="h-3 w-3" />
            <span>Pathological</span>
          </button>
        </div>
      </div>

      {/* Interactive Scan Modality Tabs Selector */}
      <div className="bg-[#0f172a] px-3 py-2 border-b border-slate-800 flex gap-1 overflow-x-auto scrollbar-none shrink-0 font-mono text-[9px] font-black uppercase tracking-wider">
        {[
          { id: "schema", label: "Anatomical Schema", icon: Compass },
          { id: "radiology", label: "Radiology (X-Ray/CT)", icon: Maximize2 },
          { id: "histology", label: "Histopathology (Biopsy)", icon: Layers },
          { id: "ultrasound", label: "Doppler Sonography", icon: Volume2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = modality === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setModality(tab.id as Modality);
                setSelectedHotspot(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? "bg-slate-800 border-slate-700 text-sky-400 font-bold shadow-sm" 
                  : "bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workstation View Area (The screen) */}
      <div 
        ref={containerRef}
        onMouseMove={handleViewportMouseMove}
        onMouseEnter={() => setIsHoveringViewport(true)}
        onMouseLeave={() => setIsHoveringViewport(false)}
        className="relative bg-slate-950 aspect-square w-full select-none flex items-center justify-center overflow-hidden cursor-crosshair border-b border-slate-800"
      >
        {/* Dynamic modality styled clinical image */}
        <div 
          className="w-full h-full transition-transform duration-500 overflow-hidden relative flex items-center justify-center"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {modality === "histology" ? (
            /* Custom generative Histopathology cellular grid background */
            <div className="absolute inset-0 bg-[#31002e] flex flex-wrap items-center justify-center p-2 opacity-80 mix-blend-screen pointer-events-none">
              <div className="w-full h-full grid grid-cols-8 gap-4 opacity-45">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-violet-600/60 border border-violet-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-indigo-400" />
                    </div>
                    <span className="text-[6px] font-mono text-pink-400 mt-1">Nuc-{i+10}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <img
            src={activeSystem.image}
            alt={activeSystem.name}
            className="w-full h-full object-cover opacity-85"
            style={{ filter: getModalityFilters() }}
            referrerPolicy="no-referrer"
          />

          {/* Caliper grid overlay overlay */}
          {enableCalipers && (
            <div className="absolute inset-0 border border-emerald-500/25 pointer-events-none flex items-center justify-center">
              <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-emerald-400/50" />
              <div className="absolute left-1/2 top-0 h-full w-[0.5px] bg-emerald-400/50" />
              <div className="absolute top-12 left-12 w-20 h-20 border-l border-t border-emerald-400/60 text-[8px] font-mono text-emerald-400 p-1">
                <span>Cal-X: 1.2 cm</span>
              </div>
            </div>
          )}

          {/* Doppler ultrasound dynamic flow lines */}
          {modality === "ultrasound" && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-around p-8 opacity-65">
              <div className="w-full h-2 bg-gradient-to-r from-cyan-500 via-transparent to-red-500 animate-pulse rounded blur-xs" />
              <div className="w-full h-3 bg-gradient-to-r from-red-500/50 via-cyan-500/50 to-transparent animate-bounce rounded blur-xs" />
            </div>
          )}
        </div>

        {/* Dynamic spotlamp magnifier scope for Radiology modality */}
        {modality === "radiology" && isHoveringViewport && (
          <div 
            className="absolute rounded-full border-2 border-dashed border-sky-400/80 shadow-[0_0_25px_rgba(56,189,248,0.4)] pointer-events-none bg-sky-900/15 mix-blend-overlay"
            style={{ 
              width: "100px", 
              height: "100px", 
              left: `${spotlightPos.x}%`, 
              top: `${spotlightPos.y}%`, 
              transform: "translate(-50%, -50%)" 
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-sky-400 text-[7px] font-bold font-mono py-0.5 px-1 rounded shadow border border-sky-500/30 whitespace-nowrap uppercase">
              Spotlamp: {Math.round(spotlightPos.x)}%X
            </div>
          </div>
        )}

        {/* Anatomical Labeled Hotspots */}
        {activeSystem.hotspots.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          return (
            <div
              key={spot.id}
              className="absolute"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {/* Glowing Landmark Target */}
              <button
                onClick={() => setSelectedHotspot(isSelected ? null : spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className="relative flex items-center justify-center w-8 h-8 group cursor-pointer outline-none rounded-full"
              >
                <span 
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping duration-1000 ${
                    viewMode === "pathology" ? "bg-red-500" : "bg-sky-500"
                  }`} 
                />
                <span 
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 shadow-md border-2 border-white transition-transform group-hover:scale-125 ${
                    viewMode === "pathology" ? "bg-red-600" : "bg-sky-500"
                  }`} 
                />
              </button>

              {/* Hover Tooltip overlay */}
              <AnimatePresence>
                {hoveredHotspot?.id === spot.id && !selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-30 bottom-10 left-1/2 -translate-x-1/2 w-56 bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-left text-[10px] leading-relaxed shadow-2xl pointer-events-none"
                  >
                    <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between font-mono">
                      <span className="text-sky-400">PIN: {spot.name.toUpperCase()}</span>
                      <Info className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <p className="text-slate-300 font-sans">
                      {viewMode === "normal" ? spot.normalDesc : spot.pathologyDesc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Scanning status badges */}
        {viewMode === "pathology" && (
          <div className="absolute top-3 left-3 bg-red-600/95 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md border border-red-500 flex items-center gap-1.5 animate-pulse font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Pathology Detected</span>
          </div>
        )}

        {/* Acquisition metadata watermark */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-xs text-slate-400 text-[7px] font-mono p-2 rounded-lg border border-slate-800/80 uppercase space-y-0.5">
          <div>Modality: {modality}</div>
          <div>Matrix: 1024 x 1024 px</div>
          <div>Field of View (FOV): 240mm</div>
        </div>
      </div>

      {/* Selected Hotspot Diagnostic Report Drawer */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-950 border-b border-slate-800 p-4 font-mono text-slate-300 text-[10px] leading-relaxed"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Compass className="h-4 w-4 text-sky-400" />
                <span>Diagnostic Report: {selectedHotspot.name}</span>
              </span>
              <button 
                onClick={() => setSelectedHotspot(null)}
                className="text-slate-400 hover:text-white text-[9px] font-bold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-md cursor-pointer border border-slate-700"
              >
                Clear Pin
              </button>
            </div>
            <p className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-normal">
              <strong className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">
                {viewMode === "normal" ? "Normal Baseline Physiology" : "Pathological Findings"}:
              </strong>
              {viewMode === "normal" ? selectedHotspot.normalDesc : selectedHotspot.pathologyDesc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Sliders Workstation Panel */}
      <div className="bg-[#030712] p-4 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono">
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>BRIGHTNESS</span>
            <span className="text-sky-400">{brightness}%</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="150" 
            value={brightness} 
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg cursor-pointer" 
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>CONTRAST</span>
            <span className="text-sky-400">{contrast}%</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="150" 
            value={contrast} 
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg cursor-pointer" 
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>ZOOM LEVEL</span>
            <span className="text-sky-400">{zoom}%</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="200" 
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg cursor-pointer" 
          />
        </div>

        {/* Toggleable tools */}
        <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setEnableCalipers(!enableCalipers)}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded transition-colors ${enableCalipers ? "text-emerald-400 font-bold" : "text-slate-500"}`}
          >
            <Grid className="h-4 w-4" />
            <span className="text-[7px] mt-0.5">CALIPERS</span>
          </button>
          
          <button 
            onClick={() => setDopplerAudio(!dopplerAudio)}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded transition-colors ${dopplerAudio ? "text-sky-400 font-bold animate-pulse" : "text-slate-500"}`}
          >
            <Volume2 className="h-4 w-4" />
            <span className="text-[7px] mt-0.5">SOUNDS</span>
          </button>
        </div>
      </div>

      {/* Live Waveform Sweeper Canvas screen */}
      <div className="bg-slate-950 h-28 w-full border-b border-slate-800 relative overflow-hidden shrink-0">
        <canvas 
          ref={canvasRef} 
          width={450} 
          height={112} 
          className="w-full h-full block" 
        />
        
        {/* Dynamic numeric vitals overlay */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-2 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest flex flex-col gap-1.5 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span>HEART RATE:</span>
            <span className={viewMode === "pathology" ? "text-rose-500 font-extrabold" : "text-sky-400 font-extrabold"}>
              {viewMode === "pathology" ? "108 BPM" : "72 BPM"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>PERFUSION PRESSURE:</span>
            <span className={viewMode === "pathology" ? "text-rose-400 font-extrabold" : "text-sky-400 font-extrabold"}>
              {viewMode === "pathology" ? "110 mmHg" : "93 mmHg"}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Vital Diagnostics Grid */}
      <div className="p-4 bg-slate-950/80 flex-grow grid grid-cols-2 gap-2.5 text-[10px] shrink-0">
        {activeVitals.map((vit, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-0.5 shadow-sm">
            <span className="text-slate-500 font-extrabold uppercase tracking-widest text-[7px] font-mono">{vit.label}</span>
            <span className={`font-bold font-mono ${viewMode === "pathology" ? "text-rose-500" : "text-slate-200"}`}>{vit.value}</span>
          </div>
        ))}
      </div>

      {/* Prompt / Guide footer */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 text-[8px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-sky-400" />
          <span>Interactive multi-modality diagnostic sweep. Highlight pins for full clinical analysis.</span>
        </span>
        <span className="uppercase font-extrabold text-[8px] tracking-wider text-sky-400">TELEMETRY SYNCED</span>
      </div>
    </div>
  );
}
