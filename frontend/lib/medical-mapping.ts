export const getSpecializationForDisease = (disease: string): string => {
  const d = disease.toLowerCase();
  if (
    d.includes("heart") ||
    d.includes("hypertension") ||
    d.includes("cardio") ||
    d.includes("artery")
  )
    return "Cardiologist";
  if (
    d.includes("acne") ||
    d.includes("psoriasis") ||
    d.includes("eczema") ||
    d.includes("fungal") ||
    d.includes("skin") ||
    d.includes("dermat")
  )
    return "Dermatologist";
  if (
    d.includes("migraine") ||
    d.includes("stroke") ||
    d.includes("neurology") ||
    d.includes("brain") ||
    d.includes("headache")
  )
    return "Neurologist";
  if (
    d.includes("gerd") ||
    d.includes("ulcer") ||
    d.includes("stomach") ||
    d.includes("gastro") ||
    d.includes("abdominal")
  )
    return "Gastroenterologist";
  if (
    d.includes("asthma") ||
    d.includes("copd") ||
    d.includes("pneumonia") ||
    d.includes("lung") ||
    d.includes("bronchitis")
  )
    return "Pulmonologist";
  if (
    d.includes("diabetes") ||
    d.includes("thyroid") ||
    d.includes("hormone") ||
    d.includes("endo")
  )
    return "Endocrinologist";
  if (
    d.includes("joint") ||
    d.includes("arthritis") ||
    d.includes("bone") ||
    d.includes("rheumat")
  )
    return "Rheumatologist";
  if (d.includes("allergy") || d.includes("allergic") || d.includes("immune"))
    return "Allergist / Immunologist";
  return "General Physician";
};
