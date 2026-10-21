/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AncientAcousticSite {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  resonantFreq: number; // Primary resonant frequency in Hz
  freqRangeDesc: string;
  uniqueProperty: string;
  historicalContext: string;
  category: 'pyramid' | 'megalith' | 'subterranean' | 'diffraction';
  color: string;
  subharmonicHz?: number;
  infrasoundHz?: number;
  peakHz?: number;
  harmonicsHz?: number[];
}

export const ANCIENT_ACOUSTIC_SITES: AncientAcousticSite[] = [
  {
    id: 'giza-kings-chamber',
    name: "Great Pyramid of Giza (King's Chamber)",
    location: 'Giza Plateau, Egypt',
    lat: 29.9792,
    lon: 31.1342,
    resonantFreq: 117.0,
    freqRangeDesc: '117 Hz – 121 Hz (Primary Hum)',
    uniqueProperty:
      "Built of dense pink Aswan granite rich in quartz crystals. Acts as an acoustic amplifier with eigenmodes centered at 117–121 Hz (aligns with low adult male voice), intense peak at 49.5 Hz, clusters near 30 Hz, secondary high reflections at 440 Hz, and 5.13 Hz subterranean infrasound.",
    historicalContext:
      'The rectangular King\'s Chamber quartz granite exhibits piezoelectric properties when subjected to acoustic standing waves, creating electromagnetic and vibrational field coherence.',
    category: 'pyramid',
    color: '#f59e0b',
    subharmonicHz: 30.0,
    infrasoundHz: 5.13,
    peakHz: 49.5,
    harmonicsHz: [49.5, 117.0, 121.0, 440.0],
  },
  {
    id: 'hal-saflieni',
    name: 'Ħal Saflieni Hypogeum',
    location: 'Paola, Malta',
    lat: 35.8696,
    lon: 14.5069,
    resonantFreq: 110.0,
    freqRangeDesc: '110 Hz – 114 Hz (with double resonance to 70 Hz)',
    uniqueProperty:
      'The "Oracle Room" features carved concave limestone walls that amplify male vocal chanting, generating an echo that vibrates through the physical body and bones.',
    historicalContext:
      'A subterranean Neolithic sanctuary excavated in three levels dating to ~4000–2500 BCE. Acoustically engineered to project resonant sound across subterranean chambers.',
    category: 'subterranean',
    color: '#06b6d4',
    subharmonicHz: 70.0,
    harmonicsHz: [70.0, 110.0, 114.0],
  },
  {
    id: 'newgrange',
    name: 'Newgrange Passage Tomb',
    location: 'Boyne Valley, Ireland',
    lat: 53.6947,
    lon: -6.4753,
    resonantFreq: 110.0,
    freqRangeDesc: '110 Hz (Range: 95–120 Hz)',
    uniqueProperty:
      'A 5,000-year-old stone cavity where sustained low chanting creates powerful standing waves. Circular spirals and megalithic rock art at the site match the geometric nodal patterns of sound waves.',
    historicalContext:
      'Built around 3200 BCE, pre-dating Stonehenge and the Egyptian pyramids. Aligned precisely with the winter solstice sunrise.',
    category: 'megalith',
    color: '#10b981',
    harmonicsHz: [95.0, 110.0, 120.0],
  },
  {
    id: 'chavin-de-huantar',
    name: 'Chavín de Huántar',
    location: 'Ancash, Peru',
    lat: -9.5936,
    lon: -77.1772,
    resonantFreq: 110.0,
    freqRangeDesc: '~110 Hz',
    uniqueProperty:
      'Pre-Incan underground labyrinth with acoustic hydraulic channels and marine strombus shell-horns (pututus) mapped precisely to the human vocal resonant range.',
    historicalContext:
      'Major ceremonial pilgrimage center active from 1200 BCE to 400 BCE, where spatial acoustic illusions guided initiates through dark acoustic galleries.',
    category: 'subterranean',
    color: '#ec4899',
    harmonicsHz: [110.0, 220.0, 330.0],
  },
  {
    id: 'waylands-smithy',
    name: "Wayland's Smithy",
    location: 'Oxfordshire, England',
    lat: 51.5672,
    lon: -1.5975,
    resonantFreq: 112.0,
    freqRangeDesc: '112 Hz (Range: 108–116 Hz)',
    uniqueProperty:
      'A cramped, cruciform megalithic chambered long barrow sustaining strong longitudinal acoustic harmonics when stimulated by low vocal tones.',
    historicalContext:
      'Constructed between 3590 and 3550 BCE. Part of the ancient Ridgeway megalithic landscape alongside the Uffington White Horse.',
    category: 'megalith',
    color: '#8b5cf6',
    harmonicsHz: [56.0, 112.0, 224.0],
  },
  {
    id: 'el-castillo',
    name: 'El Castillo (Chichen Itza)',
    location: 'Yucatan, Mexico',
    lat: 20.6843,
    lon: -88.5678,
    resonantFreq: 1116.0,
    freqRangeDesc: '922 Hz – 1310 Hz (Chirped echo)',
    uniqueProperty:
      'Rather than internal cavity resonance, the outdoor monumental staircase functions as an acoustic diffraction grating. A handclap at the base produces a "chirped" downward frequency sweep mimicking the sacred Quetzal bird call.',
    historicalContext:
      'Step pyramid dedicated to Kukulkan (the Feathered Serpent). During the spring and autumn equinoxes, the afternoon sun creates the illusion of a serpent slithering down the staircase.',
    category: 'diffraction',
    color: '#eab308',
    harmonicsHz: [922.0, 1116.0, 1310.0],
  },
];

export interface CubicMathProblem {
  id: string;
  name: string;
  equation: string;
  a: number;
  b: number;
  c: number;
  d: number;
  roots: number[];
  testedRoot: number;
  description: string;
  suggestedChamberHarmonics: { a: number; b: number; c: number };
}

export const CUBIC_MATH_PRESETS: CubicMathProblem[] = [
  {
    id: 'standard-cubic-123',
    name: 'Natural Cubic Roots (x = 1, 2, 3)',
    equation: 'x³ - 6x² + 11x - 6 = 0',
    a: 1,
    b: -6,
    c: 11,
    d: -6,
    roots: [1, 2, 3],
    testedRoot: 2,
    description:
      'Classic cubic polynomial from the user brief. Factors of -6 divided by factors of 1 yield possible rational roots ±1, ±2, ±3, ±6. Testing x = 2 and synthetic division reduces to (x - 1)(x - 3) = 0.',
    suggestedChamberHarmonics: { a: 110.0 * 1, b: 110.0 * 2, c: 110.0 * 3 }, // 110, 220, 330 Hz
  },
  {
    id: 'kings-chamber-triad',
    name: "King's Chamber Eigenmode Trinity",
    equation: 'x³ - 5x² + 6x = 0  [x(x - 2)(x - 3)]',
    a: 1,
    b: -5,
    c: 6,
    d: 0,
    roots: [0, 2, 3],
    testedRoot: 2,
    description:
      'Fundamental quadratic reduction x² - 5x + 6 = 0 from user brief. Roots x = 2 and x = 3 with zero root representing the baseline infrasonic node.',
    suggestedChamberHarmonics: { a: 49.5, b: 117.0, c: 121.0 },
  },
  {
    id: 'pyramid-slope-golden',
    name: 'Great Pyramid 7:11 Seked Cubic (Proportions 7 to 11)',
    equation: '4x³ - 12x² + 11x - 3 = 0',
    a: 4,
    b: -12,
    c: 11,
    d: -3,
    roots: [0.5, 1.0, 1.5],
    testedRoot: 1,
    description:
      'Geometric seked slope equation modeled on Egyptian rise/run proportions (height 280 cubits to base 440 cubits, ratio 7:11). Rational roots are rational fractions 1/2, 1, 3/2.',
    suggestedChamberHarmonics: { a: 110.0, b: 112.0, c: 117.0 },
  },
];

/**
 * Perform synthetic division of polynomial ax^3 + bx^2 + cx + d by (x - r)
 */
export function performSyntheticDivision(
  a: number,
  b: number,
  c: number,
  d: number,
  r: number
): {
  dividend: [number, number, number, number];
  divisor: number;
  syntheticRow: [number, number, number, number];
  quotient: [number, number, number];
  remainder: number;
  isExactRoot: boolean;
} {
  const dividend: [number, number, number, number] = [a, b, c, d];
  const q2 = a;
  const prod1 = q2 * r;
  const q1 = b + prod1;
  const prod2 = q1 * r;
  const q0 = c + prod2;
  const prod3 = q0 * r;
  const remainder = d + prod3;

  return {
    dividend,
    divisor: r,
    syntheticRow: [0, prod1, prod2, prod3],
    quotient: [q2, q1, q0],
    remainder: Number(remainder.toFixed(6)),
    isExactRoot: Math.abs(remainder) < 0.0001,
  };
}

/**
 * Compute integer factors of n
 */
export function getIntegerFactors(n: number): number[] {
  const absN = Math.round(Math.abs(n));
  if (absN === 0) return [0];
  const factors: Set<number> = new Set();
  for (let i = 1; i * i <= absN; i++) {
    if (absN % i === 0) {
      factors.add(i);
      factors.add(absN / i);
    }
  }
  return Array.from(factors).sort((a, b) => a - b);
}

/**
 * Generate candidate rational roots p/q using the Rational Root Theorem
 */
export function getRationalRootCandidates(a: number, d: number): {
  pFactors: number[];
  qFactors: number[];
  candidates: number[];
} {
  const pFactors = getIntegerFactors(d);
  const qFactors = getIntegerFactors(a);
  const candidateSet: Set<number> = new Set();

  for (const p of pFactors) {
    for (const q of qFactors) {
      if (q !== 0) {
        candidateSet.add(p / q);
        candidateSet.add(-p / q);
      }
    }
  }

  return {
    pFactors,
    qFactors,
    candidates: Array.from(candidateSet).sort((x, y) => x - y),
  };
}
