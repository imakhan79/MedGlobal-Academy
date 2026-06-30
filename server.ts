import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { PRESEEDED_MCQS } from "./src/data";
import { CARDIOLOGY_USMLE1_Q_BANK } from "./src/data/clinicalQBank";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not set or using the placeholder. Falling back to simulated medical intelligence responses.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust helper function with retry logic and model fallback to handle 503/429 transient errors
async function generateContentWithRetry(
  client: GoogleGenAI,
  params: {
    model?: string;
    contents: any;
    config?: any;
  }
): Promise<any> {
  const primaryModel = params.model || "gemini-3.5-flash";
  const backupModel = "gemini-3.1-flash-lite";
  const maxRetries = 3;

  async function tryModel(modelName: string): Promise<any> {
    let lastError: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delay));
          console.warn(`Retrying Gemini request on ${modelName} (attempt ${attempt}/${maxRetries})...`);
        }
        
        const response = await client.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Comprehensive extraction of error status / code
        const statusCode = error.status || error.statusCode || (error.error && error.error.code);
        const errStr = JSON.stringify(error).toLowerCase();
        const errMsg = (error.message || "").toLowerCase();
        
        // Define transient indicators (UNAVAILABLE, RESOURCE_EXHAUSTED, 503, 429, 500, etc.)
        const isTransient = 
          statusCode === 429 || 
          statusCode === 503 || 
          statusCode === 500 ||
          String(statusCode) === "429" ||
          String(statusCode) === "503" ||
          String(statusCode) === "500" ||
          String(statusCode).toUpperCase() === "UNAVAILABLE" ||
          String(statusCode).toUpperCase() === "RESOURCE_EXHAUSTED" ||
          errStr.includes("503") || 
          errStr.includes("429") || 
          errStr.includes("unavailable") || 
          errStr.includes("resource_exhausted") ||
          errMsg.includes("503") || 
          errMsg.includes("429") || 
          errMsg.includes("unavailable") || 
          errMsg.includes("resource_exhausted") ||
          !statusCode;
        
        console.error(`Gemini call failed for ${modelName} (attempt ${attempt}): status=${statusCode}, transient=${isTransient}, message=${error.message || error}`);
        
        if (!isTransient) {
          throw error;
        }
      }
    }
    throw lastError;
  }

  try {
    return await tryModel(primaryModel);
  } catch (primaryError) {
    console.warn(`Primary model ${primaryModel} failed. Falling back to backup model ${backupModel}...`);
    try {
      return await tryModel(backupModel);
    } catch (backupError) {
      console.error(`Backup model ${backupModel} also failed.`);
      throw primaryError;
    }
  }
}

// Simulated High-Quality Medical Answers (fallback if API key is missing)
const SIMULATED_RESPONSES: Record<string, string> = {
  tutor: `**MedGlobal AI Medical Tutor Response:**\n\nIn clinical medicine, understanding **Hyperkalemia** is critical. \n\n### Etiology\n* **Reduced Renal Excretion**: Acute kidney injury (AKI), Chronic kidney disease (CKD), and aldosterone deficiency or resistance (e.g., ACE inhibitors, ARBs, Spironolactone).\n* **Transcellular Shifts**: Metabolic acidosis (where H+ enters cells in exchange for K+), insulin deficiency, or cell lysis (rhabdomyolysis, tumor lysis syndrome).\n\n### Clinical Presentation\nOften asymptomatic until severe. Symptoms include muscle weakness, flaccid paralysis, and cardiac conduction abnormalities.\n\n### ECG Findings\n1. **Mild (5.5 - 6.5 mEq/L)**: Peaked T-waves, prolonged PR interval.\n2. **Moderate (6.5 - 7.0 mEq/L)**: Loss of P-wave, prolonged QRS complex.\n3. **Severe (> 7.0 mEq/L)**: "Sine-wave" pattern progressing to ventricular fibrillation or asystole.\n\n### Treatment Protocol\n* **Stabilize Myocardium**: Calcium gluconate (10% IV over 5-10 mins). Does not lower K+, but raises cardiac threshold.\n* **Shift K+ Intracellularly**: IV Insulin (10 units regular) + 50% Dextrose, or inhaled Beta-2 agonists.\n* **Eliminate K+ from Body**: Loop diuretics (Furosemide), gastrointestinal cation exchangers, or hemodialysis.`,
  research: `**MedGlobal AI Research Assistant Proposal:**\n\n### Draft Protocol: Clinical Efficacy of SGLT2 Inhibitors in HFpEF\n\n**1. Introduction & Objectives**\nInvestigate whether modern SGLT2 inhibitors (Empagliflozin/Dapagliflozin) reduce cardiovascular death or hospitalization for heart failure in patients with Heart Failure with Preserved Ejection Fraction (HFpEF, LVEF ≥ 50%).\n\n**2. Study Design**\n* **Design**: Multicenter, randomized, double-blind, placebo-controlled trial.\n* **Sample Size**: ~120 participants over 12 months.\n\n**3. Inclusion/Exclusion Criteria**\n* *Inclusion*: Age ≥ 18, symptomatic HF (NYHA II-IV), LVEF ≥ 50%, elevated NT-proBNP (> 300 pg/mL).\n* *Exclusion*: eGFR < 20 mL/min/1.73m², Type 1 Diabetes, severe hypotension.\n\n**4. Statistical Analysis Plan**\nTime-to-event analysis using Cox proportional hazards regression. Standard descriptive statistics for secondary endpoints (KCCQ symptom scores).`,
  coach: `**MedGlobal AI Exam Coach Coaching Advice:**\n\nBased on your profile, you are preparing for **USMLE Step 1**. Let's review a high-yield clinical vignette:\n\n**Vignette**: A 45-year-old male presents with severe, sudden-onset retrosternal chest pain. ECG shows ST-segment elevation in leads V1 to V4. Coronary angiography reveals complete occlusion of the left anterior descending (LAD) artery. \n\n**Physiology Integration**:\n* **Occlusion Site**: Anterior wall of left ventricle and anterior 2/3 of interventricular septum.\n* **First 0-4 hours**: No visible light microscopy changes. Risk of cardiogenic shock and arrhythmias (VFib).\n* **4-12 hours**: Early coagulation necrosis, edema, and hemorrhage.\n* **1-3 days**: Extensive coagulation necrosis, neutrophilic infiltration (highest risk of fibrinous pericarditis).\n* **3-7 days**: Macrophage infiltration, phagocytosis of dead cells (highest risk of free wall rupture or papillary muscle rupture).\n\n**Exam Strategy**: Pay close attention to the timeline in cardiac pathology questions! Questions frequently ask for the specific histological hallmark or complication associated with a specific day post-MI.`
};

// --- API Endpoints ---

// 1. General Medical Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, mode, systemInstruction } = req.body;
  const userMessage = messages[messages.length - 1]?.content || "Explain hypertension management.";

  const client = getAIClient();
  if (!client) {
    // Fall back to simulated intelligent responses based on mode
    const fallbackResponse = SIMULATED_RESPONSES[mode as string] || SIMULATED_RESPONSES.tutor;
    return res.json({ response: fallbackResponse });
  }

  try {
    const formattedPrompt = `[Mode: ${mode || "General medical assistance"}]
System instructions for context: ${systemInstruction || "You are a professional medical education AI assistant."}

User request: ${userMessage}

Please write a highly detailed, professional, structured medical response with references if possible.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini API error, falling back to local simulation:", error);
    const fallbackResponse = SIMULATED_RESPONSES[mode as string] || SIMULATED_RESPONSES.tutor;
    res.json({ response: `⚠️ **Offline Mode (Local Intelligence)**: ${fallbackResponse}` });
  }
});

// 2. MCQ Generator Endpoint helper
function getFallbackMCQ(specialty?: string, difficulty?: string, currentQuestionText?: string) {
  let pool = [...PRESEEDED_MCQS, ...CARDIOLOGY_USMLE1_Q_BANK];
  
  if (specialty) {
    const specLower = specialty.toLowerCase();
    let specPool = pool.filter(q => q.specialty && q.specialty.toLowerCase() === specLower);
    if (specPool.length > 0) {
      pool = specPool;
    }
  }
  
  if (difficulty) {
    const diffLower = difficulty.toLowerCase();
    let diffVal = "medium";
    if (diffLower === "easy") diffVal = "easy";
    else if (diffLower === "hard" || diffLower === "board-level" || diffLower === "difficult") diffVal = "hard";
    
    let diffPool = pool.filter(q => {
      const qDiff = (q.difficulty || "medium").toLowerCase();
      if (diffVal === "hard") {
        return qDiff === "hard" || qDiff === "medium" || qDiff === "board-level" || qDiff === "difficult";
      }
      return qDiff === diffVal;
    });
    
    if (diffPool.length > 0) {
      pool = diffPool;
    }
  }

  // Filter out the current question to prevent repetition if possible
  if (currentQuestionText && pool.length > 1) {
    const nonRepeatingPool = pool.filter(q => q.question !== currentQuestionText);
    if (nonRepeatingPool.length > 0) {
      pool = nonRepeatingPool;
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || PRESEEDED_MCQS[0];
}

app.post("/api/generate-mcq", async (req, res) => {
  const { specialty, difficulty, currentQuestionText } = req.body;
  const client = getAIClient();

  if (!client) {
    const fallback = getFallbackMCQ(specialty, difficulty, currentQuestionText);
    return res.json(fallback);
  }

  try {
    const prompt = `Generate a single multiple-choice question (MCQ) for a medical licensing exam.
Specialty: ${specialty || "Internal Medicine"}
Difficulty: ${difficulty || "Medium"}

IMPORTANT: You MUST generate a brand-new, unique clinical vignette. DO NOT generate the same question or a similar scenario to this current question:
"${currentQuestionText || ""}"

The response must be in JSON format matching this schema:
{
  "question": "The clinical vignette or question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0, // index of correct option (0, 1, 2, or 3)
  "rationale": "Detailed explanation of why the correct option is right and others are incorrect, citing pathophysiological reasons."
}

Do not include any markdown wrap or extra text. Just output the clean JSON.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("JSON parsing error on generated MCQ:", parseError);
      throw parseError;
    }
  } catch (error: any) {
    console.error("Gemini API error in generate-mcq, falling back to preseeded question:", error);
    const fallback = getFallbackMCQ(specialty, difficulty, currentQuestionText);
    res.json(fallback);
  }
});

// 2.5. MCQ Explain with AI Endpoint
app.post("/api/explain-mcq", async (req, res) => {
  const { question, options, selectedAnswer, correctAnswer, rationale } = req.body;
  const client = getAIClient();

  if (!client) {
    const isCorrect = selectedAnswer === correctAnswer;
    const formattedSelected = String.fromCharCode(65 + Number(selectedAnswer));
    const formattedCorrect = String.fromCharCode(65 + Number(correctAnswer));

    const fallbackResponse = `### 💻 offline Mode: Simulated Personalized AI Breakdown

${isCorrect ? `🎉 **Excellent job!** You correctly identified **Option ${formattedCorrect}** (${options[correctAnswer]}) as the right choice.` : `⚠️ **Clinical Distinction Check:** You selected **Option ${formattedSelected}** (${options[selectedAnswer] || "None"}), but the correct answer is **Option ${formattedCorrect}** (${options[correctAnswer]}).`}

#### Pathophysiological Deep Dive
* **Why the correct option is right**: The patient's clinical presentation directly aligns with the pathophysiological process. The clinical rationale is: *"${rationale}"*.
* **Why the other options are distractors**: Distractors represent closely related clinical mimics, but they lack specific pathognomonic details present in this scenario.

#### High-Yield Board Takeaway
Always scan the clinical vignette for specific combinations of risk factors, exam findings, and timeline indicators to confidently rule out high-probability lookalikes on exam day!`;
    
    return res.json({ response: fallbackResponse });
  }

  try {
    const prompt = `You are an expert clinical medical educator. Provide a personalized, professional medical breakdown of the following multiple choice question (MCQ) result.

Question:
${question}

Options:
${options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join("\n")}

The student selected: Option ${String.fromCharCode(65 + Number(selectedAnswer))} (${options[selectedAnswer]})
The correct answer is: Option ${String.fromCharCode(65 + Number(correctAnswer))} (${options[correctAnswer]})

Default Clinical Rationale:
${rationale}

Please provide a highly educational, personalized medical breakdown for the student. 
If they got it correct, praise their logic and reinforce high-yield board-style points. 
If they got it wrong, gently explain why their selected option is incorrect (highlighting clinical key differentiators/lookalikes) and detail why the correct answer is the gold standard choice. 
Include a brief clinical takeaway section at the end. Use clean Markdown formatting with bold terms for readability.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini API error in explain-mcq, falling back to local simulation:", error);
    const isCorrect = selectedAnswer === correctAnswer;
    const formattedSelected = String.fromCharCode(65 + Number(selectedAnswer));
    const formattedCorrect = String.fromCharCode(65 + Number(correctAnswer));

    const fallbackResponse = `### 💻 offline Mode: Simulated Personalized AI Breakdown
 
${isCorrect ? `🎉 **Excellent job!** You correctly identified **Option ${formattedCorrect}** (${options[correctAnswer]}) as the right choice.` : `⚠️ **Clinical Distinction Check:** You selected **Option ${formattedSelected}** (${options[selectedAnswer] || "None"}), but the correct answer is **Option ${formattedCorrect}** (${options[correctAnswer]}).`}
 
#### Pathophysiological Deep Dive
* **Why the correct option is right**: The patient's clinical presentation directly aligns with the pathophysiological process. The clinical rationale is: *"${rationale}"*.
* **Why the other options are distractors**: Distractors represent closely related clinical mimics, but they lack specific pathognomonic details present in this scenario.
 
#### High-Yield Board Takeaway
Always scan the clinical vignette for specific combinations of risk factors, exam findings, and timeline indicators to confidently rule out high-probability lookalikes on exam day!`;
    
    res.json({ response: fallbackResponse });
  }
});

// 2.5. MCQ Explain with AI Endpoint
app.post("/api/explain-mcq", async (req, res) => {
  const { question, options, selectedAnswer, correctAnswer, rationale } = req.body;
  const client = getAIClient();

  if (!client) {
    const isCorrect = selectedAnswer === correctAnswer;
    const formattedSelected = String.fromCharCode(65 + Number(selectedAnswer));
    const formattedCorrect = String.fromCharCode(65 + Number(correctAnswer));

    const fallbackResponse = `### 💻 offline Mode: Simulated Personalized AI Breakdown

${isCorrect ? `🎉 **Excellent job!** You correctly identified **Option ${formattedCorrect}** (${options[correctAnswer]}) as the right choice.` : `⚠️ **Clinical Distinction Check:** You selected **Option ${formattedSelected}** (${options[selectedAnswer] || "None"}), but the correct answer is **Option ${formattedCorrect}** (${options[correctAnswer]}).`}

#### Pathophysiological Deep Dive
* **Why the correct option is right**: The patient's clinical presentation directly aligns with the pathophysiological process. The clinical rationale is: *"${rationale}"*.
* **Why the other options are distractors**: Distractors represent closely related clinical mimics, but they lack specific pathognomonic details present in this scenario.

#### High-Yield Board Takeaway
Always scan the clinical vignette for specific combinations of risk factors, exam findings, and timeline indicators to confidently rule out high-probability lookalikes on exam day!`;
    
    return res.json({ response: fallbackResponse });
  }

  try {
    const prompt = `You are an elite Medical Board Exam Instructor.
A student has just answered a multiple-choice clinical question.
Question: "${question}"
Options: ${options.map((o: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${o}`).join(", ")}
The student selected: ${String.fromCharCode(65 + Number(selectedAnswer))}
The correct answer is: ${String.fromCharCode(65 + Number(correctAnswer))}
Pre-set rationale: "${rationale}"

Provide a detailed, structured clinical breakdown explaining:
1. Why the correct option is pathophysiologically or clinically superior.
2. Why each of the other options (distractors) are incorrect in this context, detailing the specific key clinical details that distinguish them from the correct answer.
3. A "High-Yield Board Takeaway" summary of 1-2 sentences.

Output in elegant Markdown. Keep your tone highly professional, objective, academic, and supportive.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error("Gemini API error in explain-mcq, falling back to local pre-set rationale:", error);
    res.json({ response: `### 💻 offline Mode: Pre-Set Rationale Breakdown\n\n${rationale}` });
  }
});

// 2.5.5. Medical Exam Simulation Engine (MESE) Endpoint
app.post("/api/mese", async (req, res) => {
  const { examType, focusArea, sessionHistory = [], currentDifficulty = "Clinical Reasoning", currentSpecialty = "Cardiology" } = req.body;
  const client = getAIClient();

  // Preseeded High-Yield Simulation Questions Pool for extreme fidelity offline/fallback mode
  const MESE_QUESTION_POOL = [
    {
      examType: "USMLE Step 1",
      specialty: "Cardiology",
      difficulty: "Recall",
      question: "A 54-year-old male with a history of hypertension presents for a routine checkup. On cardiac auscultation, a low-pitched, rumbling diastolic murmur is heard at the apex, best heard with the bell in the left lateral decubitus position. It is preceded by an opening snap. Which of the following is the most likely underlying etiology of this patient's valvular condition?",
      options: [
        "Age-related calcific degeneration",
        "Chronic rheumatic heart disease",
        "Infective endocarditis",
        "Myxomatous degeneration",
        "Congenital bicuspid valve"
      ],
      correctAnswerIndex: 1,
      rationale: "Chronic rheumatic heart disease is the most common cause of mitral stenosis worldwide, which typically presents with a low-pitched diastolic rumble preceded by an opening snap. Age-related calcific degeneration primarily causes aortic stenosis. Myxomatous degeneration causes mitral valve prolapse (late systolic click and murmur)."
    },
    {
      examType: "USMLE Step 1",
      specialty: "Cardiology",
      difficulty: "Clinical Reasoning",
      question: "A 45-year-old female presents with progressive shortness of breath and orthopnea. Echocardiography demonstrates a thickened mitral valve with restricted leaflets, an opening snap, and a diastolic pressure gradient across the valve. Her past medical history is notable for a febrile illness during childhood characterized by painful joints and a transient rash. Which of the following hemodynamic changes is most likely present in this patient's left atrium and pulmonary vasculature?",
      options: [
        "Decreased left atrial pressure, decreased pulmonary artery diastolic pressure",
        "Increased left atrial pressure, increased pulmonary artery diastolic pressure",
        "Increased left atrial pressure, decreased pulmonary artery diastolic pressure",
        "Decreased left atrial pressure, increased pulmonary artery diastolic pressure",
        "Normal left atrial pressure, normal pulmonary capillary wedge pressure"
      ],
      correctAnswerIndex: 1,
      rationale: "Mitral stenosis increases resistance to flow from the left atrium into the left ventricle, causing elevated left atrial pressure. This pressure is transmitted backwards into the pulmonary veins, capillaries, and arteries, resulting in pulmonary hypertension and elevated pulmonary artery diastolic and capillary wedge pressures."
    },
    {
      examType: "USMLE Step 1",
      specialty: "Cardiology",
      difficulty: "Board-Level",
      question: "A 32-year-old immigrant from Southeast Asia presents with exertional dyspnea, dry cough, and occasional blood-tinged sputum. On physical exam, she has a low-pitched diastolic rumble best heard at the apex and a loud S1. While waiting in the clinic, she suddenly develops acute-onset right-sided weakness and a facial droop. Electrocardiogram reveals an absent P-wave pattern with irregular R-R intervals. Which of the following mechanisms best explains the cerebral event in this patient?",
      options: [
        "Paradoxical embolism via a patent foramen ovale",
        "Left atrial appendage thrombus formation secondary to stasis",
        "Rupture of a Charcot-Bouchard microaneurysm",
        "Septic emboli from infective endocarditis of the aortic valve",
        "Atherosclerotic plaque rupture in the internal carotid artery"
      ],
      correctAnswerIndex: 1,
      rationale: "The patient has mitral stenosis (diastolic rumble, loud S1, blood-tinged sputum due to pulmonary congestion/rupture of bronchial veins) complicated by new-onset atrial fibrillation (absent P-waves, irregular R-R intervals). Atrial fibrillation leads to blood stasis, especially in the left atrial appendage, predisposing to thrombus formation and systemic thromboembolism (e.g., ischemic stroke)."
    },
    {
      examType: "USMLE Step 1",
      specialty: "Pulmonology",
      difficulty: "Recall",
      question: "Which of the following cellular changes is most characteristic of chronic exposure to cigarette smoke in the bronchial epithelium of a patient with chronic bronchitis?",
      options: [
        "Squamous metaplasia",
        "Glandular atrophy",
        "Atypical hyperplasia",
        "Simple hypertrophy",
        "Coagulative necrosis"
      ],
      correctAnswerIndex: 0,
      rationale: "Chronic irritation of the respiratory epithelium by cigarette smoke triggers a protective adaptation where the normal pseudostratified ciliated columnar epithelium transitions into a stratified squamous epithelium. This is known as squamous metaplasia."
    },
    {
      examType: "USMLE Step 2",
      specialty: "Cardiology",
      difficulty: "Clinical Reasoning",
      question: "A 68-year-old man presents with severe, tearing chest pain radiating to his back. His blood pressure is 185/110 mmHg in the right arm and 150/90 mmHg in the left arm. A chest X-ray shows a widened mediastinum. Which of the following is the most appropriate initial diagnostic or therapeutic step in the management of this patient?",
      options: [
        "Immediate administration of thrombolytics",
        "Intravenous beta-blockade (e.g., esmolol) to control heart rate and blood pressure",
        "Emergent coronary angiography",
        "Oral aspirin and sublingual nitroglycerin",
        "High-dose intravenous heparin infusion"
      ],
      correctAnswerIndex: 1,
      rationale: "This clinical picture is diagnostic of an acute aortic dissection (tearing chest pain radiating to back, asymmetric arm blood pressures, widened mediastinum). The primary goal is to reduce shear stress on the aorta by lowering heart rate (target < 60/min) and systolic blood pressure (target 100-120 mmHg) using an IV beta-blocker such as esmolol or labetalol before definitive imaging (CT angiography)."
    },
    {
      examType: "PLAB 1/UKMLA",
      specialty: "Gastroenterology",
      difficulty: "Clinical Reasoning",
      question: "A 42-year-old female presents with a 6-month history of fatigue, pruritus, and dry eyes. Laboratory studies show elevated alkaline phosphatase (ALP) and positive anti-mitochondrial antibodies (AMA). Which of the following is the most likely diagnosis for this patient?",
      options: [
        "Primary biliary cholangitis (PBC)",
        "Primary sclerosing cholangitis (PSC)",
        "Autoimmune hepatitis",
        "Choledocholithiasis",
        "Alpha-1 antitrypsin deficiency"
      ],
      correctAnswerIndex: 0,
      rationale: "Primary biliary cholangitis (PBC) typically presents in middle-aged women with fatigue, pruritus, dry eyes/mouth (Sjogren's symptoms), and is characterized by a cholestatic liver pattern (elevated ALP) and the presence of anti-mitochondrial antibodies (AMA)."
    }
  ];

  // Logic to determine difficulty transitions (ADAPTIVE CHALLENGE)
  let nextDifficulty = currentDifficulty;
  let nextSpecialty = currentSpecialty;
  let remediationSpecialty = null;
  let isRemediationActive = false;

  // Let's analyze specialty hit rates to see if we need to trigger a Remediation Phase (score < 60% on minimum 2 questions)
  const specialtyStats: Record<string, { correct: number; total: number }> = {};
  sessionHistory.forEach((h: any) => {
    if (!specialtyStats[h.specialty]) {
      specialtyStats[h.specialty] = { correct: 0, total: 0 };
    }
    specialtyStats[h.specialty].total += 1;
    if (h.isCorrect) {
      specialtyStats[h.specialty].correct += 1;
    }
  });

  // Find if any specialty has dropped below 60% with at least 2 questions answered
  for (const [spec, stat] of Object.entries(specialtyStats)) {
    const rate = stat.correct / stat.total;
    if (stat.total >= 2 && rate < 0.60) {
      remediationSpecialty = spec;
      isRemediationActive = true;
      break;
    }
  }

  // Handle adaptive difficulty step based on previous question performance
  if (sessionHistory.length > 0) {
    const lastResult = sessionHistory[sessionHistory.length - 1];
    if (lastResult.isCorrect) {
      // Increase difficulty
      if (currentDifficulty === "Recall") nextDifficulty = "Clinical Reasoning";
      else if (currentDifficulty === "Clinical Reasoning") nextDifficulty = "Board-Level";
    } else {
      // Decrease difficulty or pivot to foundational
      if (currentDifficulty === "Board-Level") nextDifficulty = "Clinical Reasoning";
      else if (currentDifficulty === "Clinical Reasoning") nextDifficulty = "Recall";
    }
  }

  // If in remediation phase, override specialty and force standard scaffolding (starting at recall)
  if (isRemediationActive && remediationSpecialty) {
    nextSpecialty = remediationSpecialty;
    // Scaffolding: if they have struggled, keep it at "Recall" or "Clinical Reasoning" until they get it right
    const remediationHistory = sessionHistory.filter((h: any) => h.specialty === remediationSpecialty);
    const lastRemediation = remediationHistory[remediationHistory.length - 1];
    if (lastRemediation && !lastRemediation.isCorrect) {
      nextDifficulty = "Recall";
    }
  } else {
    nextSpecialty = focusArea && focusArea !== "All/General" ? focusArea : "Cardiology";
  }

  // Global calculations for benchmarking
  const totalQuestions = sessionHistory.length;
  const correctAnswers = sessionHistory.filter((h: any) => h.isCorrect).length;
  const rawScorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;

  // Competitive Benchmarking formula matching high-stakes standard distributions
  // Percentile: starts at 50, scales up with correct answers, penalizes wrong answers, adjusted for difficulty weight
  let difficultyBonus = 0;
  sessionHistory.forEach((h: any) => {
    if (h.difficulty === "Board-Level") difficultyBonus += h.isCorrect ? 3 : -1;
    else if (h.difficulty === "Clinical Reasoning") difficultyBonus += h.isCorrect ? 1.5 : -0.5;
  });

  let simulatedPercentile = 50 + (rawScorePercent - 50) * 0.4 + difficultyBonus;
  simulatedPercentile = Math.max(12, Math.min(99, Math.round(simulatedPercentile)));

  // Generate weak areas diagnostics list
  const weakAreas: string[] = [];
  Object.entries(specialtyStats).forEach(([spec, stat]) => {
    const rate = stat.correct / stat.total;
    if (rate < 0.65) {
      weakAreas.push(`${spec} (${Math.round(rate * 100)}% accuracy - Focus on core pathophysiology)`);
    }
  });
  if (weakAreas.length === 0 && sessionHistory.length > 2) {
    weakAreas.push("None identified yet. Excellent consistency!");
  } else if (weakAreas.length === 0) {
    weakAreas.push("Awaiting more question attempts to generate complete diagnostic summary.");
  }

  // 1. Fallback / Simulation function
  const getSimulatedQuestion = () => {
    // Attempt to match preseeded questions
    const matched = MESE_QUESTION_POOL.find(
      q => q.examType === examType && q.specialty === nextSpecialty && q.difficulty === nextDifficulty
    ) || MESE_QUESTION_POOL.find(
      q => q.specialty === nextSpecialty
    ) || MESE_QUESTION_POOL[0];

    return {
      id: "mese-fallback-" + Date.now(),
      difficulty: nextDifficulty,
      specialty: nextSpecialty,
      question: matched.question,
      options: matched.options,
      correctAnswerIndex: matched.correctAnswerIndex,
      rationale: matched.rationale
    };
  };

  // Try to use Gemini to generate an advanced, hyper-accurate, adaptive medical board MCQ
  if (!client) {
    return res.json({
      question: getSimulatedQuestion(),
      sessionStats: {
        scorePercent: rawScorePercent,
        percentile: simulatedPercentile,
        weakAreas,
        remediationSpecialty,
        isRemediationActive
      }
    });
  }

  try {
    const prompt = `You are the Medical Exam Simulation Engine (MESE), an elite board examiner for high-stakes medical exams (${examType}).
Your goal is to output a single highly realistic, clinical vignette-style multiple choice question in JSON format.

User Performance context:
- Exam Type: ${examType}
- Target Specialty: ${nextSpecialty}
- Requested Difficulty: ${nextDifficulty} (Options: "Recall", "Clinical Reasoning", "Board-Level")
- Is Remediation Mode Active: ${isRemediationActive ? "YES for " + remediationSpecialty : "NO"}
- Previous Session History: ${JSON.stringify(sessionHistory)}

You must generate an original, realistic medical board question (SBA - Single Best Answer) with exactly 5 plausible options (A to E) suitable for ${examType}.
The question must be styled as a detailed, multi-sentence clinical vignette (e.g., age, sex, chief complaint, physical exam findings, labs/imaging, followed by the question).

The response must be in valid JSON format matching this schema:
{
  "id": "mese-generated-${Date.now()}",
  "difficulty": "${nextDifficulty}",
  "specialty": "${nextSpecialty}",
  "question": "A complete clinical vignette detailing a patient scenario, ending with a direct question.",
  "options": [
    "Option A (Distractor)",
    "Option B (Distractor)",
    "Option C (Correct choice or distractor)",
    "Option D (Distractor)",
    "Option E (Distractor)"
  ],
  "correctAnswerIndex": 2, // 0-indexed index of the correct option
  "rationale": "An elite level clinical rationale explaining the exact pathophysiological or diagnostic criteria making the selected answer correct, and explicitly explaining why the other 4 distractors are incorrect in this clinical scenario."
}

Do not include any Markdown headers, code block delimiters (\`\`\`json), or conversational text. Output ONLY valid JSON.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      const parsedQuestion = JSON.parse(response.text || "{}");
      res.json({
        question: parsedQuestion,
        sessionStats: {
          scorePercent: rawScorePercent,
          percentile: simulatedPercentile,
          weakAreas,
          remediationSpecialty,
          isRemediationActive
        }
      });
    } catch (parseError) {
      console.error("MESE Gemini response parse failed, using local seed:", parseError);
      res.json({
        question: getSimulatedQuestion(),
        sessionStats: {
          scorePercent: rawScorePercent,
          percentile: simulatedPercentile,
          weakAreas,
          remediationSpecialty,
          isRemediationActive
        }
      });
    }
  } catch (err) {
    console.error("MESE Gemini API call failed, using local seed:", err);
    res.json({
      question: getSimulatedQuestion(),
      sessionStats: {
        scorePercent: rawScorePercent,
        percentile: simulatedPercentile,
        weakAreas,
        remediationSpecialty,
        isRemediationActive
      }
    });
  }
});

// 2.6. AI Doctor Path Finder Career Advisor Endpoint
app.post("/api/pathfinder", async (req, res) => {
  const { currentStatus, countryOfTraining, budget, primaryGoal, prepDurationMonths = 12 } = req.body;
  
  const client = getAIClient();

  // 1. Setup fallback data dynamically in case Gemini is offline or not configured
  const generateFallbackPathfinder = () => {
    const isUSMLE = String(primaryGoal).toLowerCase().includes("usmle");
    const isPLAB = String(primaryGoal).toLowerCase().includes("plab") || String(primaryGoal).toLowerCase().includes("ukmla");
    const isMRCP = String(primaryGoal).toLowerCase().includes("mrcp") || String(primaryGoal).toLowerCase().includes("mrcs");
    const isMCCQE = String(primaryGoal).toLowerCase().includes("mccqe");
    const isAMC = String(primaryGoal).toLowerCase().includes("amc");

    // Standard calculations
    let prob = 70;
    let rating: "High" | "Medium" | "Low" = "Medium";
    
    if (String(currentStatus).toLowerCase().includes("student")) {
      prob = isUSMLE ? 75 : isPLAB ? 85 : 80;
      rating = "High";
    } else if (String(currentStatus).toLowerCase().includes("graduate")) {
      prob = isUSMLE ? 65 : isPLAB ? 78 : 75;
      rating = "Medium";
    } else {
      prob = 70;
      rating = "Medium";
    }

    if (String(budget).toLowerCase() === "low") {
      prob -= 10;
    } else if (String(budget).toLowerCase() === "high") {
      prob += 10;
    }
    prob = Math.max(25, Math.min(95, prob));

    // Determine target exams sequence
    let exams = [];
    if (isUSMLE) {
      exams = [
        { name: "USMLE Step 1", typicalPrepMonths: 6, costEstimate: "$1,100 + local tax", keyTopics: ["Basic Sciences", "Pathology", "Pharmacology", "Biochemistry", "Microbiology"], passMark: "Pass/Fail (Score ≥ 196 equivalent)" },
        { name: "USMLE Step 2 CK", typicalPrepMonths: 5, costEstimate: "$1,100 + local tax", keyTopics: ["Clinical Knowledge", "Internal Medicine", "Surgery", "Pediatrics", "OB/GYN", "Psychiatry"], passMark: "Numerical Score (Mean ~248)" },
        { name: "OET (Occupational English Test)", typicalPrepMonths: 1, costEstimate: "$450", keyTopics: ["Medical English", "Clinical Speaking", "Reading", "Listening", "Writing"], passMark: "Grade B minimum in all sub-tests" }
      ];
    } else if (isPLAB) {
      exams = [
        { name: "OET / IELTS Exam", typicalPrepMonths: 1, costEstimate: "$450", keyTopics: ["Professional English Proficiency", "Patient Communication"], passMark: "OET Grade B or IELTS 7.5 overall" },
        { name: "PLAB 1 / UKMLA AKT", typicalPrepMonths: 3, costEstimate: "$330", keyTopics: ["Clinical Knowledge", "Best Practice Guidelines", "NICE Guidelines", "Ethics"], passMark: "Usually ~115-125 out of 180" },
        { name: "PLAB 2 / UKMLA CPSA", typicalPrepMonths: 2, costEstimate: "$1,200", keyTopics: ["Objective Structured Clinical Examination (OSCE)", "History Taking", "Examination", "Communication"], passMark: "Station-based score + communication criteria" }
      ];
    } else if (isMRCP) {
      exams = [
        { name: "MRCP Part 1", typicalPrepMonths: 4, costEstimate: "$850", keyTopics: ["Basic Medical Sciences", "Clinical Pharmacology", "Physiology", "Pathology", "Systemic Medicine"], passMark: "Scaled score ≥ 528 (Approx 60%)" },
        { name: "MRCP Part 2 Written", typicalPrepMonths: 3, costEstimate: "$850", keyTopics: ["Clinical Diagnosis", "Investigation Interpretation", "Acute Therapeutics", "Prognostic Indicators"], passMark: "Scaled score ≥ 454" },
        { name: "PACES (Clinical Examination)", typicalPrepMonths: 3, costEstimate: "$1,650", keyTopics: ["OSCE Clinical Stations", "Cardiovascular, Respiratory, Abdominal, Neurological systems", "Communication & Ethics"], passMark: "Pass all seven skills across five clinical stations" }
      ];
    } else if (isMCCQE) {
      exams = [
        { name: "MCCQE Part I", typicalPrepMonths: 6, costEstimate: "$1,450 CAD", keyTopics: ["Canadian Healthcare System", "Ethics", "Clinical Decision Making", "Psychiatry", "Preventative Health"], passMark: "Score of 226 or higher" },
        { name: "NAC OSCE", typicalPrepMonths: 3, costEstimate: "$3,100 CAD", keyTopics: ["Clinical Skills OSCE", "Patient Management", "Diagnostic Skills", "Communication and Professionalism"], passMark: "Pass based on cumulative station scores" },
        { name: "IELTS / OET Language Test", typicalPrepMonths: 1, costEstimate: "$350 CAD", keyTopics: ["English or French linguistic fluency", "Linguistic clinical accuracy"], passMark: "IELTS Academic 7.0 minimum or equivalent" }
      ];
    } else {
      // General AMC
      exams = [
        { name: "AMC Part 1 (MCQ)", typicalPrepMonths: 6, costEstimate: "$2,900 AUD", keyTopics: ["General Medicine", "Surgery", "Pediatrics", "Psychiatry", "Obstetrics & Gynecology", "Population Health"], passMark: "Score of 250 or higher" },
        { name: "AMC Part 2 (Clinical)", typicalPrepMonths: 4, costEstimate: "$4,100 AUD", keyTopics: ["Structured Clinical Stations", "History Taking", "Physical Examination", "Counseling & Patient Communication"], passMark: "Pass 10 out of 14 scored stations" },
        { name: "Language Exam (IELTS/OET)", typicalPrepMonths: 1, costEstimate: "$450 AUD", keyTopics: ["English Proficiency"], passMark: "IELTS 7.0 in each band or OET B" }
      ];
    }

    // Determine timeline phases
    const phases = [
      {
        title: "Phase 1: Foundation & Early Academic Anchoring",
        startMonth: 1,
        endMonth: Math.round(prepDurationMonths * 0.35),
        description: `Establish an ironclad study schedule, complete basic medical sciences reviews, and initiate credential evaluation via ECFMG/GMC portals.`,
        keyActionItems: [
          `Formally register with ECFMG / Epic Portals for credential verification.`,
          `Complete primary comprehensive study material passes (e.g. First Aid or Board prep).`,
          `Set up daily practice schedules of 20-30 MCQs under timed conditions.`
        ]
      },
      {
        title: "Phase 2: High-Yield Targeted Subject Training",
        startMonth: Math.round(prepDurationMonths * 0.35) + 1,
        endMonth: Math.round(prepDurationMonths * 0.70),
        description: `Deep dive into custom diagnostic clinical scenarios, intense mock simulations, and clinical experience placements.`,
        keyActionItems: [
          `Register for the primary written exam date (e.g. Step 1 / PLAB 1).`,
          `Complete 100% of high-yield Q-Banks (such as UWorld or Plabable) with review notebooks.`,
          `Arrange local or international clinical observerships / research assistantships to secure letters of recommendation.`
        ]
      },
      {
        title: "Phase 3: Ultimate Consolidation & Match Application Prep",
        startMonth: Math.round(prepDurationMonths * 0.70) + 1,
        endMonth: Number(prepDurationMonths),
        description: `Execute final high-fidelity practice exams, register with relevant medical councils, and prepare personal statement portfolios.`,
        keyActionItems: [
          `Take full-length standardized mock tests (e.g., NBME or AMC practice sets) to verify readiness.`,
          `Perform actual written/clinical board exams.`,
          `Prepare clinical portfolio, CV, and submit applications via ERAS/GMC/CaRMS portals.`
        ]
      }
    ];

    // Determine financial projections
    let budgetFactor = String(budget).toLowerCase() === "low" ? 0.75 : String(budget).toLowerCase() === "high" ? 1.5 : 1.0;
    const itemCosts = isUSMLE ? [
      { category: "Examination Registration Fees", cost: Math.round(2600 * budgetFactor), description: "USMLE Step 1 & Step 2 CK standard exam fees", savingTip: "Book exams early to avoid date change penalties." },
      { category: "Credential Evaluation", cost: 350, description: "ECFMG certification, notary fees, EPIC verification", savingTip: "Submit accurate documents on the first attempt to avoid dual submission costs." },
      { category: "High-Yield Learning Materials", cost: Math.round(600 * budgetFactor), description: "UWorld QBank, Anki subscriptions, Pathoma/First Aid", savingTip: "Use free high-yield open source decks (AnKing) and purchase second-hand textbooks." },
      { category: "Clinical Rotations & Travel", cost: Math.round(4000 * budgetFactor), description: "US Clinical Experience (USCE), flight tickets, rent", savingTip: "Leverage university-sponsored exchange programs or university hospital electives." },
      { category: "Residency Match Fees (ERAS)", cost: Math.round(1800 * budgetFactor), description: "Applying to 100+ programs, NRMP registration fees", savingTip: "Filter programs carefully to apply to IMG-friendly centers, avoiding over-application." }
    ] : [
      { category: "Language Assessment (OET)", cost: 450, description: "Occupational English Test booking and exam fee", savingTip: "Practice with official free mock resources; do not buy expensive prep classes." },
      { category: "Medical Council Fees & Written Exams", cost: Math.round(1100 * budgetFactor), description: "PLAB 1/AKT registration, council administration fees", savingTip: "Keep tracking exam seats dynamically as cancellations happen." },
      { category: "OSCE/Clinical Practicum Exams", cost: Math.round(1800 * budgetFactor), description: "PLAB 2/CPSA exam fee, mock courses, and travel to testing sites", savingTip: "Partner with peer-to-peer study groups for clinical practice instead of multiple premium courses." },
      { category: "Living & Licensing Setup Costs", cost: Math.round(2500 * budgetFactor), description: "GMC/Council registration, visa fees, NHS onboarding costs", savingTip: "Look for hospital sponsorships that reimburse GMC registration fees post-hire." }
    ];

    // Determine risks
    const risks = isUSMLE ? [
      { bottleneck: "US Clinical Experience & Visas", explanation: "Clinics/hospitals heavily prioritize applicants with hands-on US Clinical Experience. Getting a B1/B2 visa is highly challenging for certain regions.", mitigation: "Apply for university-sponsored hands-on electives while still a medical student; grads can utilize research fellow Visas." },
      { bottleneck: "Pass/Fail & High Step 2 Scores", explanation: "Since Step 1 is Pass/Fail, program directors screen primarily using Step 2 CK scores. Anything below 240 dramatically reduces match likelihood.", mitigation: "Treat Step 1 like a numerical score exam to build an impeccable base, and dedicate 5+ months specifically to Step 2 CK." },
      { bottleneck: "Financial Liquidity Constraints", explanation: "The entire USMLE pathway typically exceeds $10,000, making it extremely difficult for lower-budget applicants.", mitigation: "Work as an online medical tutor, request financial aid for electives, or secure research assistantships that provide small stipends." }
    ] : [
      { bottleneck: "Exam Seat Scarcity (PLAB / AMC)", explanation: "Exam centers have limited capacity worldwide. Booking a PLAB 1/2 slot can sometimes take up to 8-12 months of waiting.", mitigation: "Keep refreshing booking screens daily and join exam alert Telegram channels for instant cancellation notifications." },
      { bottleneck: "Changing Regulatory Landscapes (UKMLA)", explanation: "The GMC is transitionary, replacing PLAB with the UKMLA. This shifts content focus and clinical simulation standard rules.", mitigation: "Align your review syllabus precisely with the updated UKMLA content map published officially on the GMC website." },
      { bottleneck: "OSCE Failure Risk", explanation: "Hands-on clinical communication exams have high anxiety triggers and up to a 35% failure rate for foreign graduates.", mitigation: "Form high-intensity OSCE study partnerships, practice simulated timing with timers, and focus strictly on bedside manner and empathy parameters." }
    ];

    // Determine resources
    const resources = isUSMLE ? [
      { name: "UWorld USMLE Q-Bank", type: "Paid" as const, cost: "$439 - $619", urlDescription: "Gold standard question bank for written boards", whyHighYield: "Provides high-fidelity clinical vignettes and masterclass rationales." },
      { name: "First Aid for the USMLE", type: "Paid" as const, cost: "$55", urlDescription: "Syllabus Bible containing high-yield bulleted notes", whyHighYield: "Essential review manual that contains high-yield associations, mnemonics, and diagrams." },
      { name: "AnKing Anki Deck", type: "Free" as const, cost: "$0", urlDescription: "Open-source collaborative flashcard spaced repetition deck", whyHighYield: "Best tool for long-term clinical active recall and memory retention." }
    ] : [
      { name: "Plabable for PLAB 1", type: "Paid" as const, cost: "$40", urlDescription: "NICE guidelines high-yield mock exam question bank", whyHighYield: "Highly specific, matching PLAB 1 question styles with active community explanations." },
      { name: "Geeky Medics OSCE guides", type: "Free" as const, cost: "$0", urlDescription: "Clinical exam videos, checklists, and OSCE guides", whyHighYield: "Premium YouTube and web guides outlining exact communication and procedural metrics." },
      { name: "Lamy PLAB 2 Guides", type: "Free" as const, cost: "$0", urlDescription: "High-yield PLAB 2 scripts, case studies, and checklists", whyHighYield: "Excellent peer-to-peer checklists for bedside communications." }
    ];

    return {
      feasibilityCheck: {
        rating,
        assessment: `A robust and standard trajectory based on your background as a ${currentStatus} trained in ${countryOfTraining}. To successfully navigate the ${primaryGoal} track, meticulous coordination between academic examinations and clinical portfolios is mandatory.`
      },
      probabilityScore: prob,
      probabilityReasoning: `Your probability score of ${prob}% is estimated based on your timeline preference of ${prepDurationMonths} months. To push this past 90%, prioritize hands-on clinical experience early and maintain a 90%+ completion rate on high-yield exam question banks.`,
      timelinePlanner: {
        durationMonths: Number(prepDurationMonths),
        phases
      },
      examSequence: exams,
      financialBreakdown: itemCosts,
      riskFactors: risks,
      recommendedResources: resources
    };
  };

  // 2. Try to fetch dynamic personalization from Gemini API if key is present
  if (!client) {
    return res.json(generateFallbackPathfinder());
  }

  try {
    const prompt = `You are an expert Medical Career Advisor specialized in international medical licensing and postgraduate training pathways.
Please analyze this user profile and output a hyper-personalized medical career advisor roadmap in JSON format:

User Profile:
- Current Status: ${currentStatus || "MBBS Graduate"}
- Country of Training: ${countryOfTraining || "India"}
- Selected Pathway Budget Level: ${budget || "Medium"}
- Primary Medical Licensing Goal: ${primaryGoal || "USMLE (Residency in USA)"}
- Prep Timeline Selected: ${prepDurationMonths} months

Required output schema (JSON):
{
  "feasibilityCheck": {
    "rating": "High" | "Medium" | "Low",
    "assessment": "Detailed 2-3 sentence realistic feasibility assessment of this goal based on current background."
  },
  "probabilityScore": 75, // Numerical percentage score out of 100 representing probability of success
  "probabilityReasoning": "A short sentence explaining what can increase or decrease this probability score.",
  "timelinePlanner": {
    "durationMonths": ${prepDurationMonths},
    "phases": [
      {
        "title": "Phase 1: Title",
        "startMonth": 1,
        "endMonth": 4,
        "description": "Details about phase 1",
        "keyActionItems": ["Action 1", "Action 2"]
      }
    ] // Array of 3 sequential timeline phases covering the exact prepDurationMonths
  },
  "examSequence": [
    {
      "name": "Exam Name",
      "typicalPrepMonths": 6,
      "costEstimate": "$1,100",
      "keyTopics": ["Topic 1", "Topic 2"],
      "passMark": "Details about pass mark"
    }
  ],
  "financialBreakdown": [
    {
      "category": "Exam Registration Fees",
      "cost": 2600,
      "description": "Standard exam fees",
      "savingTip": "Saving advice here"
    }
  ],
  "riskFactors": [
    {
      "bottleneck": "Visa Issues / Seat scarcity",
      "explanation": "Why this happens",
      "mitigation": "Actionable way to bypass this bottleneck"
    }
  ],
  "recommendedResources": [
    {
      "name": "Resource Name",
      "type": "Free" | "Paid",
      "cost": "$40",
      "urlDescription": "Description of what it is",
      "whyHighYield": "Educational reason why it is high-yield"
    }
  ]
}

IMPORTANT RULES:
1. Always base the financial calculations on realistic, current rates for ${primaryGoal} pathways. Adjust costs appropriately based on their ${budget} budget tier.
2. The month-by-month phase duration MUST sum up or fit precisely within the user's chosen timeline of ${prepDurationMonths} months.
3. Be highly encouraging but realistically accurate. Focus on licensing board criteria.
4. Output ONLY valid, clean JSON with no extra conversational text or Markdown enclosures like \`\`\`json.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("JSON parsing error on generated roadmap:", parseError);
      res.json(generateFallbackPathfinder());
    }
  } catch (error: any) {
    console.error("Gemini API error in generate-pathfinder, falling back to local simulation:", error);
    res.json(generateFallbackPathfinder());
  }
});

// 3. Clinical Case Virtual Patient Endpoint
app.post("/api/clinical-case", async (req, res) => {
  const { action, currentHistory, userInput, patientInfo } = req.body;
  const client = getAIClient();

  if (!client) {
    // Simulated patient chat responses
    let text = "I feel a tight pressure in my chest that goes up to my jaw, and I'm sweating a lot.";
    if (userInput && userInput.toLowerCase().includes("pain")) {
      text = "Yes doctor, the pain started about an hour ago when I was walking up the stairs. It is like an elephant is sitting on my chest.";
    } else if (userInput && userInput.toLowerCase().includes("breath")) {
      text = "Yes, I am finding it quite hard to catch my breath, it feels like I'm suffocating slightly.";
    } else if (userInput && userInput.toLowerCase().includes("history")) {
      text = "My father had a heart attack at 52, and I have high blood pressure which I take pills for, though I sometimes forget.";
    }
    return res.json({ response: text });
  }

  try {
    let prompt = "";
    if (action === "initiate") {
      prompt = `Create the opening dialogue for a simulated medical patient presentation.
Patient Profile: ${JSON.stringify(patientInfo)}
The patient should describe their primary complaint in natural, non-medical lay terms.
Be brief (1-2 sentences) and realistic.`;
    } else {
      prompt = `You are a simulated medical patient in an OSCE clinical station.
Your Profile: ${JSON.stringify(patientInfo)}
Medical History so far: ${currentHistory || ""}
The student doctor asks: "${userInput}"

Respond naturally in character as a worried patient. Do not use advanced medical terminology that a patient wouldn't know. Stay consistent with your diagnosis. Limit to 2-3 sentences.`;
    }

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error("Gemini API error in clinical-case, falling back to local simulation:", error);
    let text = "I feel a tight pressure in my chest that goes up to my jaw, and I'm sweating a lot.";
    const userInputLower = (userInput || "").toLowerCase();
    if (userInputLower.includes("pain")) {
      text = "Yes doctor, the pain started about an hour ago when I was walking up the stairs. It is like an elephant is sitting on my chest.";
    } else if (userInputLower.includes("breath")) {
      text = "Yes, I am finding it quite hard to catch my breath, it feels like I'm suffocating slightly.";
    } else if (userInputLower.includes("history")) {
      text = "My father had a heart attack at 52, and I have high blood pressure which I take pills for, though I sometimes forget.";
    }
    res.json({ response: text });
  }
});

// 4. Drug Query Specialist Endpoint
app.post("/api/drug-query", async (req, res) => {
  const { query } = req.body;
  const client = getAIClient();

  if (!client) {
    // Simulated drug details if no API key
    return res.json({
      genericName: "Empagliflozin",
      brandName: "Jardiance",
      manufacturer: "Boehringer Ingelheim / Eli Lilly",
      drugClass: "SGLT2 (Sodium-Glucose Co-Transporter 2) Inhibitor",
      indications: "Treatment of Type 2 Diabetes Mellitus to improve glycemic control; reduction of cardiovascular death in adults with Type 2 Diabetes and established CV disease; treatment of heart failure (NYHA class II-IV) with reduced or preserved ejection fraction.",
      contraindications: "Hypersensitivity to empagliflozin, severe renal impairment (eGFR < 20 mL/min/1.73m²), end-stage renal disease, or patients on dialysis.",
      sideEffects: "Urinary tract infections, vulvovaginal candidiasis (yeast infections), increased urination, dehydration, diabetic ketoacidosis (DKA) in rare cases.",
      drugInteractions: "Diuretics (increases risk of dehydration/hypotension), insulin or insulin secretagogues (increases risk of hypoglycemia).",
      dosage: "10 mg orally once daily, can be increased to 25 mg once daily if tolerated and additional glycemic control is required.",
      pregnancyCategory: "Category C (avoid in 2nd and 3rd trimesters due to potential renal risk to fetus).",
      lactationSafety: "Not recommended during breastfeeding.",
      fdaStatus: "Approved"
    });
  }

  try {
    const prompt = `Return highly detailed, professional medical drug profile information for the query: "${query}".
Format the response strictly as a JSON object with this exact schema:
{
  "genericName": "Generic Name",
  "brandName": "Common Brand Names",
  "manufacturer": "Key Manufacturers",
  "drugClass": "Drug Class / Mechanism",
  "indications": "Clinical Indications",
  "contraindications": "Contraindications & Black box warnings",
  "sideEffects": "Common & Severe Adverse Reactions",
  "drugInteractions": "Major Drug Interactions",
  "dosage": "Standard Adult Dosage & Renal Adjustments",
  "pregnancyCategory": "Pregnancy Category & Notes",
  "lactationSafety": "Lactation Safety Profile",
  "fdaStatus": "FDA Approval Status"
}

Ensure all fields are fully filled, professional, and reference-accurate. Do not wrap in markdown or write additional text. Return raw JSON.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse drug JSON response:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini API error in drug-query, falling back to local simulation:", error);
    res.json({
      genericName: query || "Empagliflozin",
      brandName: "Jardiance",
      manufacturer: "Boehringer Ingelheim / Eli Lilly",
      drugClass: "SGLT2 (Sodium-Glucose Co-Transporter 2) Inhibitor",
      indications: "Treatment of Type 2 Diabetes Mellitus to improve glycemic control; reduction of cardiovascular death in adults with Type 2 Diabetes and established CV disease; treatment of heart failure (NYHA class II-IV) with reduced or preserved ejection fraction.",
      contraindications: "Hypersensitivity to empagliflozin, severe renal impairment (eGFR < 20 mL/min/1.73m²), end-stage renal disease, or patients on dialysis.",
      sideEffects: "Urinary tract infections, vulvovaginal candidiasis (yeast infections), increased urination, dehydration, diabetic ketoacidosis (DKA) in rare cases.",
      drugInteractions: "Diuretics (increases risk of dehydration/hypotension), insulin or insulin secretagogues (increases risk of hypoglycemia).",
      dosage: "10 mg orally once daily, can be increased to 25 mg once daily if tolerated and additional glycemic control is required.",
      pregnancyCategory: "Category C (avoid in 2nd and 3rd trimesters due to potential renal risk to fetus).",
      lactationSafety: "Not recommended during breastfeeding.",
      fdaStatus: "Approved"
    });
  }
});

// 4b. Pharma Cross-Reference Endpoint
app.post("/api/pharma-cross-reference", async (req, res) => {
  const { term, definition } = req.body;
  const client = getAIClient();

  // If no AI client, or for quick static fallback matching
  const termLower = (term || "").toLowerCase();
  
  if (!client) {
    // Elegant clinical fallback database for preseeded dictionary terms
    let treatments = [];
    if (termLower.includes("anaphylaxis")) {
      treatments = [
        {
          genericName: "Epinephrine Hydrochloride",
          brandName: "EpiPen, Adrenaclick",
          drugClass: "Sympathomimetic Agent (Alpha/Beta Agonist)",
          clinicalRole: "Acute Rescue (First-line)",
          indications: "Emergency treatment of severe acute allergic reactions (Type I anaphylaxis) to insect bites, foods, drugs, or idiopathic triggers.",
          mechanismOfAction: "Acts on both alpha and beta-adrenergic receptors to induce rapid vasoconstriction (reversing severe hypotension) and bronchodilation (relieving bronchospasm).",
          matchRationale: "Directly treats the life-threatening systemic vasodilation and bronchoconstriction described in Anaphylaxis."
        },
        {
          genericName: "Methylprednisolone Sodium Succinate",
          brandName: "Solu-Medrol",
          drugClass: "Systemic Glucocorticoid",
          clinicalRole: "Adjunctive Therapy",
          indications: "Secondary management of severe allergic states unresponsive to conventional treatments; prevents biphasic anaphylaxis recurrence.",
          mechanismOfAction: "Suppresses inflammatory cytokine synthesis and decreases capillary permeability to reduce mucosal edema and systemic airway inflammation.",
          matchRationale: "Used as secondary prevention for biphasic anaphylaxis recurrence hours after initial epinephrine rescue."
        }
      ];
    } else if (termLower.includes("rhabdomyolysis")) {
      treatments = [
        {
          genericName: "Isotonic Sodium Chloride (0.9% NaCl)",
          brandName: "Normal Saline IV",
          drugClass: "Crystalloid Intravenous Fluid",
          clinicalRole: "First-Line Resuscitation",
          indications: "Early aggressive volume expansion in patients with severe skeletal muscle trauma, crush syndrome, or extreme physical exertion.",
          mechanismOfAction: "Restores intravascular volume, increases glomerular filtration rate (GFR), and dilutes nephrotoxic myoglobin to prevent acute tubular necrosis (ATN).",
          matchRationale: "Directly counters the nephrotoxic accumulation of myoglobin in the renal tubules caused by skeletal muscle breakdown."
        },
        {
          genericName: "Atorvastatin Calcium",
          brandName: "Lipitor",
          drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
          clinicalRole: "Implicated/Associated Agent",
          indications: "Treatment of primary hypercholesterolemia; strictly monitored due to minor risks of muscle-related toxicity.",
          mechanismOfAction: "Inhibits cholesterol synthesis in the liver, which can occasionally alter muscle cell membrane integrity and lead to structural damage.",
          matchRationale: "Statins are a classic class-wide trigger for drug-induced myalgia, myotoxicity, and severe Rhabdomyolysis."
        }
      ];
    } else if (termLower.includes("preeclampsia")) {
      treatments = [
        {
          genericName: "Magnesium Sulfate",
          brandName: "Magnesium Sulfate IV",
          drugClass: "Anticonvulsant / Osmotic Electrolyte",
          clinicalRole: "Prophylaxis (First-Line)",
          indications: "Prevention and control of seizures in preeclampsia with severe features; neuroprotection of the fetus in premature delivery.",
          mechanismOfAction: "Blocks neuromuscular transmission and produces cerebral vasodilation by acting as a competitive calcium antagonist, elevating seizure threshold.",
          matchRationale: "The gold-standard pharmacological prophylaxis against life-threatening maternal eclamptic seizures."
        },
        {
          genericName: "Labetalol Hydrochloride",
          brandName: "Trandate",
          drugClass: "Combined Alpha and Beta-Adrenergic Blocker",
          clinicalRole: "First-Line Antihypertensive",
          indications: "Acute and chronic management of severe gestational hypertension and preeclampsia.",
          mechanismOfAction: "Competitively blocks alpha-1, beta-1, and beta-2 receptors, reducing systemic vascular resistance and blood pressure without causing reflex tachycardia.",
          matchRationale: "Safely controls blood pressure spike to prevent maternal cerebral hemorrhage without compromising uterine arterial blood flow."
        }
      ];
    } else if (termLower.includes("pneumothorax")) {
      treatments = [
        {
          genericName: "Oxygen (Supplemental)",
          brandName: "High-Flow Oxygen, Nasal Cannula / Non-Rebreather",
          drugClass: "Medical Gas Therapy",
          clinicalRole: "Adjunctive Therapy",
          indications: "Initial conservative management of stable, small primary spontaneous pneumothorax; relief of severe hypoxemia.",
          mechanismOfAction: "Displaces nitrogen in the alveoli and blood, creating a high pressure gradient that accelerates the pleural air absorption rate by up to 4-fold.",
          matchRationale: "Accelerates natural reabsorption of pleural air and maintains arterial oxygenation during lung collapse."
        },
        {
          genericName: "Lidocaine Hydrochloride",
          brandName: "Xylocaine",
          drugClass: "Local Anesthetic (Amide-Type)",
          clinicalRole: "Procedural / Adjunctive",
          indications: "Infiltration anesthesia before chest tube insertion, needle decompression, or pleural aspiration.",
          mechanismOfAction: "Blocks sodium channels along nerve axons to reversibly inhibit action potential conduction, providing localized sensory block.",
          matchRationale: "Crucial procedural agent to anesthetize tissues prior to emergency decompression interventions."
        }
      ];
    } else {
      // General dynamic fallback based on keyword guesses
      treatments = [
        {
          genericName: "Metformin Hydrochloride",
          brandName: "Glucophage",
          drugClass: "Biguanide Oral Antidiabetic",
          clinicalRole: "First-Line Therapy",
          indications: "Management of Type 2 Diabetes Mellitus to lower glucose production and improve insulin sensitivity.",
          mechanismOfAction: "Activates AMP-activated protein kinase (AMPK) to decrease hepatic gluconeogenesis and increase peripheral glucose uptake.",
          matchRationale: "Suggested first-line metabolic agent cross-referenced from general medical databases."
        }
      ];
    }

    return res.json({ treatments });
  }

  try {
    const prompt = `Cross-reference the medical term "${term}" and its clinical definition: "${definition}".
Identify 2 or 3 of the most relevant, high-yield pharmaceutical treatments, drug classes, or rescue drugs used in management, or implicated drugs (like Statins causing Rhabdomyolysis).

Format the response strictly as a JSON object with this exact schema:
{
  "treatments": [
    {
      "genericName": "Generic Name of Drug/Therapy",
      "brandName": "Common Brand Names",
      "drugClass": "Pharmacological Drug Class",
      "clinicalRole": "First-Line / Acute Rescue / Prophylaxis / Adjunctive / Implicated Agent",
      "indications": "Specific indications related to managing or triggering this term",
      "mechanismOfAction": "Brief mechanism of action explaining how it works at a cellular/physiological level",
      "matchRationale": "Clear, precise explanation of why this drug is highlighted in relation to ${term}"
    }
  ]
}

Make all details highly accurate, professional, and reference-ready. Return only the raw JSON. No markdown wraps or text.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse cross-referenced pharmaceutical response:", parseError);
      throw parseError;
    }
  } catch (err) {
    console.error("Gemini API error in pharma-cross-reference, falling back to local simulation:", err);
    const termLower = (term || "").toLowerCase();
    let treatments = [];
    if (termLower.includes("anaphylaxis")) {
      treatments = [
        {
          genericName: "Epinephrine Hydrochloride",
          brandName: "EpiPen, Adrenaclick",
          drugClass: "Sympathomimetic Agent (Alpha/Beta Agonist)",
          clinicalRole: "Acute Rescue (First-line)",
          indications: "Emergency treatment of severe acute allergic reactions (Type I anaphylaxis) to insect bites, foods, drugs, or idiopathic triggers.",
          mechanismOfAction: "Acts on both alpha and beta-adrenergic receptors to induce rapid vasoconstriction (reversing severe hypotension) and bronchodilation (relieving bronchospasm).",
          matchRationale: "Directly treats the life-threatening systemic vasodilation and bronchoconstriction described in Anaphylaxis."
        },
        {
          genericName: "Methylprednisolone Sodium Succinate",
          brandName: "Solu-Medrol",
          drugClass: "Systemic Glucocorticoid",
          clinicalRole: "Adjunctive Therapy",
          indications: "Secondary management of severe allergic states unresponsive to conventional treatments; prevents biphasic anaphylaxis recurrence.",
          mechanismOfAction: "Suppresses inflammatory cytokine synthesis and decreases capillary permeability to reduce mucosal edema and systemic airway inflammation.",
          matchRationale: "Used as secondary prevention for biphasic anaphylaxis recurrence hours after initial epinephrine rescue."
        }
      ];
    } else if (termLower.includes("rhabdomyolysis")) {
      treatments = [
        {
          genericName: "Isotonic Sodium Chloride (0.9% NaCl)",
          brandName: "Normal Saline IV",
          drugClass: "Crystalloid Intravenous Fluid",
          clinicalRole: "First-Line Resuscitation",
          indications: "Early aggressive volume expansion in patients with severe skeletal muscle trauma, crush syndrome, or extreme physical exertion.",
          mechanismOfAction: "Restores intravascular volume, increases glomerular filtration rate (GFR), and dilutes nephrotoxic myoglobin to prevent acute tubular necrosis (ATN).",
          matchRationale: "Directly counters the nephrotoxic accumulation of myoglobin in the renal tubules caused by skeletal muscle breakdown."
        },
        {
          genericName: "Atorvastatin Calcium",
          brandName: "Lipitor",
          drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
          clinicalRole: "Implicated/Associated Agent",
          indications: "Treatment of primary hypercholesterolemia; strictly monitored due to minor risks of muscle-related toxicity.",
          mechanismOfAction: "Inhibits cholesterol synthesis in the liver, which can occasionally alter muscle cell membrane integrity and lead to structural damage.",
          matchRationale: "Statins are a classic class-wide trigger for drug-induced myalgia, myotoxicity, and severe Rhabdomyolysis."
        }
      ];
    } else if (termLower.includes("preeclampsia")) {
      treatments = [
        {
          genericName: "Magnesium Sulfate",
          brandName: "Magnesium Sulfate IV",
          drugClass: "Anticonvulsant / Osmotic Electrolyte",
          clinicalRole: "Prophylaxis (First-Line)",
          indications: "Prevention and control of seizures in preeclampsia with severe features; neuroprotection of the fetus in premature delivery.",
          mechanismOfAction: "Blocks neuromuscular transmission and produces cerebral vasodilation by acting as a competitive calcium antagonist, elevating seizure threshold.",
          matchRationale: "The gold-standard pharmacological prophylaxis against life-threatening maternal eclamptic seizures."
        },
        {
          genericName: "Labetalol Hydrochloride",
          brandName: "Trandate",
          drugClass: "Combined Alpha and Beta-Adrenergic Blocker",
          clinicalRole: "First-Line Antihypertensive",
          indications: "Acute and chronic management of severe gestational hypertension and preeclampsia.",
          mechanismOfAction: "Competitively blocks alpha-1, beta-1, and beta-2 receptors, reducing systemic vascular resistance and blood pressure without causing reflex tachycardia.",
          matchRationale: "Safely controls blood pressure spike to prevent maternal cerebral hemorrhage without compromising uterine arterial blood flow."
        }
      ];
    } else if (termLower.includes("pneumothorax")) {
      treatments = [
        {
          genericName: "Oxygen (Supplemental)",
          brandName: "High-Flow Oxygen, Nasal Cannula / Non-Rebreather",
          drugClass: "Medical Gas Therapy",
          clinicalRole: "Adjunctive Therapy",
          indications: "Initial conservative management of stable, small primary spontaneous pneumothorax; relief of severe hypoxemia.",
          mechanismOfAction: "Displaces nitrogen in the alveoli and blood, creating a high pressure gradient that accelerates the pleural air absorption rate by up to 4-fold.",
          matchRationale: "Accelerates natural reabsorption of pleural air and maintains arterial oxygenation during lung collapse."
        },
        {
          genericName: "Lidocaine Hydrochloride",
          brandName: "Xylocaine",
          drugClass: "Local Anesthetic (Amide-Type)",
          clinicalRole: "Procedural / Adjunctive",
          indications: "Infiltration anesthesia before chest tube insertion, needle decompression, or pleural aspiration.",
          mechanismOfAction: "Blocks sodium channels along nerve axons to reversibly inhibit action potential conduction, providing localized sensory block.",
          matchRationale: "Crucial procedural agent to anesthetize tissues prior to emergency decompression interventions."
        }
      ];
    } else {
      treatments = [
        {
          genericName: "Metformin Hydrochloride",
          brandName: "Glucophage",
          drugClass: "Biguanide Oral Antidiabetic",
          clinicalRole: "First-Line Therapy",
          indications: "Management of Type 2 Diabetes Mellitus to lower glucose production and improve insulin sensitivity.",
          mechanismOfAction: "Activates AMP-activated protein kinase (AMPK) to decrease hepatic gluconeogenesis and increase peripheral glucose uptake.",
          matchRationale: "Suggested first-line metabolic agent cross-referenced from general medical databases."
        }
      ];
    }
    res.json({ treatments });
  }
});

// 4c. Knowledge Snapshot Endpoint
app.post("/api/knowledge-snapshot", async (req, res) => {
  const { performance } = req.body;
  const client = getAIClient();

  // Standardize performance map or fallback to realistic default study history
  const data = (performance && Object.keys(performance).length > 0) ? performance : {
    "Cardiology": { correct: 14, total: 18 },
    "Pulmonology": { correct: 6, total: 12 },
    "Neurology": { correct: 9, total: 10 },
    "Gastroenterology": { correct: 11, total: 15 },
    "Nephrology": { correct: 5, total: 11 },
    "Endocrinology": { correct: 8, total: 9 }
  };

  // Compute calculated metrics for fallback & to guide the prompt
  const analysisList = Object.entries(data).map(([spec, stats]: [string, any]) => {
    const total = stats.total || 0;
    const correct = stats.correct || 0;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { specialty: spec, correct, total, pct };
  });

  const activeAnalysis = analysisList.filter(item => item.total > 0);
  activeAnalysis.sort((a, b) => b.pct - a.pct);

  const strengths = activeAnalysis.slice(0, 2);
  const gaps = activeAnalysis.slice(-2).reverse();

  if (!client) {
    // Generate high-quality static fallback summary using client's real-time statistics
    let fallbackText = `### 🩺 Your Clinical Performance Synthesis

An analysis of your academic profile indicates **active engagement** across **${activeAnalysis.length} core specialties**. Here is your customized clinical snapshot:

#### 🌟 Primary Strengths
${strengths.map(item => `* **${item.specialty}** (${item.pct}% accuracy, **${item.correct}/${item.total}**): Demonstrates high-tier diagnostic recall, pathophysiology matching, and patient care planning in clinical vignettes.`).join("\n")}

#### ⚠️ Clinical Knowledge Gaps & Focus Areas
${gaps.map(item => `* **${item.specialty}** (${item.pct}% accuracy, **${item.correct}/${item.total}**): Focus on refining first-line medication choices, fluid resuscitation targets, and differential exclusions for high-risk syndromes.`).join("\n")}

#### 💡 Suggested Action Plan & Takeaways
1. **Targeted Review**: Spend 15 minutes reviewing active flashcards for **${gaps[0]?.specialty || "your weaker specialties"}** under the spaced repetition deck.
2. **Clinical Correlates**: Use the **Drug Directory** to reinforce pharmacokinetics and contraindicated therapies for drugs related to **${strengths[0]?.specialty || "Cardiology"}** to maximize diagnostic speed.
3. **Advanced Training**: Test your knowledge on Board-Level questions inside the **OSCE Patient Simulator** to master diagnostic workups.`;

    return res.json({ snapshot: fallbackText });
  }

  try {
    const prompt = `You are an elite clinical medical director and academic coach. 
Generate a comprehensive, encouraging, and highly professional clinical "Knowledge Snapshot" synthesizing the student's recent multiple-choice question (MCQ) performance.

Here is their current performance database across specialties:
${JSON.stringify(analysisList, null, 2)}

Provide a textual synthesis in clean Markdown format with the following sections:
1. **Clinical Summary**: A brief, high-level analysis of their current academic trajectory and diagnostic capability.
2. **Demonstrated Strengths**: Analyze their top-performing specialties (highest accuracy/volume). Point out why this matters clinically.
3. **Clinical Gaps & Knowledge Holes**: Identify their lowest-performing areas or those with low engagement. Highlight specific pathophysiological concepts or diagnostic challenges associated with these specialties they must revise.
4. **Actionable Study Recommendation**: Provide 3 hyper-targeted, high-yield coaching strategies they can execute right now (e.g. leveraging flashcards, cross-referencing pharmaceutical indications, adjusting MCQ difficulty).

Ensure the tone is supportive, highly intellectual, and clinically precise. Keep the summary concise but extremely valuable. Return only the raw Markdown text.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ snapshot: response.text || "No snapshot generated." });
  } catch (err) {
    console.error("Gemini API error in knowledge-snapshot, falling back to local simulation:", err);
    let fallbackText = `### 🩺 Your Clinical Performance Synthesis
 
An analysis of your academic profile indicates **active engagement** across **${activeAnalysis.length} core specialties**. Here is your customized clinical snapshot:
 
#### 🌟 Primary Strengths
${strengths.map(item => `* **${item.specialty}** (${item.pct}% accuracy, **${item.correct}/${item.total}**): Demonstrates high-tier diagnostic recall, pathophysiology matching, and patient care planning in clinical vignettes.`).join("\n")}
 
#### ⚠️ Clinical Knowledge Gaps & Focus Areas
${gaps.map(item => `* **${item.specialty}** (${item.pct}% accuracy, **${item.correct}/${item.total}**): Focus on refining first-line medication choices, fluid resuscitation targets, and differential exclusions for high-risk syndromes.`).join("\n")}
 
#### 💡 Suggested Action Plan & Takeaways
1. **Targeted Review**: Spend 15 minutes reviewing active flashcards for **${gaps[0]?.specialty || "your weaker specialties"}** under the spaced repetition deck.
2. **Clinical Correlates**: Use the **Drug Directory** to reinforce pharmacokinetics and contraindicated therapies for drugs related to **${strengths[0]?.specialty || "Cardiology"}** to maximize diagnostic speed.
3. **Advanced Training**: Test your knowledge on Board-Level questions inside the **OSCE Patient Simulator** to master diagnostic workups.`;

    res.json({ snapshot: fallbackText });
  }
});

interface RoomPeer {
  id: string;
  name: string;
  avatarColor: string;
  selectedOption: number | null;
}

interface RoomChat {
  sender: string;
  content: string;
  timestamp: string;
  avatarColor: string;
}

interface StudyRoom {
  id: string;
  currentMcq: any;
  peers: RoomPeer[];
  chatHistory: RoomChat[];
  questionIndex: number;
}

const studyRooms = new Map<string, StudyRoom>();
const sseClients = new Map<string, express.Response[]>();

async function getNewQuestionForRoom() {
  const specialties = ["Cardiology", "Endocrinology", "Gastroenterology", "Pulmonology", "Emergency Medicine", "Pediatrics", "Neurology", "Psychiatry"];
  const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
  const difficulties = ["Medium", "Hard"];
  const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

  const client = getAIClient();
  if (!client) {
    const fallbacks = [
      {
        question: "A 54-year-old female presents with progressive exertional dyspnea. She reports having a history of rheumatic fever as a child. On auscultation, a low-pitched, rumbling diastolic murmur is heard at the apex, preceded by an opening snap. What is the most likely diagnosis?",
        options: ["Mitral Stenosis", "Mitral Regurgitation", "Aortic Stenosis", "Aortic Regurgitation"],
        correctAnswer: 0,
        rationale: "Mitral stenosis is classic for presenting with a low-pitched diastolic rumble heard best at the apex with the bell in the left lateral decubitus position. It is preceded by a sharp 'opening snap' which represents the tensed mitral valve leaflets snapping open under pressure. Rheumatic fever is the leading cause globally.",
        difficulty: "Medium",
        specialty: "Cardiology"
      },
      {
        question: "A 32-year-old male is brought to the emergency department after a high-impact motor vehicle accident. He is in respiratory distress. Trachea is deviated to the right, breath sounds are absent on the left, and there is hyperresonance to percussion on the left hemithorax. His BP is 80/40 mmHg. Which of the following is the immediate next step in management?",
        options: ["Obtain an immediate Chest X-ray", "Perform needle decompression in the left 2nd intercostal space", "Insert a left-sided chest tube (tube thoracostomy)", "Intubate the patient and initiate positive pressure ventilation"],
        correctAnswer: 1,
        rationale: "This patient is presenting with signs of a left-sided tension pneumothorax. Immediate needle decompression is indicated, followed promptly by a chest tube.",
        difficulty: "Hard",
        specialty: "Emergency Medicine"
      },
      {
        question: "A 45-year-old male presents with severe epigastric pain radiating to his back. He has a history of alcohol abuse. On examination, he is tachycardic and has tenderness in the epigastrium. Lab results reveal serum amylase and lipase levels more than three times the upper limit of normal. What is the most likely diagnosis?",
        options: ["Acute Cholecystitis", "Acute Pancreatitis", "Peptic Ulcer Disease", "Myocardial Infarction"],
        correctAnswer: 1,
        rationale: "Acute pancreatitis presents with severe epigastric pain radiating to the back and elevated lipase/amylase > 3x normal. Alcohol abuse and gallstones are the most common causes.",
        difficulty: "Medium",
        specialty: "Gastroenterology"
      }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    const prompt = `Generate a single multiple-choice question (MCQ) for a medical licensing exam.
Specialty: ${randomSpecialty}
Difficulty: ${randomDifficulty}

The response must be in JSON format matching this schema:
{
  "question": "The clinical vignette or question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "rationale": "Detailed explanation of why the correct option is right and others are incorrect."
}

Do not include any markdown wrap or extra text. Just output the clean JSON.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      question: "A 54-year-old female presents with progressive exertional dyspnea. She reports having a history of rheumatic fever as a child. On auscultation, a low-pitched, rumbling diastolic murmur is heard at the apex, preceded by an opening snap. What is the most likely diagnosis?",
      options: ["Mitral Stenosis", "Mitral Regurgitation", "Aortic Stenosis", "Aortic Regurgitation"],
      correctAnswer: 0,
      rationale: "Mitral stenosis is classic for presenting with a low-pitched diastolic rumble heard best at the apex. Rheumatic fever is the leading cause globally.",
      difficulty: "Medium",
      specialty: "Cardiology"
    };
  }
}

function broadcastToRoom(roomId: string, data: any) {
  const clients = sseClients.get(roomId);
  if (!clients) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => {
    try {
      res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// 1. Create Room
app.post("/api/study-rooms/create", async (req, res) => {
  const { hostName, avatarColor } = req.body;
  const roomId = "MED-ROOM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const hostPeer: RoomPeer = {
    id: "peer_" + Math.random().toString(36).substring(2, 10),
    name: hostName || "Dr. Host",
    avatarColor: avatarColor || "#003B95",
    selectedOption: null
  };

  const initialMcq = await getNewQuestionForRoom();
  const newRoom: StudyRoom = {
    id: roomId,
    currentMcq: initialMcq,
    peers: [hostPeer],
    chatHistory: [{
      sender: "System",
      content: `${hostPeer.name} initialized this collaborative study room. Share the session ID with peers!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarColor: "#64748B"
    }],
    questionIndex: 1
  };

  studyRooms.set(roomId, newRoom);
  res.json({ roomId, peerId: hostPeer.id, room: newRoom });
});

// 2. Join Room
app.post("/api/study-rooms/:roomId/join", (req, res) => {
  const { roomId } = req.params;
  const { name, avatarColor } = req.body;

  const room = studyRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Virtual study room session not found." });
  }

  const newPeer: RoomPeer = {
    id: "peer_" + Math.random().toString(36).substring(2, 10),
    name: name || "Collaborator",
    avatarColor: avatarColor || "#10B981",
    selectedOption: null
  };

  room.peers.push(newPeer);
  room.chatHistory.push({
    sender: "System",
    content: `${newPeer.name} joined the room. Ready for collaborative diagnostics!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatarColor: "#64748B"
  });

  res.json({ peerId: newPeer.id, room });
  broadcastToRoom(roomId, { type: "sync", room });
});

// 3. SSE Stream endpoint
app.get("/api/study-rooms/:roomId/stream", (req, res) => {
  const { roomId } = req.params;
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (!sseClients.has(roomId)) {
    sseClients.set(roomId, []);
  }
  sseClients.get(roomId)!.push(res);

  // Send initial ping to establish
  res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);

  req.on("close", () => {
    const clients = sseClients.get(roomId) || [];
    const filtered = clients.filter(c => c !== res);
    if (filtered.length === 0) {
      sseClients.delete(roomId);
    } else {
      sseClients.set(roomId, filtered);
    }
  });
});

// 4. Peer select/submit option
app.post("/api/study-rooms/:roomId/submit-answer", (req, res) => {
  const { roomId } = req.params;
  const { peerId, optionIndex } = req.body;

  const room = studyRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Study room not found." });
  }

  const peer = room.peers.find(p => p.id === peerId);
  if (peer) {
    peer.selectedOption = optionIndex;
    
    const formattedOpt = String.fromCharCode(65 + optionIndex);
    room.chatHistory.push({
      sender: "System",
      content: `${peer.name} submitted response: Option ${formattedOpt}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarColor: "#94A3B8"
    });

    broadcastToRoom(roomId, { type: "sync", room });
  }

  res.json({ success: true, room });
});

// 5. Next question
app.post("/api/study-rooms/:roomId/next-question", async (req, res) => {
  const { roomId } = req.params;
  const { peerId } = req.body;

  const room = studyRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Study room not found." });
  }

  const triggeringPeer = room.peers.find(p => p.id === peerId);
  const peerName = triggeringPeer ? triggeringPeer.name : "A peer";

  room.peers.forEach(p => p.selectedOption = null);
  
  const nextMcq = await getNewQuestionForRoom();
  room.currentMcq = nextMcq;
  room.questionIndex += 1;

  room.chatHistory.push({
    sender: "System",
    content: `${peerName} advanced the session to Question #${room.questionIndex}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatarColor: "#64748B"
  });

  broadcastToRoom(roomId, { type: "sync", room });
  res.json({ success: true, room });
});

// 6. Post chat message
app.post("/api/study-rooms/:roomId/chat", (req, res) => {
  const { roomId } = req.params;
  const { peerId, content } = req.body;

  const room = studyRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Study room not found." });
  }

  const peer = room.peers.find(p => p.id === peerId);
  if (peer) {
    const chatMsg: RoomChat = {
      sender: peer.name,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarColor: peer.avatarColor
    };
    room.chatHistory.push(chatMsg);
    
    if (room.chatHistory.length > 50) {
      room.chatHistory.shift();
    }

    broadcastToRoom(roomId, { type: "sync", room });
  }

  res.json({ success: true, room });
});

// 7. Leave room
app.post("/api/study-rooms/:roomId/leave", (req, res) => {
  const { roomId } = req.params;
  const { peerId } = req.body;

  const room = studyRooms.get(roomId);
  if (room) {
    const peer = room.peers.find(p => p.id === peerId);
    if (peer) {
      room.chatHistory.push({
        sender: "System",
        content: `${peer.name} departed the room.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarColor: "#64748B"
      });
      room.peers = room.peers.filter(p => p.id !== peerId);
      
      if (room.peers.length === 0) {
        studyRooms.delete(roomId);
      } else {
        broadcastToRoom(roomId, { type: "sync", room });
      }
    }
  }
  res.json({ success: true });
});

// 4d. Dynamic EHR Case Study Generator Endpoint
app.post("/api/generate-case-study", async (req, res) => {
  const { specialty } = req.body;
  const client = getAIClient();

  if (!client) {
    // Elegant fallback based on requested specialty
    const specialtyLower = (specialty || "").toLowerCase();
    let fallbackCase = {
      id: `case_fallback_${Date.now()}`,
      patientName: "Eleanor Vance",
      age: 67,
      gender: "Female",
      occupation: "Retired Schoolteacher",
      chiefComplaint: "Sudden onset of dyspnea and sharp, pleuritic right-sided chest pain",
      historyOfPresentIllness: "The patient describes a sudden sharp pain in her right chest that worsens with deep inspiration, accompanied by a feeling of air hunger. She returned from a 14-hour trans-atlantic flight three days ago and has since noticed moderate swelling and a dull ache in her left calf.",
      vitals: {
        bp: "112/76",
        hr: 115,
        rr: 26,
        temp: "37.4 °C",
        spo2: 89
      },
      physicalExam: "Mildly respiratory distressed, utilizing accessory chest muscles. Lungs are clear to auscultation bilaterally without wheezes or crackles. Left lower extremity exhibits pitting edema to the mid-calf with mild erythema and localized calf tenderness on palpation.",
      ecgOrLabSnippet: "ECG shows sinus tachycardia at 115 bpm with an S1Q3T3 pattern (deep S wave in lead I, Q wave in lead III, T-wave inversion in lead III). D-dimer is significantly elevated at 1,850 ng/mL.",
      finalDiagnosis: "Acute Pulmonary Embolism (PE) secondary to Deep Vein Thrombosis (DVT)",
      correctManagement: "Systemic anticoagulation with Low-Molecular-Weight Heparin (LMWH) or unfractionated heparin, oxygen therapy to maintain SpO2 > 90%, and monitoring for hemodynamic instability.",
      options: [
        "Initiate oral Aspirin 325mg daily and discharge to home clinic",
        "Perform immediate bedside needle decompression in the second intercostal space",
        "Administer intravenous Heparin bolus followed by continuous infusion",
        "Obtain a non-contrast High-Resolution Chest CT to evaluate for interstitial lung disease"
      ],
      correctOptionIndex: 2,
      optionExplanations: [
        "Incorrect. Aspirin is an antiplatelet agent and is insufficient for the acute treatment of a confirmed or highly suspected pulmonary embolism.",
        "Incorrect. Needle decompression is the treatment for a tension pneumothorax, which is ruled out by bilaterally clear breath sounds.",
        "Correct. The patient has a high clinical probability (Wells Score > 6) of a pulmonary embolism, supported by hypoxia, tachycardia, and S1Q3T3. Quick initiation of therapeutic anticoagulation with intravenous Heparin is the standard of care to prevent further clot propagation.",
        "Incorrect. High-resolution chest CT without contrast is useful for interstitial lung disease but is entirely inappropriate for diagnosing PE, which requires a CT Pulmonary Angiography (CTPA) with contrast."
      ]
    };

    if (specialtyLower.includes("cardiology")) {
      fallbackCase = {
        id: `case_fallback_${Date.now()}`,
        patientName: "William Chen",
        age: 62,
        gender: "Male",
        occupation: "Construction Manager",
        chiefComplaint: "Crushing retrosternal chest pain radiating to the left shoulder and jaw",
        historyOfPresentIllness: "Began 50 minutes ago while performing physical labor. The pain is severe (8/10), accompanied by cold sweats, shortness of breath, and nausea. He took three sublingual nitroglycerin tablets at 5-minute intervals without substantial relief.",
        vitals: {
          bp: "158/94",
          hr: 94,
          rr: 20,
          temp: "36.8 °C",
          spo2: 95
        },
        physicalExam: "Diaphoretic, pale, clutching chest (Levine sign). Heart sounds are regular with an S4 gallop, but no murmurs or rubs. Bilateral lung bases have faint bibasilar crackles.",
        ecgOrLabSnippet: "ECG reveals 3.5mm ST-segment elevations in leads V1 through V4 with reciprocal ST depressions in leads II, III, and aVF.",
        finalDiagnosis: "Acute Anterior ST-Elevation Myocardial Infarction (STEMI)",
        correctManagement: "Dual antiplatelet therapy (Aspirin 325mg and Clopidogrel 600mg), IV Nitroglycerin for pain control, Heparin anticoagulation, and emergent transfer for Primary Percutaneous Coronary Intervention (PCI).",
        options: [
          "Administer oral beta-blockers immediately and schedule an elective outpatient cardiac stress test",
          "Initiate dual antiplatelet therapy, anticoagulation, and activate the catheterization lab for immediate PCI",
          "Order a chest X-ray to rule out aortic dissection before giving any therapy",
          "Administer high-dose intravenous thrombolytics and discharge to the ward for observation"
        ],
        correctOptionIndex: 1,
        optionExplanations: [
          "Incorrect. Beta-blockers should be avoided in the acute phase if there are signs of heart failure (bibasilar crackles) or potential shock, and PCI is an emergency, not elective.",
          "Correct. This patient presents with a classic anterior STEMI. The definitive therapy is immediate reperfusion via primary PCI within 90 minutes. Initial management includes dual antiplatelet therapy and anticoagulation.",
          "Incorrect. While aortic dissection is on the differential, delaying reperfusion for an STEMI to obtain a chest X-ray is inappropriate and violates the clinical dictum that 'time is muscle'.",
          "Incorrect. Thrombolytics are reserved for cases where PCI cannot be performed within 120 minutes of medical contact. Even then, discharging the patient after thrombolysis is highly dangerous."
        ]
      };
    } else if (specialtyLower.includes("nephrology") || specialtyLower.includes("kidney")) {
      fallbackCase = {
        id: `case_fallback_${Date.now()}`,
        patientName: "Marcus Brody",
        age: 45,
        gender: "Male",
        occupation: "Software Engineer",
        chiefComplaint: "Generalized weakness, nausea, and severe muscle cramping in the calves",
        historyOfPresentIllness: "The patient is a known Type 1 Diabetic who missed multiple doses of insulin over the past two days due to a severe gastroenteritis episode. He reports passing minimal urine since yesterday morning and feeling highly lethargic.",
        vitals: {
          bp: "98/58",
          hr: 104,
          rr: 18,
          temp: "37.0 °C",
          spo2: 98
        },
        physicalExam: "Lethargic but answers questions appropriately. Dry mucous membranes, poor skin turgor. Reflexes are symmetrically decreased bilaterally.",
        ecgOrLabSnippet: "Serum potassium is critically elevated at 6.9 mEq/L. Serum creatinine is 3.1 mg/dL (baseline 0.9). ECG demonstrates widened QRS complexes, prolonged PR interval, and tall, peaked T waves.",
        finalDiagnosis: "Severe Hyperkalemia secondary to Acute Kidney Injury (AKI)",
        correctManagement: "Intravenous calcium gluconate for myocardial membrane stabilization, followed by insulin (with dextrose) and sodium bicarbonate to shift potassium intracellularly, and assessment for emergent hemodialysis.",
        options: [
          "Administer oral sodium polystyrene sulfonate (Kayexalate) and monitor serum electrolytes in 12 hours",
          "Give immediate intravenous Calcium Gluconate 10% to stabilize the cardiac membrane",
          "Initiate urgent intravenous infusion of potassium chloride to reverse muscular cramping",
          "Perform immediate unilateral nephrectomy to restore glomerular filtration"
        ],
        correctOptionIndex: 1,
        optionExplanations: [
          "Incorrect. Kayexalate takes hours to lower potassium and is too slow for emergent hyperkalemia with severe ECG changes. It is also associated with intestinal necrosis.",
          "Correct. Peaked T waves and widened QRS indicate severe cardiac conduction hazards. Calcium gluconate antagonizes the potassium-induced neuromuscular excitability and stabilizes the cardiac membrane immediately, preventing ventricular fibrillation.",
          "Incorrect. Giving potassium chloride to a patient with a potassium level of 6.9 mEq/L would be lethal.",
          "Incorrect. Nephrectomy is the removal of a kidney and would worsen AKI and lead to total renal failure."
        ]
      };
    }

    return res.json(fallbackCase);
  }

  try {
    const prompt = `Create a high-yield, board-level Clinical Patient Case Study for the medical specialty of "${specialty}".
The patient case should include realistic medical parameters, history, physical exam, vitals, and diagnostic results.
Format the response strictly as a JSON object with this exact schema:
{
  "id": "case_generated_${Date.now()}",
  "patientName": "Full Name of Simulated Patient",
  "age": 42,
  "gender": "Male" | "Female" | "Non-binary",
  "occupation": "Occupation of Patient",
  "chiefComplaint": "Short description of chief complaint (e.g. episodic vertigo and hearing loss)",
  "historyOfPresentIllness": "Detailed clinical narrative of present illness, history, risk factors, and medications in elegant medical English",
  "vitals": {
    "bp": "BP string (e.g. 138/84)",
    "hr": 84,
    "rr": 16,
    "temp": "Temp string (e.g. 36.9 °C)",
    "spo2": 97
  },
  "physicalExam": "Detailed clinical findings during head-to-toe or focused systems examination",
  "ecgOrLabSnippet": "Key diagnostic studies like ECG findings, arterial blood gas, electrolyte panel, or imaging results",
  "finalDiagnosis": "Gold standard definitive clinical diagnosis",
  "correctManagement": "Standard next-best step in diagnosis or clinical management",
  "options": [
    "Option A (clinical action or primary diagnosis)",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctOptionIndex": 0,
  "optionExplanations": [
    "Explanation why Option A is correct/incorrect",
    "Explanation why Option B is correct/incorrect",
    "Explanation why Option C is correct/incorrect",
    "Explanation why Option D is correct/incorrect"
  ]
}

Make sure options contain one clearly correct answer based on established guidelines (AHA, ACC, ATS, KDIGO, etc.) and three highly plausible distractors. Avoid conversational wraps or text. Return only raw JSON.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse dynamic case study content:", parseError);
      throw parseError;
    }
  } catch (err) {
    console.error("Gemini API error in generate-case-study, falling back to local simulation:", err);
    const specialtyLower = (specialty || "").toLowerCase();
    let fallbackCase = {
      id: `case_fallback_${Date.now()}`,
      patientName: "Eleanor Vance",
      age: 67,
      gender: "Female",
      occupation: "Retired Schoolteacher",
      chiefComplaint: "Sudden onset of dyspnea and sharp, pleuritic right-sided chest pain",
      historyOfPresentIllness: "The patient describes a sudden sharp pain in her right chest that worsens with deep inspiration, accompanied by a feeling of air hunger. She returned from a 14-hour trans-atlantic flight three days ago and has since noticed moderate swelling and a dull ache in her left calf.",
      vitals: {
        bp: "112/76",
        hr: 115,
        rr: 26,
        temp: "37.4 °C",
        spo2: 89
      },
      physicalExam: "Mildly respiratory distressed, utilizing accessory chest muscles. Lungs are clear to auscultation bilaterally without wheezes or crackles. Left lower extremity exhibits pitting edema to the mid-calf with mild erythema and localized calf tenderness on palpation.",
      ecgOrLabSnippet: "ECG shows sinus tachycardia at 115 bpm with an S1Q3T3 pattern (deep S wave in lead I, Q wave in lead III, T-wave inversion in lead III). D-dimer is significantly elevated at 1,850 ng/mL.",
      finalDiagnosis: "Acute Pulmonary Embolism (PE) secondary to Deep Vein Thrombosis (DVT)",
      correctManagement: "Systemic anticoagulation with Low-Molecular-Weight Heparin (LMWH) or unfractionated heparin, oxygen therapy to maintain SpO2 > 90%, and monitoring for hemodynamic instability.",
      options: [
        "Initiate oral Aspirin 325mg daily and discharge to home clinic",
        "Perform immediate bedside needle decompression in the second intercostal space",
        "Administer intravenous Heparin bolus followed by continuous infusion",
        "Obtain a non-contrast High-Resolution Chest CT to evaluate for interstitial lung disease"
      ],
      correctOptionIndex: 2,
      optionExplanations: [
        "Incorrect. Aspirin is an antiplatelet agent and is insufficient for the acute treatment of a confirmed or highly suspected pulmonary embolism.",
        "Incorrect. Needle decompression is the treatment for a tension pneumothorax, which is ruled out by bilaterally clear breath sounds.",
        "Correct. The patient has a high clinical probability (Wells Score > 6) of a pulmonary embolism, supported by hypoxia, tachycardia, and S1Q3T3. Quick initiation of therapeutic anticoagulation with intravenous Heparin is the standard of care to prevent further clot propagation.",
        "Incorrect. High-resolution chest CT without contrast is useful for interstitial lung disease but is entirely inappropriate for diagnosing PE, which requires a CT Pulmonary Angiography (CTPA) with contrast."
      ]
    };

    if (specialtyLower.includes("cardiology")) {
      fallbackCase = {
        id: `case_fallback_${Date.now()}`,
        patientName: "William Chen",
        age: 62,
        gender: "Male",
        occupation: "Construction Manager",
        chiefComplaint: "Crushing retrosternal chest pain radiating to the left shoulder and jaw",
        historyOfPresentIllness: "Began 50 minutes ago while performing physical labor. The pain is severe (8/10), accompanied by cold sweats, shortness of breath, and nausea. He took three sublingual nitroglycerin tablets at 5-minute intervals without substantial relief.",
        vitals: {
          bp: "158/94",
          hr: 94,
          rr: 20,
          temp: "36.8 °C",
          spo2: 95
        },
        physicalExam: "Diaphoretic, pale, clutching chest (Levine sign). Heart sounds are regular with an S4 gallop, but no murmurs or rubs. Bilateral lung bases have faint bibasilar crackles.",
        ecgOrLabSnippet: "ECG reveals 3.5mm ST-segment elevations in leads V1 through V4 with reciprocal ST depressions in leads II, III, and aVF.",
        finalDiagnosis: "Acute Anterior ST-Elevation Myocardial Infarction (STEMI)",
        correctManagement: "Dual antiplatelet therapy (Aspirin 325mg and Clopidogrel 600mg), IV Nitroglycerin for pain control, Heparin anticoagulation, and emergent transfer for Primary Percutaneous Coronary Intervention (PCI).",
        options: [
          "Administer oral beta-blockers immediately and schedule an elective outpatient cardiac stress test",
          "Initiate dual antiplatelet therapy, anticoagulation, and activate the catheterization lab for immediate PCI",
          "Order a chest X-ray to rule out aortic dissection before giving any therapy",
          "Administer high-dose intravenous thrombolytics and discharge to the ward for observation"
        ],
        correctOptionIndex: 1,
        optionExplanations: [
          "Incorrect. Beta-blockers should be avoided in the acute phase if there are signs of heart failure (bibasilar crackles) or potential shock, and PCI is an emergency, not elective.",
          "Correct. This patient presents with a classic anterior STEMI. The definitive therapy is immediate reperfusion via primary PCI within 90 minutes. Initial management includes dual antiplatelet therapy and anticoagulation.",
          "Incorrect. While aortic dissection is on the differential, delaying reperfusion for an STEMI to obtain a chest X-ray is inappropriate and violates the clinical dictum that 'time is muscle'.",
          "Incorrect. Thrombolytics are reserved for cases where PCI cannot be performed within 120 minutes of medical contact. Even then, discharging the patient after thrombolysis is highly dangerous."
        ]
      };
    } else if (specialtyLower.includes("nephrology") || specialtyLower.includes("kidney")) {
      fallbackCase = {
        id: `case_fallback_${Date.now()}`,
        patientName: "Marcus Brody",
        age: 45,
        gender: "Male",
        occupation: "Software Engineer",
        chiefComplaint: "Generalized weakness, nausea, and severe muscle cramping in the calves",
        historyOfPresentIllness: "The patient is a known Type 1 Diabetic who missed multiple doses of insulin over the past two days due to a severe gastroenteritis episode. He reports passing minimal urine since yesterday morning and feeling highly lethargic.",
        vitals: {
          bp: "98/58",
          hr: 104,
          rr: 18,
          temp: "37.0 °C",
          spo2: 98
        },
        physicalExam: "Lethargic but answers questions appropriately. Dry mucous membranes, poor skin turgor. Reflexes are symmetrically decreased bilaterally.",
        ecgOrLabSnippet: "Serum potassium is critically elevated at 6.9 mEq/L. Serum creatinine is 3.1 mg/dL (baseline 0.9). ECG demonstrates widened QRS complexes, prolonged PR interval, and tall, peaked T waves.",
        finalDiagnosis: "Severe Hyperkalemia secondary to Acute Kidney Injury (AKI)",
        correctManagement: "Intravenous calcium gluconate for myocardial membrane stabilization, followed by insulin (with dextrose) and sodium bicarbonate to shift potassium intracellularly, and assessment for emergent hemodialysis.",
        options: [
          "Administer oral sodium polystyrene sulfonate (Kayexalate) and monitor serum electrolytes in 12 hours",
          "Give immediate intravenous Calcium Gluconate 10% to stabilize the cardiac membrane",
          "Initiate urgent intravenous infusion of potassium chloride to reverse muscular cramping",
          "Perform immediate unilateral nephrectomy to restore glomerular filtration"
        ],
        correctOptionIndex: 1,
        optionExplanations: [
          "Incorrect. Kayexalate takes hours to lower potassium and is too slow for emergent hyperkalemia with severe ECG changes. It is also associated with intestinal necrosis.",
          "Correct. Peaked T waves and widened QRS indicate severe cardiac conduction hazards. Calcium gluconate antagonizes the potassium-induced neuromuscular excitability and stabilizes the cardiac membrane immediately, preventing ventricular fibrillation.",
          "Incorrect. Giving potassium chloride to a patient with a potassium level of 6.9 mEq/L would be lethal.",
          "Incorrect. Nephrectomy is the removal of a kidney and would worsen AKI and lead to total renal failure."
        ]
      };
    }
    res.json(fallbackCase);
  }
});

// 4e. Clinical Plan Attending Evaluation Endpoint
app.post("/api/evaluate-clinical-plan", async (req, res) => {
  const { patientName, age, gender, chiefComplaint, finalDiagnosis, correctManagement, studentPlan } = req.body;
  const client = getAIClient();

  if (!client) {
    // Elegant fallback grading mechanism using keyword alignment
    const planLower = (studentPlan || "").toLowerCase();
    const diagKeywords = (finalDiagnosis || "").toLowerCase().split(/\s+/).filter(k => k.length > 3);
    const mgtKeywords = (correctManagement || "").toLowerCase().split(/\s+/).filter(k => k.length > 3);

    let matchedDiag = 0;
    diagKeywords.forEach(k => {
      if (planLower.includes(k)) matchedDiag++;
    });

    let matchedMgt = 0;
    mgtKeywords.forEach(k => {
      if (planLower.includes(k)) matchedMgt++;
    });

    let grade: "Pass with Honors" | "Pass" | "Needs Revision" = "Needs Revision";
    let critique = "Your clinical note shows some understanding of the presentation, but lacks key diagnostic markers or safety interventions critical for this high-yield scenario.";
    let strengths = ["Identified some of the presenting symptoms.", "Documented basic supportive care."];
    let gaps = ["Missed the primary definitive diagnosis.", "Omitted the gold-standard immediate management step."];
    let takeaways = ["Reinforce differential diagnosis hierarchies.", "Review emergency escalation procedures for this presentation."];

    if (matchedDiag >= 2 && matchedMgt >= 2) {
      grade = "Pass with Honors";
      critique = "Excellent clinical reasoning! You accurately identified the core underlying etiology and immediately prescribed the correct therapeutic guidelines, showing outstanding board readiness.";
      strengths = ["Accurate diagnostic hypothesis.", "Perfect selection of first-line pharmacotherapy.", "Sound physiological rationale."];
      gaps = ["Could elaborate slightly more on secondary contraindications."];
      takeaways = ["Continue utilizing structured diagnostic formats.", "Perfect execution of standard emergency medicine protocols."];
    } else if (matchedDiag >= 1 || matchedMgt >= 1) {
      grade = "Pass";
      critique = "Solid effort. You identified several clinical elements and proposed partial management. However, some definitive diagnostic workup or direct pharmaceutical interventions were omitted.";
      strengths = ["Correct clinical suspicion.", "Appropriate initial diagnostic test ordering."];
      gaps = ["Fails to secure the definitive intervention.", "Lacks specific dose or timing guidelines."];
      takeaways = ["Always state both the immediate stabilization step and the definitive cure.", "Review exact pharmacology classes for this condition."];
    }

    return res.json({ grade, critique, strengths, gaps, takeaways });
  }

  try {
    const prompt = `You are a Board-Certified Attending Physician and clinical clerkship director.
Evaluate a medical student's proposed clinical diagnosis and management plan for this presentation:
Patient Name: ${patientName}
Age/Gender: ${age}/${gender}
Chief Complaint: ${chiefComplaint}
Final Diagnosis Reference: ${finalDiagnosis}
Correct Management Reference: ${correctManagement}

Student's Proposed Plan:
"${studentPlan}"

Analyze the student's plan against the reference. Grade the student as one of: "Pass with Honors", "Pass", or "Needs Revision".
Format the evaluation strictly as a JSON object with this exact schema:
{
  "grade": "Pass with Honors" | "Pass" | "Needs Revision",
  "critique": "A professional 2-3 sentence overview of their diagnostic reasoning and therapeutic plan.",
  "strengths": ["Strength 1", "Strength 2"],
  "gaps": ["Gap 1", "Gap 2"],
  "takeaways": ["Takeaway 1", "Takeaway 2"]
}

Make all comments highly instructive, educational, and clinically rigorous. Return only raw JSON. No markdown wrappers.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse attending clinical evaluation report:", parseError);
      throw parseError;
    }
  } catch (err) {
    console.error("Gemini API error in evaluate-clinical-plan, falling back to local simulation:", err);
    const planLower = (studentPlan || "").toLowerCase();
    const diagKeywords = (finalDiagnosis || "").toLowerCase().split(/\s+/).filter(k => k.length > 3);
    const mgtKeywords = (correctManagement || "").toLowerCase().split(/\s+/).filter(k => k.length > 3);

    let matchedDiag = 0;
    diagKeywords.forEach(k => {
      if (planLower.includes(k)) matchedDiag++;
    });

    let matchedMgt = 0;
    mgtKeywords.forEach(k => {
      if (planLower.includes(k)) matchedMgt++;
    });

    let grade: "Pass with Honors" | "Pass" | "Needs Revision" = "Needs Revision";
    let critique = "Your clinical note shows some understanding of the presentation, but lacks key diagnostic markers or safety interventions critical for this high-yield scenario.";
    let strengths = ["Identified some of the presenting symptoms.", "Documented basic supportive care."];
    let gaps = ["Missed the primary definitive diagnosis.", "Omitted the gold-standard immediate management step."];
    let takeaways = ["Reinforce differential diagnosis hierarchies.", "Review emergency escalation procedures for this presentation."];

    if (matchedDiag >= 2 && matchedMgt >= 2) {
      grade = "Pass with Honors";
      critique = "Excellent clinical reasoning! You accurately identified the core underlying etiology and immediately prescribed the correct therapeutic guidelines, showing outstanding board readiness.";
      strengths = ["Accurate diagnostic hypothesis.", "Perfect selection of first-line pharmacotherapy.", "Sound physiological rationale."];
      gaps = ["Could elaborate slightly more on secondary contraindications."];
      takeaways = ["Continue utilizing structured diagnostic formats.", "Perfect execution of standard emergency medicine protocols."];
    } else if (matchedDiag >= 1 || matchedMgt >= 1) {
      grade = "Pass";
      critique = "Solid effort. You identified several clinical elements and proposed partial management. However, some definitive diagnostic workup or direct pharmaceutical interventions were omitted.";
      strengths = ["Correct clinical suspicion.", "Appropriate initial diagnostic test ordering."];
      gaps = ["Fails to secure the definitive intervention.", "Lacks specific dose or timing guidelines."];
      takeaways = ["Always state both the immediate stabilization step and the definitive cure.", "Review exact pharmacology classes for this condition."];
    }

    res.json({ grade, critique, strengths, gaps, takeaways });
  }
});

// --- Clinical Twin Simulation Engine Route ---
app.post("/api/clinical-twin-simulate", async (req, res) => {
  const { presetCase, chosenAction, previousActions, currentVitals, currentScore, actionType, investigationsOrdered } = req.body;
  const client = getAIClient();

  if (actionType === "generate") {
    const { mcqQuestion, mcqRationale, examBoard, difficulty, department } = req.body;
    if (!client) {
      // Return a robust simulated preset based on department
      return res.json({
        success: true,
        case: {
          id: "dynamic_fallback",
          title: "Atypical Chest Presentation",
          examBoard: examBoard || "USMLE",
          difficulty: difficulty || "Medium",
          department: department || "Cardiology",
          disease: "Coronary Syndrome Mimic",
          patientName: "Jameson Parker",
          age: 58,
          gender: "Male",
          occupation: "Postal Worker",
          medicalHistory: "Essential Hypertension for 10 years, controlled with Lisinopril.",
          familyHistory: "Father sustained an MI at age 64.",
          riskFactors: "Hypercholesterolemia, sedentary lifestyle, former smoker.",
          chiefComplaint: "Sensation of retrosternal pressure radiating to back, resolving partially on rest.",
          physicalExam: "Normal chest excursion, lungs clear to auscultation, dual heart sounds with no murmurs, no lower extremity edema.",
          initialVitals: { bp: "144/88", hr: 82, rr: 18, temp: "36.8 °C", spo2: 95 },
          investigations: [
            { id: "ecg", name: "12-Lead ECG", result: "Sinus rhythm with minor non-specific T-wave flattening in lateral leads." },
            { id: "trop", name: "Cardiac Troponins", result: "0.02 ng/mL (Reference range < 0.04 ng/mL)." }
          ],
          actions: [
            {
              id: "act1",
              text: "Administer chewable Aspirin 325mg and continue telemetry monitoring.",
              category: "management",
              feedback: "Excellent, protective antiplatelet therapy initiated. Telemetry shows no arrhythmias.",
              correctness: "Correct",
              scoreImpact: 30,
              reasoning: "Immediate aspirin therapy reduces cardiovascular risk in any patient with suspected acute coronary syndrome.",
              pathophysiology: "Aspirin irreversibly acetylates cyclooxygenase-1 (COX-1), blocking thromboxane A2 production and preventing platelet thrombotic aggregation.",
              pearl: "Chewing aspirin is preferred as it speeds absorption and is the single most critical survival drug in early suspected ischemic syndromes."
            },
            {
              id: "act2",
              text: "Discharge patient immediately to outpatient cardiology clinic.",
              category: "dangerous",
              feedback: "Severe warning: Discharging a patient with ongoing chest discomfort without serial troponin testing is highly dangerous!",
              correctness: "Dangerous",
              scoreImpact: -25,
              reasoning: "Early acute myocardial infarction can present with initial negative troponins, demanding serial measurements 3-6 hours later.",
              pathophysiology: "Premature discharge can lead to unrecognized plaque rupture progressing to complete arterial occlusion and ventricular fibrillation outside a hospital setting.",
              pearl: "Never discharge an acute chest pain patient based on a single negative troponin. 'Serial' is the word."
            }
          ]
        }
      });
    }

    try {
      const prompt = `You are the BioTwin Medical OS simulation generator.
Convert this medical MCQ question into a fully interactive clinical patient twin simulation case.

MCQ Question:
${mcqQuestion}

MCQ Rationale:
${mcqRationale}

Parameters:
- Exam Board: ${examBoard || "USMLE"}
- Difficulty: ${difficulty || "Medium"}
- Department: ${department || "Cardiology"}

Return a JSON object matching this schema:
{
  "id": "dynamic_twin",
  "title": "A short descriptive title of the presentation",
  "examBoard": "${examBoard || "USMLE"}",
  "difficulty": "${difficulty || "Medium"}",
  "department": "${department || "Cardiology"}",
  "disease": "The primary clinical disease / diagnosis",
  "patientName": "A realistic human name",
  "age": 45,
  "gender": "Male or Female",
  "occupation": "A realistic occupation",
  "medicalHistory": "Detailed relevant medical history",
  "familyHistory": "Detailed relevant family history",
  "riskFactors": "Relevant clinical risk factors",
  "chiefComplaint": "The patient's chief complaint in descriptive lay terms",
  "physicalExam": "Detailed physical exam findings",
  "initialVitals": { "bp": "120/80", "hr": 80, "rr": 16, "temp": "37.0 °C", "spo2": 98 },
  "investigations": [
    { "id": "ecg", "name": "12-Lead ECG", "result": "ECG results description" },
    { "id": "trop", "name": "Troponins", "result": "Troponin lab results" },
    { "id": "cbc", "name": "Complete Blood Count", "result": "CBC results" },
    { "id": "cxr", "name": "Chest X-ray", "result": "Chest X-ray results" }
  ],
  "actions": [
    {
      "id": "action1",
      "text": "Correct clinical intervention option text",
      "category": "management",
      "feedback": "Praising feedback text explaining success",
      "correctness": "Correct",
      "scoreImpact": 30,
      "nextVitals": { "bp": "120/80", "hr": 75, "rr": 14, "temp": "37.0 °C", "spo2": 99 },
      "reasoning": "Clinical reasoning of why this is correct",
      "pathophysiology": "Pathophysiological rationale",
      "pearl": "High-yield exam pearl"
    },
    {
      "id": "action2",
      "text": "A partially correct clinical action option text",
      "category": "stabilization",
      "feedback": "Feedback text explaining the partial correct response",
      "correctness": "Partially Correct",
      "scoreImpact": 15,
      "reasoning": "Clinical reasoning",
      "pathophysiology": "Pathophysiological rationale",
      "pearl": "High-yield exam pearl"
    },
    {
      "id": "action3",
      "text": "A completely incorrect/dangerous option text",
      "category": "dangerous",
      "feedback": "Feedback explaining the severe error or complication triggered",
      "correctness": "Dangerous",
      "scoreImpact": -25,
      "nextVitals": { "bp": "90/55", "hr": 110, "rr": 24, "temp": "37.0 °C", "spo2": 91 },
      "reasoning": "Reasoning explaining why this is incorrect/dangerous",
      "pathophysiology": "Pathophysiological details of the danger",
      "pearl": "High-yield clinical warning"
    }
  ]
}

Ensure the response contains ONLY raw JSON, conforming exactly to the schema.`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      return res.json({ success: true, case: JSON.parse(response.text || "{}") });
    } catch (err: any) {
      console.error("Error generating dynamic twin, falling back to local simulation:", err);
      return res.json({
        success: true,
        case: {
          id: "dynamic_fallback",
          title: "Atypical Chest Presentation",
          examBoard: examBoard || "USMLE",
          difficulty: difficulty || "Medium",
          department: department || "Cardiology",
          disease: "Coronary Syndrome Mimic",
          patientName: "Jameson Parker",
          age: 58,
          gender: "Male",
          occupation: "Postal Worker",
          medicalHistory: "Essential Hypertension for 10 years, controlled with Lisinopril.",
          familyHistory: "Father sustained an MI at age 64.",
          riskFactors: "Hypercholesterolemia, sedentary lifestyle, former smoker.",
          chiefComplaint: "Sensation of retrosternal pressure radiating to back, resolving partially on rest.",
          physicalExam: "Normal chest excursion, lungs clear to auscultation, dual heart sounds with no murmurs, no lower extremity edema.",
          initialVitals: { bp: "144/88", hr: 82, rr: 18, temp: "36.8 °C", spo2: 95 },
          investigations: [
            { id: "ecg", name: "12-Lead ECG", result: "Sinus rhythm with minor non-specific T-wave flattening in lateral leads." },
            { id: "trop", name: "Cardiac Troponins", result: "0.02 ng/mL (Reference range < 0.04 ng/mL)." }
          ],
          actions: [
            {
              id: "act1",
              text: "Administer chewable Aspirin 325mg and continue telemetry monitoring.",
              category: "management",
              feedback: "Excellent, protective antiplatelet therapy initiated. Telemetry shows no arrhythmias.",
              correctness: "Correct",
              scoreImpact: 30,
              reasoning: "Immediate aspirin therapy reduces cardiovascular risk in any patient with suspected acute coronary syndrome.",
              pathophysiology: "Aspirin irreversibly acetylates cyclooxygenase-1 (COX-1), blocking thromboxane A2 production and preventing platelet thrombotic aggregation.",
              pearl: "Chewing aspirin is preferred as it speeds absorption and is the single most critical survival drug in early suspected ischemic syndromes."
            },
            {
              id: "act2",
              text: "Discharge patient immediately to outpatient cardiology clinic.",
              category: "dangerous",
              feedback: "Severe warning: Discharging a patient with ongoing chest discomfort without serial troponin testing is highly dangerous!",
              correctness: "Dangerous",
              scoreImpact: -25,
              reasoning: "Early acute myocardial infarction can present with initial negative troponins, demanding serial measurements 3-6 hours later.",
              pathophysiology: "Premature discharge can lead to unrecognized plaque rupture progressing to complete arterial occlusion and ventricular fibrillation outside a hospital setting.",
              pearl: "Never discharge an acute chest pain patient based on a single negative troponin. 'Serial' is the word."
            }
          ]
        }
      });
    }
  }

  // Evaluate action turn
  if (!client) {
    return res.json({ success: false, message: "Using offline local simulator." });
  }

  try {
    const prompt = `You are the BioTwin Medical OS decision engine. Evaluate the clinical decision made by the learner.

Context:
- Patient: ${presetCase.patientName}, ${presetCase.age} y/o ${presetCase.gender} diagnosed with ${presetCase.disease}.
- Chief Complaint: ${presetCase.chiefComplaint}
- Current Vitals: ${JSON.stringify(currentVitals)}
- Action Taken: "${chosenAction}"
- Previous Actions Taken: ${JSON.stringify(previousActions || [])}
- Investigations Ordered so far: ${JSON.stringify(investigationsOrdered || [])}

Evaluate this decision and output a JSON response containing:
{
  "correctness": "Correct" | "Partially Correct" | "Incorrect" | "Dangerous",
  "scoreImpact": -40 to +40,
  "feedback": "Direct patient reaction / clinical monitor feedback detailing what occurred after this action",
  "reasoning": "Rigorous medical reasoning matching MBBS/USMLE/FCPS syllabus standards",
  "pathophysiology": "Detailed pathophysiological process behind the change",
  "pearl": "High-yield exam point/pearl",
  "nextVitals": { "bp": "BP string", "hr": 120, "rr": 20, "temp": "temp string", "spo2": 95 },
  "complicationTriggered": true | false,
  "complicationDescription": "Describe any acute complication triggered (e.g. respiratory collapse, severe hyperkalemic arrhythmia, cardiogenic shock)"
}

Ensure the response contains ONLY raw JSON, conforming exactly to the schema.`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in simulation turn, falling back to local simulation:", err);
    res.json({
      correctness: "Correct",
      scoreImpact: 10,
      feedback: "The intervention was documented successfully. Vital signs show stabilization under supportive therapy.",
      reasoning: "Supportive clinical management remains a cornerstone of inpatient care while definitive diagnostics are finalized.",
      pathophysiology: "Optimizing hemodynamic stability preserves end-organ perfusion and limits myocardial or renal ischemic stress.",
      pearl: "Always double check the core indicators before making changes to active medication regimens.",
      nextVitals: currentVitals || { "bp": "120/80", "hr": 80, "rr": 16, "temp": "37.0 °C", "spo2": 98 },
      complicationTriggered: false,
      complicationDescription: ""
    });
  }
});

// --- Global Doctor Match Architect (GDMA) Endpoints ---

// Pre-seeded Mentors Pool for matching
const GDMA_MENTORS_POOL = [
  {
    name: "Dr. Sarah Jenkins, MD",
    specialty: "Cardiology",
    location: "United States (Cleveland Clinic)",
    targetExam: "USMLE Step 1",
    credentials: "USMLE Step 1: 262 | Step 2 CK: 268 | Cardiology Resident",
    rate: "$50",
    bio: "Specializes in high-yield valvular physiology and clinical diagnostic roadmaps. Guided over 140 IMGs into US residencies.",
    availability: "Available tomorrow at 4:00 PM EST"
  },
  {
    name: "Dr. Amit Patel, MRCP",
    specialty: "Gastroenterology",
    location: "United Kingdom (King's College Hospital)",
    targetExam: "PLAB 1/UKMLA",
    credentials: "PLAB 1 Pass | MRCP UK | Gastroenterology Registrar",
    rate: "£35",
    bio: "Expert in UKMLA exam blueprint mapping and NHS registrar navigation paths. Former PLAB examiner.",
    availability: "Available Thursday at 2:00 PM BST"
  },
  {
    name: "Dr. Faisal Al-Mansoor, MD",
    specialty: "Neurology",
    location: "United States (Johns Hopkins)",
    targetExam: "USMLE Step 2",
    credentials: "Step 2 CK: 265 | Neurology Fellow | ECFMG Certified",
    rate: "$55",
    bio: "Focused on localized neurology vignettes, stroke criteria, and active clinical reasoning loops. Academic mentor.",
    availability: "Available Saturday at 10:00 AM EST"
  },
  {
    name: "Dr. Chioma Opara, MBChB",
    specialty: "Endocrinology",
    location: "United Kingdom (St Mary's Hospital)",
    targetExam: "PLAB 1/UKMLA",
    credentials: "MBChB Liverpool | PLAB Pass | Endocrinology Specialty Trainee",
    rate: "£35",
    bio: "Passionate about helping international graduates transition into the NHS training tiers and mastering OSCE clinical cycles.",
    availability: "Available Monday at 9:00 AM BST"
  },
  {
    name: "Dr. Elena Rostova, MD",
    specialty: "Pulmonology",
    location: "United States (Mayo Clinic)",
    targetExam: "USMLE Step 1",
    credentials: "USMLE Step 1: 258 | Pulmonology Research Fellow",
    rate: "$50",
    bio: "Specializes in acid-base physiology and interstitial respiratory distress profiles. Multi-step board strategist.",
    availability: "Available Friday at 3:00 PM CST"
  },
  {
    name: "Dr. Kenji Tanaka, MD",
    specialty: "Nephrology",
    location: "United States (MGH / Harvard)",
    targetExam: "USMLE Step 2",
    credentials: "USMLE Step 2 CK: 270 | Nephrology Resident",
    rate: "$60",
    bio: "Renal clearance, electrolyte imbalances, and acute kidney injury board vignette expert. ECFMG advocate.",
    availability: "Available Wednesday at 5:00 PM EST"
  }
];

// 1. Suggest Mentors Endpoint
app.post("/api/gdma/suggest-mentors", (req, res) => {
  const { specialty, targetExam } = req.body;
  
  // Filter mentors based on target exam or specialty, or default to general list
  let filtered = GDMA_MENTORS_POOL.filter(
    m => m.targetExam === targetExam || m.specialty.toLowerCase() === (specialty || "").toLowerCase()
  );
  
  if (filtered.length < 3) {
    // Fill with others to always return exactly 3 high-quality mentors
    const remaining = GDMA_MENTORS_POOL.filter(m => !filtered.includes(m));
    filtered = [...filtered, ...remaining].slice(0, 3);
  } else {
    filtered = filtered.slice(0, 3);
  }

  res.json({ mentors: filtered });
});

// 2. Chat Assistant with Core Rules & Network Effect
app.post("/api/gdma/chat", async (req, res) => {
  const { messages, userProfile } = req.body;
  const client = getAIClient();

  const systemInstructions = `You are the "Global Doctor Match Architect" (GDMA), the core intelligence of a medical mentorship platform.
Your user audience comprises medical students/graduates transitioning to the UK NHS (PLAB/UKMLA) or US (USMLE) systems.

CORE DIRECTIVES & OPERATING RULES:
1. Always follow the CONVERSATION STRUCTURE when providing guidance or roadmaps:
   - Provide a highly strategic, actionable roadmap (e.g. step-by-step preparation advice).
   - Recommend a list of 3 suggested mentors currently active in that niche (Choose from the pre-seeded pool, or synthesize matching mentors with realistic bios and schedules).
   - ALWAYS include a clear Call-To-Action (CTA): "Would you like me to open a booking request for a 30-minute consultation with [Mentor Name]?"
2. Apply the "NETWORK EFFECT" LOGIC for technical/clinical questions:
   - If the user asks a technical or medical question (e.g., about Cardiology, Pulmonology, Nephrology, etc.), do NOT just answer it.
   - Provide a brief, high-yield summary of the answer (1-2 sentences).
   - Then say: "This is a complex topic. I have connected you to [Doctor Name] who specializes in this area and is available for a 15-minute deep-dive session."
3. Maintain a highly formal, aspirational, networking-focused, and supportive professional tone suitable for elite licensed medical practitioners.

Pre-seeded Mentors Pool to refer to:
${JSON.stringify(GDMA_MENTORS_POOL, null, 2)}

Ensure you answer the user's latest query while respecting these structure rules perfectly. Keep replies concise and extremely well-formatted in Markdown.`;

  if (!client) {
    // Elegant Offline Fallback matching all guidelines
    const latestUserMsg = messages[messages.length - 1]?.content || "";
    let responseText = "";

    // Let's analyze keywords
    if (latestUserMsg.toLowerCase().includes("cardio") || latestUserMsg.toLowerCase().includes("valve") || latestUserMsg.toLowerCase().includes("murmur")) {
      responseText = `### 🫀 Strategic Cardiology Prep & Matching Guidance

To master high-yield Cardiology (such as Valvular Pathology, Diastolic Rumbling, and Murmur Auscultation):
1. **Understand Hemodynamics**: Map left atrial pressure fluctuations with pressure-volume loops.
2. **Key Clues**: S1 intensity and the presence of an opening snap are highly pathognomonic for mitral stenosis.

This is a complex clinical topic. I have connected you to **Dr. Sarah Jenkins, MD** who specializes in this area and is available for a 15-minute deep-dive session.

#### Suggested Mentors For You:
1. **Dr. Sarah Jenkins, MD** (US Residency Path)
   * *Bio*: Valvular physiology expert, Cleveland Clinic.
   * *Rate*: $50 / session.
2. **Dr. Amit Patel, MRCP** (UK NHS Path)
   * *Bio*: Gastroenterology Registrar, former PLAB examiner.
   * *Rate*: £35 / session.
3. **Dr. Elena Rostova, MD** (US Residency Path)
   * *Bio*: Interstitial distress specialist, Mayo Clinic.
   * *Rate*: $50 / session.

Would you like me to open a booking request for a 30-minute consultation with **Dr. Sarah Jenkins, MD**?`;
    } else {
      responseText = `### 🗺️ Licensing Exam Strategic Transition Guidance

Navigating international pathways (such as USMLE or PLAB/UKMLA) requires structured execution:
1. **Benchmark Baseline**: Complete a full diagnostic block to identify organ-system weaknesses.
2. **High-Yield Spaced Repetition**: Pair clinical vignettes with spaced review cycles.
3. **Clinical Integration**: Focus on multi-step reasoning over raw recall.

#### Suggested Mentors For Your Profile:
1. **Dr. Sarah Jenkins, MD** (USMLE Step 1/2 Specialist)
   * *Credentials*: USMLE Step 1: 262 | Step 2 CK: 268
   * *Rate*: $50 / session
2. **Dr. Amit Patel, MRCP** (PLAB/UKMLA Specialist)
   * *Credentials*: NHS Registrar | PLAB Pass
   * *Rate*: £35 / session
3. **Dr. Faisal Al-Mansoor, MD** (USMLE Step 2 Fellowship Specialist)
   * *Credentials*: Neurology Fellow | Johns Hopkins
   * *Rate*: $55 / session

Would you like me to open a booking request for a 30-minute consultation with **Dr. Sarah Jenkins, MD** or **Dr. Amit Patel, MRCP**?`;
    }

    return res.json({ response: responseText });
  }

  try {
    // Map existing history to Gemini contents structure
    const systemPromptAndHistory = [
      { role: "user", parts: [{ text: systemInstructions }] },
      { role: "model", parts: [{ text: "Acknowledged. I am initialized as the Global Doctor Match Architect (GDMA) and will adhere strictly to all formatting, mentorship, roadmap, and network effect directives." }] },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    ];

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: systemPromptAndHistory,
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error("GDMA Gemini Chat error, returning fallback:", err);
    res.json({
      response: `### 💻 offline Mode Transition Guidance

To succeed in your licensing transition:
1. Master core pathophysiology and clinical reasoning loops.
2. Partner with active, verified registrar or resident mentors.

Suggested Mentor: **Dr. Sarah Jenkins, MD** (USMLE Specialist) or **Dr. Amit Patel, MRCP** (PLAB Specialist).

Would you like me to open a booking request for a 30-minute consultation with **Dr. Sarah Jenkins, MD**?`
    });
  }
});

// --- Medical Skill Marketplace (Udemy for Medical Licensing) Endpoints ---

interface CourseReview {
  reviewer: string;
  stars: number;
  date: string;
  comment: string;
}

interface SyllabusSection {
  title: string;
  duration: string;
  lectures: string[];
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  instructorName: string;
  instructorTitle: string;
  country: string;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  price: number;
  currency: string;
  thumbnail: string;
  durationHours: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  syllabus: SyllabusSection[];
  reviews: CourseReview[];
}

let MARKETPLACE_COURSES: Course[] = [
  {
    id: "course-usmle-renal",
    title: "USMLE Step 1 High-Yield Renal Physiology & Acid-Base",
    subtitle: "Master glomerular filtration mechanics, renal clearance calculations, and metabolic electrolyte imbalances with high-yield clinical board vignettes.",
    category: "USMLE",
    instructorName: "Dr. Arthur Pendelton, MD",
    instructorTitle: "Associate Professor of Renal Medicine, Harvard Medical School",
    country: "United States",
    rating: 4.9,
    ratingCount: 142,
    studentsCount: 1240,
    price: 49,
    currency: "USD",
    thumbnail: "🧬",
    durationHours: 12,
    level: "Advanced",
    syllabus: [
      {
        title: "Glomerular Filtration & Hemodynamics",
        duration: "3 hours",
        lectures: ["Auscultation of Renal Bruits & Constriction Mechanics", "Calculating GFR vs RPF from Clearance Profiles", "The Renin-Angiotensin-Aldosterone Axis deep-dive"]
      },
      {
        title: "Tubular Transport Mechanisms",
        duration: "4 hours",
        lectures: ["Proximal Convoluted Tubule Load vs Transport Maximums", "Loop of Henle Countercurrent Multiplier", "Distal Tubule & Collecting Duct hormonal controls"]
      },
      {
        title: "Acid-Base Disorders Strategy",
        duration: "5 hours",
        lectures: ["The Winter's Formula for Respiratory Compensation", "High Anion Gap Metabolic Acidosis Mnemonic (MUDPILES)", "Mixed Acid-Base Disturbance cases interactive run"]
      }
    ],
    reviews: [
      { reviewer: "Dr. Sarah J.", stars: 5, date: "2026-06-15", comment: "Winter's formula explanation was incredibly simple. I answered 3 questions correctly on my practice block immediately after this lecture!" },
      { reviewer: "Karan M. (New Delhi)", stars: 5, date: "2026-06-12", comment: "Outstanding animations on loop diuretics and distal tubule calcium channels. Best board prep ever." }
    ]
  },
  {
    id: "course-plab-pharm",
    title: "PLAB 1 / UKMLA Clinical Pharmacology & Emergency Triage",
    subtitle: "A complete blueprint-guided syllabus mapping out critical emergency toxicology, British National Formulary (BNF) protocols, and NICE guidelines for UK residency.",
    category: "PLAB/UKMLA",
    instructorName: "Dr. Olivia Sterling, MRCP",
    instructorTitle: "Emergency Medicine Registrar, St Mary's Hospital (London)",
    country: "United Kingdom",
    rating: 4.8,
    ratingCount: 98,
    studentsCount: 840,
    price: 39,
    currency: "GBP",
    thumbnail: "💊",
    durationHours: 8,
    level: "Intermediate",
    syllabus: [
      {
        title: "Cardiovascular Drug Prescribing Protocols",
        duration: "2.5 hours",
        lectures: ["NICE guidelines for Hypertension management steps", "Acute coronary syndrome medical loading checklist", "Antiarrhythmics classifications and safety monitors"]
      },
      {
        title: "Toxicology & Emergency Antidotes",
        duration: "3 hours",
        lectures: ["Paracetamol Overdose & N-acetylcysteine Nomogram", "Tricyclic Antidepressant toxicity and bicarbonate buffers", "Opioid and Benzodiazepine toxicity management"]
      },
      {
        title: "Systemic Prescribing Safety Assessment",
        duration: "2.5 hours",
        lectures: ["Renal dosage adjustments in elderly patients", "Key drug interactions with Cytochrome P450", "End-of-life care syringe driver calculations"]
      }
    ],
    reviews: [
      { reviewer: "Dr. Hassan A.", stars: 5, date: "2026-06-20", comment: "Essential for PLAB 1. The BNF guidelines can be so dry, but Dr. Olivia makes it clinically relevant and easy to retain." },
      { reviewer: "Amina O.", stars: 4, date: "2026-06-18", comment: "Very precise. Highly recommended for both PLAB 1 and the Prescribing Safety Assessment (PSA)." }
    ]
  },
  {
    id: "course-osce-comms",
    title: "Mastering OSCE Practical Stations & Clinical Communication",
    subtitle: "Overcome exam anxiety by mastering patient histories, breaking bad news, obtaining informed consent, and resolving aggressive patient vignettes.",
    category: "Clinical Skills",
    instructorName: "Dr. Priya Nair, MD, FRCPC",
    instructorTitle: "Director of Clinical Simulation, Toronto General Hospital",
    country: "Canada",
    rating: 4.7,
    ratingCount: 75,
    studentsCount: 650,
    price: 29,
    currency: "CAD",
    thumbnail: "🩺",
    durationHours: 6,
    level: "Beginner",
    syllabus: [
      {
        title: "The Structured OSCE History Taking",
        duration: "2 hours",
        lectures: ["The SOCRATES pain scoring checklist", "Systemic review and pediatric history nuances", "Structuring histories under strict 8-minute timers"]
      },
      {
        title: "Complex Communication Protocols",
        duration: "2 hours",
        lectures: ["SPIKES protocol for breaking difficult medical news", "Handling the angry or non-compliant patient scenario", "Discussing DNACPR and power of attorney with families"]
      },
      {
        title: "Physical Examination Checklist Validation",
        duration: "2 hours",
        lectures: ["High-yield cranial nerve exam sequencing", "Cardiovascular and respiratory exam OSCE shortcuts", "Surgical abdomen examination mock runs"]
      }
    ],
    reviews: [
      { reviewer: "David L.", stars: 5, date: "2026-06-10", comment: "I passed my OSCE with outstanding marks in communication! The SPIKES protocol simulation was exactly what was asked on my exam." }
    ]
  },
  {
    id: "course-fcps-path",
    title: "Comprehensive Pathology Masterclass for FCPS & Licensing",
    subtitle: "Deep-dive cellular adaptations, acute/chronic inflammation, neoplasia genetics, and high-yield systemic pathology vignettes for regional licensing.",
    category: "MRCP/MRCS",
    instructorName: "Dr. Fatima Al-Sayed, FCPS",
    instructorTitle: "Pathology Consultant, Cairo University Hospitals",
    country: "Egypt",
    rating: 4.9,
    ratingCount: 115,
    studentsCount: 910,
    price: 34,
    currency: "USD",
    thumbnail: "🔬",
    durationHours: 15,
    level: "Advanced",
    syllabus: [
      {
        title: "General Pathology Basics",
        duration: "5 hours",
        lectures: ["Apoptosis vs Necrosis biochem paths", "Free radicals generation and antioxidant defenses", "Wound healing phases and collagen types mapping"]
      },
      {
        title: "Neoplasia & Tumor Genetics",
        duration: "5 hours",
        lectures: ["Proto-oncogenes, tumor suppressors (p53, Rb)", "Chemical and radiation carcinogenesis cascades", "Paraneoplastic syndromes high-yield tables"]
      },
      {
        title: "Hematopathology & Lymphomas",
        duration: "5 hours",
        lectures: ["Microcytic vs Macrocytic anemia differential", "Myelodysplastic syndromes and Leukemia types", "Hodgkin vs Non-Hodgkin Lymphoma biopsies review"]
      }
    ],
    reviews: [
      { reviewer: "Mariam Y.", stars: 5, date: "2026-06-25", comment: "The p53 pathway analysis was a masterstroke. Best hematopathology diagrams I have seen." }
    ]
  },
  {
    id: "course-mrcp-gastro",
    title: "MRCP Part 1 Gastroenterology & Hepatology Board Review",
    subtitle: "Master complex inflammatory bowel disease treatments, liver enzyme panels, and autoimmune hepatitis diagnostic pathways with real registrar cases.",
    category: "MRCP/MRCS",
    instructorName: "Dr. Amit Patel, MRCP",
    instructorTitle: "Senior Gastroenterology Registrar, King's College Hospital",
    country: "United Kingdom",
    rating: 4.9,
    ratingCount: 184,
    studentsCount: 1540,
    price: 54,
    currency: "GBP",
    thumbnail: "🧪",
    durationHours: 10,
    level: "Advanced",
    syllabus: [
      {
        title: "Inflammatory Bowel Disease (IBD)",
        duration: "3 hours",
        lectures: ["Crohn's Disease vs Ulcerative Colitis micro differences", "Biological agents and step-up treatment options", "Complications: Toxic megacolon and fistulizing disease"]
      },
      {
        title: "Chronic Liver Disease & Hepatology",
        duration: "4 hours",
        lectures: ["Ascites management and Spontaneous Bacterial Peritonitis (SBP)", "Wilson's Disease & Hemochromatosis iron load checks", "Viral Hepatitis serology interpretation masterclass"]
      },
      {
        title: "Malabsorption & Pancreatic Diseases",
        duration: "3 hours",
        lectures: ["Celiac Disease tissue antibody titers", "Acute pancreatitis Ranson criteria scoring", "Chronic pancreatitis enzyme replacement therapies"]
      }
    ],
    reviews: [
      { reviewer: "Dr. Joshua T.", stars: 5, date: "2026-06-27", comment: "Dr. Amit is a brilliant educator. His case-based scenarios on SBP and viral serology are identical to MRCP questions." }
    ]
  },
  {
    id: "course-ecg-cardio",
    title: "ECG Interpretation for Emergency & Acute Cardiology",
    subtitle: "Go from confused to confident in reading axis deviation, bundle branch blocks, ischemia localization, and lethal arrhythmias under high pressure.",
    category: "Emergency Medicine",
    instructorName: "Dr. Kenji Tanaka, MD",
    instructorTitle: "Cardiology Registrar, Melbourne Medical Center",
    country: "Australia",
    rating: 4.6,
    ratingCount: 62,
    studentsCount: 420,
    price: 19,
    currency: "AUD",
    thumbnail: "❤️",
    durationHours: 5,
    level: "Intermediate",
    syllabus: [
      {
        title: "The 12-Lead Systematic Approach",
        duration: "1.5 hours",
        lectures: ["Determining heart rate and QRS axis deviation instantly", "Understanding PR, QRS, and QTc intervals anomalies", "Rhythm analysis: block types and sinus criteria"]
      },
      {
        title: "Ischemia & Infarction Patterns",
        duration: "2 hours",
        lectures: ["STEMI localization: Anterior, Lateral, Inferior, Posterior leads", "Reciprocal ST segment changes physiology", "NSTEMI and T-wave inversion diagnostics"]
      },
      {
        title: "Arrhythmias & Conduction Blocks",
        duration: "1.5 hours",
        lectures: ["Wenckebach vs Mobitz Type II AV block safety checks", "Ventricular Tachycardia vs SVT with aberrancy", "Long QT syndrome and Torsades de Pointes triggers"]
      }
    ],
    reviews: [
      { reviewer: "Tariq K.", stars: 4, date: "2026-06-05", comment: "The lead placements and coronary artery territories mapping changed my emergency shifts forever. Highly practical." }
    ]
  }
];

// 1. Get all marketplace courses
app.get("/api/marketplace/courses", (req, res) => {
  res.json({ courses: MARKETPLACE_COURSES });
});

// 2. Post a new user-generated course
app.post("/api/marketplace/courses", (req, res) => {
  const { title, subtitle, category, instructorName, instructorTitle, country, price, currency, level, durationHours, syllabus } = req.body;
  
  if (!title || !instructorName || !category) {
    return res.status(400).json({ error: "Title, Instructor Name, and Category are required." });
  }

  const newCourse: Course = {
    id: `course-${Date.now()}`,
    title,
    subtitle: subtitle || "No subtitle provided. Comprehensive self-paced exam syllabus designed for international medical graduates.",
    category,
    instructorName,
    instructorTitle: instructorTitle || "Independent Accredited Clinical Instructor",
    country: country || "United States",
    rating: 5.0,
    ratingCount: 1,
    studentsCount: 1,
    price: Number(price) || 0,
    currency: currency || "USD",
    thumbnail: "🎓",
    durationHours: Number(durationHours) || 6,
    level: level || "Intermediate",
    syllabus: syllabus || [
      {
        title: "Course Overview & Onboarding",
        duration: "1 hour",
        lectures: ["Introduction & Syllabus Walkthrough", "Licensing Exam Blueprint Mapping & High-Yield Strategy"]
      },
      {
        title: "High-Yield Subject Review Core",
        duration: "3 hours",
        lectures: ["Foundational Pathology Vignettes Review", "Interactive Case Study and Diagnostic Reasoning Loops"]
      },
      {
        title: "Simulated Exam Q-Bank Integration",
        duration: "2 hours",
        lectures: ["Board-Style Mock Block Solutions", "Final Course Summary & Performance Optimization Tips"]
      }
    ],
    reviews: [
      { reviewer: "System Validation", stars: 5, date: new Date().toISOString().split('T')[0], comment: "Course published successfully. Open to trainee registrations." }
    ]
  };

  MARKETPLACE_COURSES.unshift(newCourse);
  res.status(201).json({ message: "Course published successfully", course: newCourse });
});

// 3. Post a review for a course and recalculate ratings
app.post("/api/marketplace/courses/:id/review", (req, res) => {
  const { id } = req.params;
  const { reviewer, stars, comment } = req.body;

  if (!reviewer || !stars || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Reviewer name and valid stars (1-5) are required." });
  }

  const course = MARKETPLACE_COURSES.find(c => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  const newReview: CourseReview = {
    reviewer,
    stars: Number(stars),
    date: new Date().toISOString().split('T')[0],
    comment: comment || "Reviewed by verified trainee course participant."
  };

  course.reviews.push(newReview);
  
  // Recalculate average rating
  const totalStars = course.reviews.reduce((acc, curr) => acc + curr.stars, 0);
  course.rating = Number((totalStars / course.reviews.length).toFixed(1));
  course.ratingCount = course.reviews.length;
  course.studentsCount += 1; // Simulate student enrollment growth with review

  res.json({ message: "Review added successfully", course });
});

// --- Server & Vite Setup ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MedGlobal Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
