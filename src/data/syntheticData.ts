// Synthetic datasets for UAE Water-Energy Nexus simulation

// Hourly baseline patterns for a typical day in UAE
export const hourlyDemandBaseline = {
  // Water demand in million gallons per hour (MG/h) for a typical UAE summer day
  waterDemand: [
    45, 42, 40, 38, 37, 40, 52, 68, 82, 88, 92, 95, 
    93, 90, 88, 85, 82, 78, 72, 68, 62, 55, 50, 47
  ],
  // Electricity consumption in GWh for the same 24 hours
  electricityConsumption: [
    12.5, 11.8, 11.2, 10.8, 10.5, 11.0, 13.5, 16.2, 19.5, 21.8, 24.2, 26.5,
    27.8, 28.2, 27.5, 26.0, 24.5, 22.8, 20.5, 18.2, 16.0, 14.5, 13.5, 13.0
  ],
  // Baseline temperature pattern (°C)
  temperature: [
    32, 31, 30, 29, 29, 30, 33, 36, 39, 42, 44, 46,
    47, 48, 47, 46, 44, 42, 40, 38, 36, 35, 34, 33
  ]
};

// Scenario modifiers for different conditions
export const scenarioModifiers = {
  normal: {
    name: "Normal Day",
    description: "Typical summer operating conditions",
    waterMultiplier: 1.0,
    electricityMultiplier: 1.0,
    temperatureOffset: 0,
    icon: "Sun"
  },
  heatwave: {
    name: "Heatwave Alert",
    description: "Extreme heat event (+5°C above normal)",
    waterMultiplier: 1.25,
    electricityMultiplier: 1.35,
    temperatureOffset: 5,
    icon: "Thermometer"
  },
  tourism: {
    name: "Tourism Peak",
    description: "Major events and holiday season",
    waterMultiplier: 1.15,
    electricityMultiplier: 1.20,
    temperatureOffset: 0,
    icon: "Users"
  },
  future2030: {
    name: "Future 2030",
    description: "Projected demand with population growth",
    waterMultiplier: 1.40,
    electricityMultiplier: 1.45,
    temperatureOffset: 2,
    icon: "TrendingUp"
  }
};

// Desalination plant data for UAE
export const desalinationPlants = [
  {
    id: "jebel-ali",
    name: "Jebel Ali Desalination Complex",
    location: "Dubai",
    capacity: 2140, // Million gallons per day
    energyIntensity: 3.5, // kWh per cubic meter
    technology: "Multi-Stage Flash",
    efficiency: 0.92,
    currentOutput: 0.85 // Current output as fraction of capacity
  },
  {
    id: "taweelah",
    name: "Taweelah RO Plant",
    location: "Abu Dhabi",
    capacity: 909, // MGD - world's largest RO plant
    energyIntensity: 2.8, // Lower due to RO technology
    technology: "Reverse Osmosis",
    efficiency: 0.95,
    currentOutput: 0.90
  },
  {
    id: "fujairah",
    name: "Fujairah Hybrid Plant",
    location: "Fujairah",
    capacity: 591,
    energyIntensity: 3.0,
    technology: "Hybrid MSF/RO",
    efficiency: 0.93,
    currentOutput: 0.88
  },
  {
    id: "umm-al-nar",
    name: "Umm Al Nar",
    location: "Abu Dhabi",
    capacity: 450,
    energyIntensity: 3.4,
    technology: "Multi-Stage Flash",
    efficiency: 0.90,
    currentOutput: 0.82
  }
];

// UAE-specific emission factors
export const emissionFactors = {
  // kg CO₂ per kWh of electricity
  gridElectricity: 0.45,
  // kg CO₂ per cubic meter of desalinated water
  desalinationMSF: 2.8,
  desalinationRO: 1.8,
  desalinationHybrid: 2.2,
  // Reference values
  uaeGridAverage: 0.45,
  renewableOffset: 0.12, // Current renewable mix in UAE
  // Improvement potentials
  solarPotential: 0.35, // Reduction possible with solar
  efficiencyPotential: 0.15 // Reduction with operational optimization
};

// Key UAE statistics for display
export const uaeStats = {
  dailyWaterConsumption: 550, // Liters per capita
  desalinationPercentage: 98.8, // % of water from desalination
  annualEnergyForWater: 14, // % of national energy for water
  populationGrowthRate: 1.4, // Annual %
  totalDesalinationCapacity: 4090, // MGD
  renewableEnergyTarget2030: 30, // % target
  waterDemandGrowth: 6.5 // Annual % increase
};

// Optimization strategies database
export const optimizationStrategies = [
  {
    id: "peak-shift",
    name: "Peak Load Shifting",
    description: "Increase desalination during off-peak hours when electricity costs are lower",
    category: "operations",
    impactCO2: 12, // % reduction
    impactCost: 18, // % cost savings
    impactEfficiency: 8, // % efficiency gain
    difficulty: "medium",
    timeToImplement: "immediate"
  },
  {
    id: "ro-priority",
    name: "RO Plant Prioritization",
    description: "Maximize output from more efficient Reverse Osmosis plants",
    category: "technology",
    impactCO2: 22,
    impactCost: 15,
    impactEfficiency: 18,
    difficulty: "low",
    timeToImplement: "immediate"
  },
  {
    id: "solar-integration",
    name: "Solar Power Integration",
    description: "Utilize solar energy during peak sunlight for desalination operations",
    category: "renewable",
    impactCO2: 35,
    impactCost: 25,
    impactEfficiency: 12,
    difficulty: "high",
    timeToImplement: "short-term"
  },
  {
    id: "demand-response",
    name: "Demand Response Program",
    description: "Coordinate with large consumers to reduce peak demand",
    category: "demand",
    impactCO2: 8,
    impactCost: 12,
    impactEfficiency: 5,
    difficulty: "medium",
    timeToImplement: "immediate"
  },
  {
    id: "storage-optimization",
    name: "Water Storage Optimization",
    description: "Strategic reservoir management for demand smoothing",
    category: "operations",
    impactCO2: 10,
    impactCost: 8,
    impactEfficiency: 15,
    difficulty: "low",
    timeToImplement: "immediate"
  },
  {
    id: "hybrid-operation",
    name: "Hybrid Plant Scheduling",
    description: "Dynamic switching between MSF and RO based on grid conditions",
    category: "technology",
    impactCO2: 18,
    impactCost: 14,
    impactEfficiency: 20,
    difficulty: "medium",
    timeToImplement: "short-term"
  }
];

// Types for TypeScript
export type ScenarioType = keyof typeof scenarioModifiers;

export interface SimulationParams {
  scenario: ScenarioType;
  temperature: number;
  populationGrowth: number;
  date: Date;
}

export interface ForecastResult {
  hour: number;
  waterDemand: number;
  electricityConsumption: number;
  temperature: number;
  confidence: number;
}

export interface OptimizationRecommendation {
  strategyId: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: {
    co2Reduction: number;
    costSavings: number;
    efficiencyGain: number;
  };
  reasoning: string;
}

export interface SustainabilityMetrics {
  baselineCO2: number;
  optimizedCO2: number;
  co2Reduction: number;
  co2ReductionPercent: number;
  energySaved: number;
  energySavedPercent: number;
  waterEfficiency: number;
  waterEfficiencyPercent: number;
}
