// Comprehensive symptom-to-specialization mapping
const SPECIALIZATION_KEYWORDS = {
  "Cardiologist": [
    "chest pain", "chest discomfort", "heart", "palpitation", "arrhythmia",
    "high blood pressure", "hypertension", "irregular heartbeat", "shortness of breath",
    "cardiac", "myocardial", "angina", "ecg", "echocardiogram"
  ],
  "Dermatologist": [
    "skin", "rash", "acne", "itching", "eczema", "psoriasis", "mole", "wart",
    "fungal infection", "dermatitis", "hives", "allergic", "skin condition",
    "boil", "pimple", "skin disease", "pigmentation"
  ],
  "Dentist": [
    "teeth", "gum", "tooth", "jaw", "dental", "cavity", "toothache", "root canal",
    "braces", "gingivitis", "periodontal", "mouth sore", "oral", "bite", "crown",
    "filling", "extraction"
  ],
  "Neurologist": [
    "brain", "headache", "migraine", "seizure", "dizzy", "dizziness", "nerve",
    "neurological", "stroke", "tremor", "paralysis", "loss of consciousness",
    "numbness", "tingling", "vertigo", "convulsion", "neuropathy", "alzheimer",
    "parkinson", "brain tumor"
  ],
  "Ophthalmologist": [
    "eye", "vision", "blur", "blurred vision", "blind", "blindness", "glaucoma",
    "cataract", "contact lens", "glasses", "astigmatism", "myopia", "hyperopia",
    "eye pain", "eye infection", "conjunctivitis", "retina", "cornea"
  ],
  "Pediatrician": [
    "child", "baby", "kid", "infant", "newborn", "toddler", "childhood",
    "vaccination", "immunization", "developmental delay", "growth", "pediatric",
    "baby health", "child development", "feeding issue"
  ],
  "Orthopedic": [
    "bone", "joint", "fracture", "knee", "knee pain", "ankle", "shoulder",
    "back pain", "spine", "arthritis", "osteoporosis", "sport injury",
    "ligament", "tendon", "muscle strain", "dislocation", "orthopedic",
    "sprain", "meniscus", "cartilage"
  ],
  "Gastroenterologist": [
    "stomach", "digest", "digestion", "vomit", "nausea", "acid reflux", "gerd",
    "ulcer", "gastric", "intestine", "crohn's", "ibs", "liver", "pancreas",
    "abdominal pain", "diarrhea", "constipation", "malabsorption", "colitis"
  ],
  "Pulmonologist": [
    "lung", "pneumonia", "asthma", "bronchitis", "cough", "respiratory", "breathing",
    "respiratory infection", "tuberculosis", "emphysema", "copd", "chest pain",
    "wheezing", "shortness of breath", "pulmonary", "thorax"
  ],
  "Urologist": [
    "urinary", "kidney", "bladder", "urine", "urination", "prostate", "erectile",
    "kidney stone", "uti", "incontinence", "hematuria", "renal", "urology",
    "urethritis", "cystitis", "nephrolithiasis"
  ],
  "Endocrinologist": [
    "diabetes", "blood sugar", "thyroid", "hormone", "metabolic", "endocrine",
    "obesity", "pcos", "adrenal", "glucose", "insulin", "hyperthyroid",
    "hypothyroid", "goiter", "metabolic disorder"
  ],
  "Rheumatologist": [
    "rheumatoid", "arthritis", "joint pain", "rheumatism", "autoimmune",
    "lupus", "inflammation", "inflammatory", "scleroderma", "connective tissue",
    "joint stiffness", "swelling"
  ],
  "ENT (Otolaryngologist)": [
    "ear", "nose", "throat", "hearing", "deaf", "tinnitus", "sinusitis",
    "sore throat", "sinus", "allergy", "nasal", "voice", "ent",
    "otolaryngology", "hearing loss", "ear infection", "vertigo"
  ],
  "Psychologist/Psychiatrist": [
    "depression", "anxiety", "mental health", "panic", "stress", "insomnia",
    "psychologist", "psychiatrist", "mood", "bipolar", "schizophrenia",
    "phobia", "ocd", "ptsd", "behavioral", "emotional", "psychological"
  ],
  "Oncologist": [
    "cancer", "tumor", "malignant", "oncology", "chemotherapy", "radiotherapy",
    "metastasis", "carcinoma", "lymphoma", "leukemia", "breast cancer",
    "lung cancer", "colon cancer"
  ],
  "Nephrologist": [
    "kidney disease", "renal", "dialysis", "creatinine", "glomerulonephritis",
    "nephrotic", "chronic kidney", "acute kidney", "kidney failure", "hypertension"
  ]
};

// Priority detection keywords
const EMERGENCY_KEYWORDS = [
  "chest pain", "difficulty breathing", "severe bleeding", "unconscious",
  "unresponsive", "emergency", "acute", "stroke", "seizure", "severe", "critical",
  "severe trauma", "severe injury", "heart attack", "anaphylaxis", "shock",
  "loss of consciousness", "heavy bleeding", "respiratory distress"
];

const URGENT_KEYWORDS = [
  "fever", "pain", "vomit", "vomiting", "nausea", "rash", "migraine", "infection",
  "dizzy", "dizziness", "persistent", "worsening", "bleeding", "swelling",
  "moderate pain", "high fever", "persistent vomiting", "allergic reaction"
];

const calculateRecommendation = (symptoms) => {
  const lowerSymptoms = symptoms.toLowerCase();
  const scores = {};

  // Score each specialization based on keyword matches
  Object.entries(SPECIALIZATION_KEYWORDS).forEach(([spec, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerSymptoms.includes(keyword)) {
        score += 1;
      }
    });
    if (score > 0) {
      scores[spec] = score;
    }
  });

  // Return top match or General Physician if no match
  if (Object.keys(scores).length === 0) {
    return "General Physician";
  }

  const topMatch = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return topMatch ? topMatch[0] : "General Physician";
};

const calculatePriority = (symptoms) => {
  const lowerSymptoms = symptoms.toLowerCase();

  // Check for emergency keywords
  if (EMERGENCY_KEYWORDS.some(keyword => lowerSymptoms.includes(keyword))) {
    return "HIGH";
  }

  // Check for urgent keywords
  if (URGENT_KEYWORDS.some(keyword => lowerSymptoms.includes(keyword))) {
    return "MEDIUM";
  }

  return "LOW";
};

import Doctor from '../models/Doctor.js';
import symptomMap from '../utils/symptomMap.js';

export const recommendDoctors = async (req, res) => {
  try {
    const { symptoms, city } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symptoms array is required"
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }

    // Map symptoms to specialties
    const specialties = new Set();
    symptoms.forEach(symptom => {
      const lowerSymptom = symptom.toLowerCase().trim();
      if (symptomMap[lowerSymptom]) {
        specialties.add(symptomMap[lowerSymptom]);
      }
    });

    // If no direct matches, use AI recommendation
    if (specialties.size === 0) {
      const symptomText = symptoms.join(' ');
      const aiSpecialty = calculateRecommendation(symptomText);
      specialties.add(aiSpecialty);
    }

    // Query doctors
    const doctors = await Doctor.find({
      specialization: { $in: Array.from(specialties) },
      city: new RegExp(city, 'i')
    })
    .populate('department', 'name')
    .sort({ rating: -1, experience: -1 })
    .limit(5)
    .select('name specialization rating experience consultationFee city profileImage availability');

    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
      specialties: Array.from(specialties)
    });

  } catch (error) {
    console.error('AI Doctor Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const recommendDoctor = (req, res) => {
  try {
    const { symptoms = "" } = req.body;

    if (!symptoms.trim()) {
      return res.status(200).json({
        success: true,
        recommendedSpecialization: null,
        priority: "LOW"
      });
    }

    const recommendedSpecialization = calculateRecommendation(symptoms);
    const priority = calculatePriority(symptoms);

    return res.status(200).json({
      success: true,
      recommendedSpecialization,
      priority
    });
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error analyzing text." });
  }
};
