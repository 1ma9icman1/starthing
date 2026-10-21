/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Sparkles,
  Calculator,
  Compass,
  ArrowRight,
  Brain,
  Layers,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  ANCIENT_ACOUSTIC_SITES,
  CUBIC_MATH_PRESETS,
  AncientAcousticSite,
  CubicMathProblem,
  performSyntheticDivision,
  getRationalRootCandidates,
} from '../data/ancientSitesData';
import { ChannelId } from '../types';

interface HistoryAndAcousticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySiteFrequencies: (site: AncientAcousticSite) => void;
  onApplyCustomFrequencies: (a: number, b: number, c: number, name?: string) => void;
}

export const HistoryAndAcousticsModal: React.FC<HistoryAndAcousticsModalProps> = ({
  isOpen,
  onClose,
  onApplySiteFrequencies,
  onApplyCustomFrequencies,
}) => {
  const [activeTab, setActiveTab] = useState<'pyramids' | 'sites' | 'neuro' | 'roots-cubics' | 'calculator'>('pyramids');

  // Interactive Cubic Calculator State
  const [selectedCubicPreset, setSelectedCubicPreset] = useState<string>('standard-cubic-123');
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(-6);
  const [coeffC, setCoeffC] = useState<number>(11);
  const [coeffD, setCoeffD] = useState<number>(-6);
  const [testRoot, setTestRoot] = useState<number>(2);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Preset Selection for Calculator
  const handleSelectCubicPreset = (presetId: string) => {
    setSelectedCubicPreset(presetId);
    const p = CUBIC_MATH_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setCoeffA(p.a);
      setCoeffB(p.b);
      setCoeffC(p.c);
      setCoeffD(p.d);
      setTestRoot(p.testedRoot);
    }
  };

  // Compute Rational Root Candidates and Synthetic Division
  const rationalInfo = getRationalRootCandidates(coeffA, coeffD);
  const syntheticResult = performSyntheticDivision(coeffA, coeffB, coeffC, coeffD, testRoot);

  // Solve reduced quadratic: q2*x^2 + q1*x + q0 = 0
  const q2 = syntheticResult.quotient[0];
  const q1 = syntheticResult.quotient[1];
  const q0 = syntheticResult.quotient[2];
  const discriminant = q1 * q1 - 4 * q2 * q0;

  let root2: number | string = 'Complex';
  let root3: number | string = 'Complex';
  if (discriminant >= 0 && q2 !== 0) {
    const r2Val = (-q1 + Math.sqrt(discriminant)) / (2 * q2);
    const r3Val = (-q1 - Math.sqrt(discriminant)) / (2 * q2);
    root2 = Number(r2Val.toFixed(3));
    root3 = Number(r3Val.toFixed(3));
  }

  const handleSendRootsToDAW = (scaleFactor = 110.0) => {
    const r1 = testRoot;
    const r2Num = typeof root2 === 'number' ? root2 : testRoot + 1;
    const r3Num = typeof root3 === 'number' ? root3 : testRoot + 2;

    const fA = Math.max(10, Math.abs(r1) * scaleFactor);
    const fB = Math.max(10, Math.abs(r2Num) * scaleFactor);
    const fC = Math.max(10, Math.abs(r3Num) * scaleFactor);

    onApplyCustomFrequencies(fA, fB, fC, `Cubic Roots: ${r1}, ${root2}, ${root3}`);
    setCopiedNotification(`TUNED OSCILLATORS TO CUBIC ROOTS (${fA.toFixed(1)} / ${fB.toFixed(1)} / ${fC.toFixed(1)} Hz)`);
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#080d19] border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#060a13]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>HISTORICAL RESONANCE & CUBIC ARCHIVES</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SCHOLARLY REFERENCE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Archaeoacoustics of ancient megaliths, the 110 Hz neuroacoustic shift, and algebraic cubic roots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 px-6 py-2.5 border-b border-slate-800 bg-[#0a101f] text-xs font-mono">
          <button
            onClick={() => setActiveTab('pyramids')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pyramids'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pyramid Resonance (Giza)</span>
          </button>

          <button
            onClick={() => setActiveTab('sites')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sites'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ancient Megalithic Sites</span>
          </button>

          <button
            onClick={() => setActiveTab('neuro')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'neuro'
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Why 110 Hz? (Neuro & Quartz)</span>
          </button>

          <button
            onClick={() => setActiveTab('roots-cubics')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'roots-cubics'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roots, Cubics & Ancient Math</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-pink-400" />
            <span>Synthetic Division & Cubic Solver</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm leading-relaxed font-sans">
          {/* TAB 1: THE ACOUSTIC RESONANCE OF PYRAMIDS */}
          {activeTab === 'pyramids' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-amber-500/30 rounded-xl p-5 bg-gradient-to-br from-amber-950/20 to-transparent space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-amber-300 font-mono flex items-center gap-2">
                    <span>The Acoustic Resonance of Pyramids</span>
                  </h3>
                  <button
                    onClick={() => {
                      const site = ANCIENT_ACOUSTIC_SITES[0];
                      onApplySiteFrequencies(site);
                      setCopiedNotification("Tuned DAW to King's Chamber Resonances (117 / 119 / 121 Hz)");
                      setTimeout(() => setCopiedNotification(null), 3000);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>LOAD KING&apos;S CHAMBER INTO DAW</span>
                  </button>
                </div>

                <p className="text-slate-300">
                  Inside the <strong>Great Pyramid of Giza</strong>, acoustic mapping has revealed distinct resonant
                  spikes centered in the <strong>King&apos;s Chamber</strong>. This rectangular room, built of dense pink
                  Aswan granite blocks rich in quartz crystals, acts as a highly effective acoustic amplifier.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-[#050912] border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">THE PRIMARY HUM</span>
                      <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        117 – 121 Hz
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      The most famous measured acoustic eigenmode (natural standing wave) inside the King&apos;s Chamber sits
                      between <strong>117 Hz and 121 Hz</strong>, a deep frequency that aligns perfectly with a low adult
                      male voice.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#050912] border border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">SECONDARY &amp; PEAK SPIKES</span>
                      <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                        49.5 Hz / 440 Hz
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Other testing instruments have identified intense resonance spikes at <strong>49.5 Hz</strong> (the
                      room&apos;s highest amplitude peak in acoustic mapping studies), clusters near <strong>30 Hz</strong>,
                      and secondary high reflections around <strong>440 Hz</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#050912] border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400">INFRASOUND TUBES</span>
                      <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                        5.13 Hz / 16 Hz
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Deep within the subterranean chamber and its dead-end passage, the space acts as a resonance tube
                      producing a very low-frequency infrasound tone at <strong>~5.13 Hz</strong>. Additionally, wind
                      blowing across the pyramid&apos;s air shafts historically generated passive infrasound at roughly{' '}
                      <strong>16 Hz</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#050912] border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-mono font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Granite Quartz Piezoelectricity</span>
                  </h4>
                  <p className="text-slate-400">
                    Aswan pink granite contains a high proportion of quartz crystals (silicon dioxide). When standing sound
                    waves pulse against the granite walls at 117–121 Hz or 49.5 Hz, the mechanical acoustic compression of
                    the crystal lattice induces the <strong>piezoelectric effect</strong>, converting acoustic vibrational
                    energy into subtle electromagnetic oscillations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACOUSTIC RESONANCE AT OTHER ANCIENT SITES */}
          {activeTab === 'sites' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-slate-800 rounded-xl p-5 bg-[#060a14] space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 font-mono">
                    Acoustic Resonance at Other Ancient Sites
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Remarkably, archaeoacousticians have found that Neolithic, Megalithic, and ancient structures across
                    entirely different continents share nearly the exact same acoustic properties. A landmark{' '}
                    <strong>Princeton University study</strong> mapped multiple ancient stone chambers and confirmed a
                    uniform acoustic phenomenon: they almost all sustain a powerful standing wave between{' '}
                    <strong>95 Hz and 120 Hz (specifically targeting 110 Hz)</strong>.
                  </p>
                </div>

                {/* Archaeoacoustic Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0b1222] text-slate-300 border-b border-slate-800">
                        <th className="p-3">Ancient Site / Structure</th>
                        <th className="p-3">Measured Resonant Freq</th>
                        <th className="p-3">Unique Acoustic Property / Effect</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {ANCIENT_ACOUSTIC_SITES.map((site) => (
                        <tr key={site.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-bold text-white flex flex-col">
                            <span>{site.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{site.location}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                              {site.freqRangeDesc}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-md font-sans text-xs">
                            {site.uniqueProperty}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                onApplySiteFrequencies(site);
                                setCopiedNotification(`LOADED ${site.name.toUpperCase()} INTO DAW`);
                                setTimeout(() => setCopiedNotification(null), 3000);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-slate-700 transition-all text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Tune DAW</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHY 110 HZ? NEUROACOUSTICS & PIEZOELECTRICITY */}
          {activeTab === 'neuro' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-purple-500/30 rounded-xl p-5 bg-gradient-to-br from-purple-950/20 to-transparent space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-purple-300 font-mono flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Why 110 Hz?</span>
                  </h3>
                  <button
                    onClick={() => {
                      onApplyCustomFrequencies(110.0, 112.0, 114.0, '110 Hz Ancient Brainwave Entrainment');
                      setCopiedNotification('TUNED OSCILLATORS TO 110 Hz NEURAL HARMONIC ENTRAINMENT');
                      setTimeout(() => setCopiedNotification(null), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>APPLY 110 HZ HARMONICS</span>
                  </button>
                </div>

                <p className="text-slate-300">
                  Scientists from the <strong>Old Temples Study Foundation (OTSF)</strong> and <strong>UCLA</strong>{' '}
                  have monitored brain activity (EEG) while exposing subjects to these frequencies.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#050912] border border-red-500/20 space-y-2">
                    <h4 className="font-mono font-bold text-red-400 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>LEFT TEMPORAL DEACTIVATION (LANGUAGE QUIETED)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tones at 110 Hz cause a temporary deactivation of the brain&apos;s left temporal region (responsible for
                      language processing, critical inner dialogue, and linear verbal thoughts).
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#050912] border border-emerald-500/20 space-y-2">
                    <h4 className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>RIGHT PREFRONTAL CORTEX SHIFT (EMOTION & VISUALIZATION)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Neural activity shifts over to the <strong>right prefrontal cortex</strong>, which governs emotional
                      processing, spatial awareness, and vivid visualization. This suggests ancient builders engineered
                      these chambers intentionally to induce meditative or altered states of consciousness during rituals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#050912] border border-slate-800 space-y-3">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs">
                    Quartz Crystal Piezoelectricity in Ancient Granite
                  </h4>
                  <p className="text-xs text-slate-400">
                    Granite blocks inside the King&apos;s Chamber contain approximately 20–30% pure quartz (SiO₂). Quartz is
                    a non-centrosymmetric crystalline structure with pronounced piezoelectric properties: when acoustic
                    pressure waves flex and compress the crystal lattices, it creates microscopic voltage potentials.
                    Sustained chanting at the 117 Hz or 110 Hz standing wave frequency essentially energizes the granite
                    chamber into an electromechanical acoustic transducer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROOTS, CUBICS, AND ANCIENT STRUCTURES */}
          {activeTab === 'roots-cubics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-slate-800 rounded-xl p-5 bg-[#060a14] space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-emerald-300 font-mono">
                    ROOTS, CUBICS, AND ANCIENT STRUCTURES
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fundamental algebraic principles connecting polynomial zeros, rational root theorems, and ancient
                    monumental geometry.
                  </p>
                </div>

                {/* Section: What is a root? */}
                <div className="p-4 rounded-lg bg-[#050912] border border-emerald-500/20 space-y-3">
                  <h4 className="font-mono font-bold text-emerald-400 text-sm">What is a root?</h4>
                  <p className="text-xs text-slate-300">
                    A root is a value of <code className="text-emerald-300 font-mono">x</code> that makes an equation equal
                    to zero.
                  </p>

                  <div className="p-3 rounded bg-black/40 border border-slate-800 font-mono text-xs space-y-1">
                    <p className="text-amber-300 font-bold">Example: x² - 5x + 6 = 0</p>
                    <p className="text-slate-400">If x = 2: 4 - 10 + 6 = 0  → So 2 is a root.</p>
                    <p className="text-slate-400">If x = 3: 9 - 15 + 6 = 0  → So 3 is also a root.</p>
                  </div>

                  <p className="text-xs text-slate-400">
                    Roots are also called: <strong>Solutions</strong>, <strong>Zeros</strong>, and{' '}
                    <strong>x-intercepts</strong> (on a Cartesian graph). These terms are closely related and mean the same
                    thing in introductory algebra.
                  </p>
                </div>

                {/* Section: Rational Root Theorem */}
                <div className="p-4 rounded-lg bg-[#050912] border border-cyan-500/20 space-y-3">
                  <h4 className="font-mono font-bold text-cyan-400 text-sm">Rational Root Theorem</h4>
                  <p className="text-xs text-slate-300">
                    The Rational Root Theorem is a shortcut for finding possible roots of a cubic equation:
                  </p>

                  <div className="p-3 rounded bg-black/40 border border-slate-800 font-mono text-xs space-y-1.5">
                    <p className="text-cyan-300 font-bold">Example: x³ - 6x² + 11x - 6 = 0</p>
                    <p className="text-slate-300">
                      Possible rational roots = Factors of the constant term ÷ factors of the leading coefficient
                    </p>
                    <p className="text-slate-400">Constant term = -6  → Factors: ±1, ±2, ±3, ±6</p>
                    <p className="text-slate-400">Leading coefficient = 1  → Factors: ±1</p>
                    <p className="text-emerald-300 font-bold">
                      Testing roots yields the three exact roots: x = 1, 2, and 3
                    </p>
                  </div>
                </div>

                {/* Section: Big Picture for Cubics */}
                <div className="p-4 rounded-lg bg-[#050912] border border-purple-500/20 space-y-2">
                  <h4 className="font-mono font-bold text-purple-400 text-sm">Big Picture for Cubics</h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
                    <li>Use the Rational Root Theorem to find possible roots.</li>
                    <li>Test the possible candidate roots.</li>
                    <li>Use synthetic division when you find one that works.</li>
                    <li>Reduce the cubic to a quadratic equation.</li>
                    <li>Solve the quadratic by factoring or using the quadratic formula.</li>
                  </ol>
                </div>

                {/* Section: Ancient Structures and Mathematics */}
                <div className="p-4 rounded-lg bg-[#050912] border border-amber-500/20 space-y-3">
                  <h4 className="font-mono font-bold text-amber-400 text-sm">
                    Ancient Structures and Mathematics: Did ancient builders use these equations directly?
                  </h4>
                  <p className="text-xs text-slate-300">
                    <strong>Usually no.</strong> Ancient civilizations did not write equations in modern algebraic form.
                    However, they used geometry and measurement techniques that eventually led to the development of
                    algebra:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded bg-black/30 border border-slate-800 space-y-1">
                      <strong className="text-amber-300 font-mono">Ancient Egypt:</strong>
                      <p className="text-slate-400">
                        Egyptians used geometry to design and build pyramids. They carefully measured slopes (seked),
                        heights, and proportions.
                      </p>
                    </div>

                    <div className="p-3 rounded bg-black/30 border border-slate-800 space-y-1">
                      <strong className="text-cyan-300 font-mono">Babylonia:</strong>
                      <p className="text-slate-400">
                        Babylonians solved problems equivalent to quadratic equations as early as about 1800 BCE for
                        surveying, land measurement, construction, and engineering.
                      </p>
                    </div>

                    <div className="p-3 rounded bg-black/30 border border-slate-800 space-y-1">
                      <strong className="text-purple-300 font-mono">Ancient Greece:</strong>
                      <p className="text-slate-400">
                        Greek mathematicians such as Euclid solved geometric problems that today can be represented with
                        algebraic equations.
                      </p>
                    </div>

                    <div className="p-3 rounded bg-black/30 border border-slate-800 space-y-1">
                      <strong className="text-pink-300 font-mono">Roman and Renaissance Architecture:</strong>
                      <p className="text-slate-400">
                        Builders of arches, domes, aqueducts, and cathedrals relied on geometric principles described today
                        with quadratic and cubic equations.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                    <strong>Key Takeaway:</strong> Geometry came first. Algebra came later. Ancient builders used geometry
                    to create impressive structures, while modern engineers use algebra and calculus to describe and predict
                    those same shapes with equations.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTERACTIVE SYNTHETIC DIVISION & CUBIC SOLVER */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-pink-500/30 rounded-xl p-5 bg-[#060a14] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-pink-300 font-mono flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-pink-400" />
                      <span>Synthetic Division &amp; Rational Root Calculator</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live polynomial solver computing synthetic division step-by-step and mapping roots to DAW oscillators
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendRootsToDAW(110.0)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>SEND ROOTS TO OSCILLATORS</span>
                  </button>
                </div>

                {/* Preset Equation Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Presets:</span>
                  {CUBIC_MATH_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectCubicPreset(p.id)}
                      className={`px-3 py-1 text-xs font-mono rounded-md border transition-all ${
                        selectedCubicPreset === p.id
                          ? 'bg-pink-500/20 border-pink-500/60 text-pink-300 font-bold'
                          : 'bg-[#080d19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Coefficients Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#050912] border border-slate-800 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">a (x³ coeff)</label>
                    <input
                      type="number"
                      value={coeffA}
                      onChange={(e) => setCoeffA(Number(e.target.value) || 1)}
                      className="w-full bg-[#080d19] border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">b (x² coeff)</label>
                    <input
                      type="number"
                      value={coeffB}
                      onChange={(e) => setCoeffB(Number(e.target.value) || 0)}
                      className="w-full bg-[#080d19] border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">c (x coeff)</label>
                    <input
                      type="number"
                      value={coeffC}
                      onChange={(e) => setCoeffC(Number(e.target.value) || 0)}
                      className="w-full bg-[#080d19] border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">d (constant)</label>
                    <input
                      type="number"
                      value={coeffD}
                      onChange={(e) => setCoeffD(Number(e.target.value) || 0)}
                      className="w-full bg-[#080d19] border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-pink-400 block mb-1 font-bold">Tested Root (r)</label>
                    <input
                      type="number"
                      value={testRoot}
                      onChange={(e) => setTestRoot(Number(e.target.value) || 1)}
                      className="w-full bg-pink-950/30 border border-pink-500/60 rounded px-2.5 py-1.5 text-pink-300 font-bold"
                    />
                  </div>
                </div>

                {/* Equation Display */}
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800 font-mono text-center text-sm text-cyan-300 font-bold">
                  {coeffA}x³ {coeffB >= 0 ? `+ ${coeffB}` : `- ${Math.abs(coeffB)}`}x²{' '}
                  {coeffC >= 0 ? `+ ${coeffC}` : `- ${Math.abs(coeffC)}`}x{' '}
                  {coeffD >= 0 ? `+ ${coeffD}` : `- ${Math.abs(coeffD)}`} = 0
                </div>

                {/* Rational Root Theorem Candidates */}
                <div className="p-4 rounded-xl bg-[#050912] border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">RATIONAL ROOT THEOREM CANDIDATES (±p/q):</span>
                    <span className="text-slate-500">Factors of d={coeffD} ÷ Factors of a={coeffA}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rationalInfo.candidates.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTestRoot(c)}
                        className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                          testRoot === c
                            ? 'bg-pink-500 text-slate-950 font-bold border-pink-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {c > 0 ? `+${c}` : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Synthetic Division Step-by-Step Table */}
                <div className="p-4 rounded-xl bg-[#050912] border border-pink-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-400">SYNTHETIC DIVISION TABLE FOR r = {testRoot}:</span>
                    {syntheticResult.isExactRoot ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>REMAINDER = 0 (EXACT ROOT VERIFIED)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        REMAINDER = {syntheticResult.remainder} (NOT A ROOT)
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <tbody>
                        {/* Row 1: Divisor & Dividend Coefficients */}
                        <tr className="border-b border-slate-800">
                          <td className="p-2.5 font-bold text-pink-400 border-r border-slate-700 bg-pink-950/20 w-16">
                            r = {testRoot}
                          </td>
                          <td className="p-2.5 text-white">{syntheticResult.dividend[0]}</td>
                          <td className="p-2.5 text-white">{syntheticResult.dividend[1]}</td>
                          <td className="p-2.5 text-white">{syntheticResult.dividend[2]}</td>
                          <td className="p-2.5 text-white">{syntheticResult.dividend[3]}</td>
                        </tr>
                        {/* Row 2: Synthetic Products */}
                        <tr className="border-b border-slate-800 text-slate-400">
                          <td className="p-2.5 border-r border-slate-700 bg-[#080d19]">× {testRoot}</td>
                          <td className="p-2.5 text-slate-600">—</td>
                          <td className="p-2.5 text-pink-300">{syntheticResult.syntheticRow[1]}</td>
                          <td className="p-2.5 text-pink-300">{syntheticResult.syntheticRow[2]}</td>
                          <td className="p-2.5 text-pink-300">{syntheticResult.syntheticRow[3]}</td>
                        </tr>
                        {/* Row 3: Reduced Quotient & Remainder */}
                        <tr className="bg-slate-900/40 font-bold">
                          <td className="p-2.5 border-r border-slate-700 text-slate-400">Quotient</td>
                          <td className="p-2.5 text-cyan-400">{syntheticResult.quotient[0]} (x²)</td>
                          <td className="p-2.5 text-cyan-400">{syntheticResult.quotient[1]} (x)</td>
                          <td className="p-2.5 text-cyan-400">{syntheticResult.quotient[2]} (const)</td>
                          <td
                            className={`p-2.5 ${
                              syntheticResult.isExactRoot ? 'text-emerald-400 bg-emerald-950/30' : 'text-amber-400'
                            }`}
                          >
                            R = {syntheticResult.remainder}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Reduced Quadratic */}
                  {syntheticResult.isExactRoot && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5 text-slate-300">
                      <p className="text-cyan-300 font-bold">
                        Reduced Quadratic Equation: {q2}x² {q1 >= 0 ? `+ ${q1}` : `- ${Math.abs(q1)}`}x{' '}
                        {q0 >= 0 ? `+ ${q0}` : `- ${Math.abs(q0)}`} = 0
                      </p>
                      <p className="text-slate-400">
                        Discriminant Δ = b² - 4ac = {discriminant.toFixed(2)} →{' '}
                        <strong className="text-emerald-300">
                          Roots: x₁ = {testRoot}, x₂ = {root2}, x₃ = {root3}
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Notification & Close Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-[#060a13] text-xs font-mono">
          <div className="text-emerald-400 font-bold">
            {copiedNotification ? `✓ ${copiedNotification}` : 'AudioCube Space · Archaeoacoustic & Mathematical Reference'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-bold"
          >
            Close Archives
          </button>
        </div>
      </div>
    </div>
  );
};
