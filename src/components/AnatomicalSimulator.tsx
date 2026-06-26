import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Eye, 
  AlertCircle, 
  Info, 
  Layers, 
  Sliders, 
  Dribbble, 
  Compass, 
  Check, 
  HelpCircle 
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
  hotspots: Hotspot[];
  normalVitals: { label: string; value: string }[];
  pathologyVitals: { label: string; value: string }[];
  pathologyLabel: string;
  waveType: "cardio" | "respiratory" | "neuro" | "reproductive" | "nephrology" | "digestive" | "ortho" | "endocrine";
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

export default function AnatomicalSimulator({
  questionText,
  specialty,
  selectedAnswerIndex,
  isSubmitted,
  correctAnswerIndex
}: AnatomicalSimulatorProps) {
  const [activeSystem, setActiveSystem] = useState<SystemConfig>(SYSTEM_CONFIGS.Cardiovascular);
  const [viewMode, setViewMode] = useState<"normal" | "pathology">("normal");
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      ctx.strokeStyle = "rgba(186, 230, 253, 0.2)";
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
              // ECG Sinus Rhythm Wave
              const cycle = (x + offset) % 120;
              if (cycle < 10) y = centerY; // Flat isoelectric
              else if (cycle < 18) y = centerY - Math.sin((cycle - 10) * Math.PI / 8) * 4; // P wave
              else if (cycle < 22) y = centerY; // PQ segment
              else if (cycle === 23) y = centerY + 3; // Q wave drop
              else if (cycle === 24) y = centerY - 25; // Tall R wave peak
              else if (cycle === 25) y = centerY + 6; // S wave drop
              else if (cycle < 35) y = centerY; // ST segment
              else if (cycle < 48) y = jestT(cycle - 35); // T wave
              else y = centerY;

              function jestT(val: number) {
                return centerY - Math.sin(val * Math.PI / 13) * 6;
              }
            } else {
              // Pathology ECG: Depends on question keywords
              const questionLower = questionText.toLowerCase();
              if (questionLower.includes("st-segment") || questionLower.includes("stemi") || questionLower.includes("myocardial")) {
                // STEMI ST-Elevation Wave
                const cycle = (x + offset) % 100; // faster tachycardia
                if (cycle < 8) y = centerY;
                else if (cycle < 16) y = centerY - Math.sin((cycle - 8) * Math.PI / 8) * 5; // P wave
                else if (cycle < 19) y = centerY;
                else if (cycle === 20) y = centerY + 3; // Q
                else if (cycle === 21) y = centerY - 28; // R peak
                else if (cycle === 22) y = centerY - 14; // Massive ST-elevation!
                else if (cycle < 38) y = centerY - 12 - Math.sin((cycle - 22) * Math.PI / 16) * 6; // ST-elevation merging with T wave
                else y = centerY;
              } else if (questionLower.includes("digoxin") || questionLower.includes("furosemide")) {
                // Digoxin Toxicity scooped ST and PVC beat
                const cycle = (x + offset) % 200; // bradycardia
                if (cycle < 15) y = centerY;
                else if (cycle < 25) y = centerY - Math.sin((cycle - 15) * Math.PI / 10) * 3; // P
                else if (cycle < 32) y = centerY; // long PR interval
                else if (cycle === 33) y = centerY - 15; // small R
                else if (cycle === 34) y = centerY + 18; // scooped S drop
                else if (cycle < 60) y = centerY + 6 - Math.cos((cycle - 34) * Math.PI / 13) * 6; // Scooped Dali Mustache tick
                else if (cycle < 110) y = centerY;
                else if (cycle >= 110 && cycle < 135) {
                  // PVC ventricular beat (No P wave, wide bizarre QRS)
                  const pvcCycle = cycle - 110;
                  if (pvcCycle < 3) y = centerY;
                  else if (pvcCycle === 4) y = centerY + 10;
                  else if (pvcCycle < 9) y = centerY - 22; // wide peak
                  else if (pvcCycle < 16) y = centerY + 14; // wide S drop
                  else y = centerY - Math.sin((pvcCycle - 16) * Math.PI / 10) * 8; // Inverted T wave
                } else {
                  y = centerY;
                }
              } else {
                // General Arrhythmia
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
              // Smooth, deep respiratory flow curve
              y = centerY - Math.sin(timeFactor * 0.4) * 16;
            } else {
              // Rapid, shallow pathologically restricted respiratory curve
              y = centerY - Math.sin(timeFactor * 1.1) * 7 - Math.cos(timeFactor * 0.2) * 2;
            }
            break;

          case "neuro":
            if (viewMode === "normal") {
              // Desynchronized high-frequency alpha waves
              y = centerY - Math.sin(timeFactor * 2.5) * 4 - Math.cos(timeFactor * 1.4) * 3;
            } else {
              // Epileptogenic Hypersynchronous Spike-and-Wave Pattern
              const cycle = (x + offset) % 45;
              if (cycle < 5) {
                y = centerY - 22; // Sharp spike peak
              } else if (cycle === 5) {
                y = centerY + 15; // Sharp spike rebound
              } else if (cycle < 25) {
                // Smooth dome slow wave
                y = centerY - Math.sin((cycle - 5) * Math.PI / 20) * 16;
              } else {
                y = centerY + Math.sin((cycle - 25) * Math.PI / 20) * 2;
              }
            }
            break;

          case "reproductive":
            if (viewMode === "normal") {
              // Low resting muscle tone
              y = centerY - Math.sin(timeFactor * 0.1) * 2;
            } else {
              // Irritable, sweeping contraction spikes (Cardiotocography)
              const cycle = (x + offset) % 240;
              if (cycle < 100) {
                y = centerY;
              } else {
                // Bell-shaped contraction curve representing preeclamptic stress / late deceleration
                y = centerY - Math.sin((cycle - 100) * Math.PI / 140) * 20;
              }
            }
            break;

          case "nephrology":
            if (viewMode === "normal") {
              // Steady vascular filtration pulses
              y = centerY - Math.sin(timeFactor * 0.8) * 8 * (Math.sin(timeFactor * 0.05) + 1.2);
            } else {
              // Extremely congested, low-flow sluggish peaks
              y = centerY - Math.sin(timeFactor * 0.2) * 3 - Math.sin(timeFactor * 1.8) * 1.5;
            }
            break;

          case "digestive":
            if (viewMode === "normal") {
              // 3 cpm steady slow motility waves
              y = centerY - Math.sin(timeFactor * 0.15) * 10;
            } else {
              // Spasmodic, hyper-acidic gastrointestinal spikes
              y = centerY - Math.sin(timeFactor * 0.6) * 14 - Math.cos(timeFactor * 1.8) * 5;
            }
            break;

          case "ortho":
            if (viewMode === "normal") {
              // Smooth, dynamic stress curve
              y = centerY - Math.sin(timeFactor * 0.5) * 12;
            } else {
              // Heavy friction spikes indicating microfractures/subchondral shear
              y = centerY - Math.sin(timeFactor * 0.5) * 12 - (Math.random() - 0.5) * 4;
            }
            break;

          case "endocrine":
            if (viewMode === "normal") {
              // Stable hormonal oscillations
              y = centerY - Math.sin(timeFactor * 0.2) * 9;
            } else {
              // Hyperactive thyrotoxic spikes
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
      ctx.shadowBlur = 0; // reset shadow for next draw operations

      // Draw sweeping light indicator at the leading edge
      ctx.fillStyle = viewMode === "normal" ? "#38bdf8" : "#f87171";
      ctx.beginPath();
      ctx.arc(width - 5, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Add a small real-time sweep label
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 8px monospace";
      ctx.fillText("LIVE PATHOPHYSIOLOGICAL TELEMETRY SWEEP", 10, 15);
      
      const rhythmName = viewMode === "normal" ? "PHYSIOLOGICAL BASELINE" : activeSystem.pathologyLabel.toUpperCase();
      ctx.fillStyle = viewMode === "normal" ? "#0369a1" : "#b91c1c";
      ctx.fillText(`STATUS: ${rhythmName}`, 10, height - 10);

      offset += viewMode === "normal" ? 1.5 : 2.5; // faster speed during pathology
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSystem, viewMode, questionText]);

  const activeVitals = viewMode === "normal" ? activeSystem.normalVitals : activeSystem.pathologyVitals;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col h-full" id="anatomical-simulator-panel">
      {/* Simulation Header */}
      <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className={`h-4.5 w-4.5 ${viewMode === "pathology" ? "text-rose-500 animate-pulse" : "text-sky-400"}`} />
          <div>
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-slate-300">Anatomical Simulator</h3>
            <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">{activeSystem.name}</p>
          </div>
        </div>
        <div className="flex bg-[#1E293B] border border-slate-700 p-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest">
          <button
            onClick={() => setViewMode("normal")}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${viewMode === "normal" ? "bg-[#0ea5e9] text-white" : "text-slate-400 hover:text-white"}`}
          >
            Normal
          </button>
          <button
            onClick={() => setViewMode("pathology")}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${viewMode === "pathology" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Pathology
          </button>
        </div>
      </div>

      {/* Main Simulation View Area */}
      <div className="relative bg-slate-900 border-b border-[#E2E8F0] aspect-square w-full select-none flex items-center justify-center overflow-hidden">
        {/* Dynamic high fidelity illustration */}
        <img
          src={activeSystem.image}
          alt={activeSystem.name}
          className="w-full h-full object-cover transition-all duration-700 opacity-90"
          style={{
            filter: viewMode === "pathology" ? "saturate(1.4) contrast(1.1)" : "saturate(0.9)"
          }}
          referrerPolicy="no-referrer"
        />

        {/* Outer glowing border indicator based on system mode */}
        <div 
          className={`absolute inset-0 border-2 transition-all duration-500 pointer-events-none ${
            viewMode === "pathology" ? "border-rose-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.25)]" : "border-sky-500/10 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]"
          }`}
        />

        {/* Dynamic pathology overlay effect (Red alert mask) */}
        {viewMode === "pathology" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0.15, 0.08] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-red-600/10 pointer-events-none mix-blend-color-burn"
          />
        )}

        {/* Anatomical Hotspots Overlaid */}
        {activeSystem.hotspots.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          return (
            <div
              key={spot.id}
              className="absolute"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {/* Outer pulsing ring */}
              <button
                onClick={() => setSelectedHotspot(isSelected ? null : spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className="relative flex items-center justify-center w-7 h-7 group cursor-pointer outline-none focus:ring-2 focus:ring-sky-500 rounded-full"
              >
                <span 
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping duration-1000 ${
                    viewMode === "pathology" ? "bg-red-500" : "bg-sky-500"
                  }`} 
                />
                <span 
                  className={`relative inline-flex rounded-full h-3 w-3 shadow-sm border border-white transition-transform group-hover:scale-125 ${
                    viewMode === "pathology" ? "bg-red-600" : "bg-sky-500"
                  }`} 
                />
              </button>

              {/* Hover Tooltip (Desktop) */}
              <AnimatePresence>
                {hoveredHotspot?.id === spot.id && !selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-30 bottom-8 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 backdrop-blur-sm border border-slate-700 text-white rounded-lg p-2.5 text-left text-[10px] leading-relaxed shadow-xl pointer-events-none"
                  >
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 flex items-center justify-between">
                      <span>{spot.name}</span>
                      <Info className="h-3 w-3 text-sky-400" />
                    </div>
                    <p className="text-slate-300">
                      {viewMode === "normal" ? spot.normalDesc : spot.pathologyDesc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Live Pathology Active Banner */}
        {viewMode === "pathology" && (
          <div className="absolute top-3 left-3 bg-red-600/90 text-white font-black text-[9px] uppercase tracking-widest px-2 py-1 rounded shadow-md border border-red-500 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Active Pathology Simulation</span>
          </div>
        )}
      </div>

      {/* Selected Hotspot Detailed Diagnostic Panel */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-[#E2E8F0] p-4 text-slate-800 text-xs leading-relaxed"
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="font-bold text-[#003B95] flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Compass className="h-4 w-4 text-[#003B95]" />
                <span>Diagnostic Landmark: {selectedHotspot.name}</span>
              </span>
              <button 
                onClick={() => setSelectedHotspot(null)}
                className="text-slate-400 hover:text-slate-700 text-[10px] font-bold uppercase tracking-wider bg-slate-200/60 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
            <p className="text-slate-700 font-medium">
              <strong className="text-[10px] uppercase tracking-wider mr-1 text-[#64748B]">
                {viewMode === "normal" ? "Normal Baseline" : "Clinical Manifestation"}:
              </strong>
              {viewMode === "normal" ? selectedHotspot.normalDesc : selectedHotspot.pathologyDesc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Waveform Sweeper Canvas */}
      <div className="bg-slate-950 h-28 w-full border-b border-[#E2E8F0] relative overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={450} 
          height={112} 
          className="w-full h-full block" 
        />
        
        {/* Dynamic numeric vitals overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-1.5 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <span>HR:</span>
            <span className={viewMode === "pathology" ? "text-rose-500 font-extrabold" : "text-sky-400 font-extrabold"}>
              {viewMode === "pathology" ? "108 bpm" : "72 bpm"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>MAP:</span>
            <span className={viewMode === "pathology" ? "text-rose-400 font-extrabold" : "text-sky-400 font-extrabold"}>
              {viewMode === "pathology" ? "110 mmHg" : "93 mmHg"}
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Vital Diagnostics */}
      <div className="p-4 bg-[#F8FAFC]/70 flex-grow grid grid-cols-2 gap-2 text-[10px]">
        {activeVitals.map((vit, idx) => (
          <div key={idx} className="bg-white border border-[#E2E8F0] p-2 rounded-lg flex flex-col gap-0.5 shadow-sm">
            <span className="text-[#64748B] font-extrabold uppercase tracking-widest text-[8px]">{vit.label}</span>
            <span className={`font-bold ${viewMode === "pathology" ? "text-rose-700" : "text-slate-800"}`}>{vit.value}</span>
          </div>
        ))}
      </div>

      {/* Prompt Instructions */}
      <div className="bg-slate-50 px-4 py-2 border-t border-[#E2E8F0] text-[9px] text-slate-400 font-medium flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-[#003B95]" />
          <span>Click glowing hotspots on the image for details.</span>
        </span>
        <span className="uppercase font-extrabold text-[8px] tracking-wider text-[#003B95]">Active telemetry</span>
      </div>
    </div>
  );
}
