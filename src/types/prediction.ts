export type MLBranch =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'Electronics & Communication'
  | 'Electrical Engineering'
  | 'Mechanical Engineering'
  | 'Civil Engineering';

export const ML_BRANCHES: MLBranch[] = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const ML_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type MLSemester = (typeof ML_SEMESTERS)[number];

export interface PredictionInput {
  studentId?: string;
  name?: string;
  department?: string;
  branch: MLBranch | string;
  semester: number;
  attendance: number;
  assignments: number;
  completedAssignments: number;
  cgpa: number;
  backlogs: number;
  scholarship: boolean;
  financialStatus: 'low' | 'medium' | 'high';
  behavioralScore: number; // 1-10
  counselingSessions: number;
}

export interface ShapFeatureContribution {
  feature: string;
  displayName: string;
  value: string | number;
  contribution: number; // raw weight impact, can be negative (reduces risk) or positive (increases risk)
  direction: 'supports_graduation' | 'supports_dropout';
}

export interface PredictionRecommendation {
  category: 'academic' | 'attendance' | 'study_plan' | 'counseling' | 'mental_health' | 'financial_aid';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  expectedImprovement: string;
}

export interface AIInsights {
  strengths: string[];
  weaknesses: string[];
  keyRiskFactors: string[];
  positiveIndicators: string[];
  areasForImprovement: string[];
}

export interface PredictionHistoryItem {
  id: string;
  studentName: string;
  date: string;
  riskScore: number; // 0 - 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  attendance: number;
  cgpa: number;
  counselingSessions: number;
  modelVersion: string;
}

export interface PredictionResult {
  predictionId: string;
  studentId: string;
  studentName: string;
  predictionStatus: 'Success' | 'Inference Failed';
  dropoutProbability: number; // 0 - 100
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  predictionTime: string;
  modelVersion: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  shapData: ShapFeatureContribution[];
  recommendations: PredictionRecommendation[];
  insights: AIInsights;
  historicalTrend: {
    date: string;
    riskScore: number;
    attendance: number;
    cgpa: number;
    counselingSessions: number;
  }[];
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  version: string;
  trainingDate: string;
  datasetSize: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}
