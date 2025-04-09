import { toast } from 'react-toastify';

const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
};

const useOvulationPrediction = (formData, setResults, setFormData) => {
  const predict = () => {
    const {
      lastMenstrualPeriod,
      firstMenstrualPeriod,
      weight,
      height,
      bleedingIntensity,
      dischargeType,
    } = formData;

    const isComplete = [
      lastMenstrualPeriod,
      firstMenstrualPeriod,
      weight,
      height,
      bleedingIntensity,
      dischargeType,
    ].every(Boolean);

    if (
        !lastMenstrualPeriod ||
        !firstMenstrualPeriod ||
        !weight?.toString().trim() ||
        !height?.toString().trim() ||
        !bleedingIntensity ||
        !dischargeType
      ) {
        toast.warning('Please fill out all required fields ❗');
        return;
      }
      
    // Peak ovulation day (typically 14 days after LMP)
    const peak = new Date(lastMenstrualPeriod);
    peak.setDate(peak.getDate() + 14);

    // Randomize ovulation phase duration (3 to 5 days)
    const phaseLength = Math.floor(Math.random() * 3) + 3; // 3, 4 or 5
    const half = Math.floor(phaseLength / 2);

    const start = new Date(peak);
    start.setDate(start.getDate() - half);

    const end = new Date(start);
    end.setDate(start.getDate() + phaseLength - 1);

    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    // Update results and prediction window
    setResults({
      peakOvulationDay: peak.toISOString(),
      predictionStartDate: start.toISOString(),
      predictionEndDate: end.toISOString(),
      bmi,
      bmiCategory,
    });

    setFormData((prev) => ({
      ...prev,
      predictionStartDate: start.toISOString(),
      predictionEndDate: end.toISOString(),
    }));
  };

  return predict;
};

export default useOvulationPrediction;
