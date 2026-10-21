import { TrinauralConfig, WaveformType, SpatialRoutingMode } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;

  // Channel A Nodes (Left / Cyan)
  private aOsc: OscillatorNode | null = null;
  private aGainNode: GainNode | null = null;
  private aAirFilter: BiquadFilterNode | null = null;
  private aPanner: StereoPannerNode | null = null;
  private aPanner3D: PannerNode | null = null;
  public aAnalyser: AnalyserNode | null = null;

  // Channel B Nodes (Right / Pink)
  private bOsc: OscillatorNode | null = null;
  private bGainNode: GainNode | null = null;
  private bAirFilter: BiquadFilterNode | null = null;
  private bPanner: StereoPannerNode | null = null;
  private bPanner3D: PannerNode | null = null;
  public bAnalyser: AnalyserNode | null = null;

  // Channel C Nodes (Spatial Center / Amber)
  private cOsc: OscillatorNode | null = null;
  private cGainNode: GainNode | null = null;
  private cAirFilter: BiquadFilterNode | null = null;
  private cPanner: StereoPannerNode | null = null;
  private cPanner3D: PannerNode | null = null;
  public cAnalyser: AnalyserNode | null = null;

  // Syngen Ancient Chamber Acoustic Resonance (King's Chamber Reverb & Infrasound)
  private chamberReverbGain: GainNode | null = null;
  private chamberDelayNode: DelayNode | null = null;
  private chamberFeedbackGain: GainNode | null = null;
  private infrasoundOsc: OscillatorNode | null = null;
  private infrasoundGain: GainNode | null = null;

  // Master Output
  private masterGain: GainNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;

  // Recording
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  private config: TrinauralConfig;

  constructor(initialConfig: TrinauralConfig) {
    this.config = { ...initialConfig };
  }

  public async initAudio(): Promise<boolean> {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return true;
  }

  public async start(): Promise<void> {
    await this.initAudio();
    if (!this.ctx || this.isRunning) return;

    const t = this.ctx.currentTime;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.config.masterVolume, t);

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // Media recorder stream
    this.mediaStreamDest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.mediaStreamDest);

    // --- Channel A Setup ---
    this.aOsc = this.ctx.createOscillator();
    this.aGainNode = this.ctx.createGain();
    this.aAirFilter = this.ctx.createBiquadFilter();
    this.aAirFilter.type = 'lowpass';
    this.aAirFilter.frequency.setValueAtTime(20000, t);
    this.aPanner = this.ctx.createStereoPanner();
    this.aPanner3D = this.ctx.createPanner();
    this.configure3DPanner(this.aPanner3D);
    this.aAnalyser = this.ctx.createAnalyser();
    this.aAnalyser.fftSize = 256;
    this.aAnalyser.smoothingTimeConstant = 0.8;

    // --- Channel B Setup ---
    this.bOsc = this.ctx.createOscillator();
    this.bGainNode = this.ctx.createGain();
    this.bAirFilter = this.ctx.createBiquadFilter();
    this.bAirFilter.type = 'lowpass';
    this.bAirFilter.frequency.setValueAtTime(20000, t);
    this.bPanner = this.ctx.createStereoPanner();
    this.bPanner3D = this.ctx.createPanner();
    this.configure3DPanner(this.bPanner3D);
    this.bAnalyser = this.ctx.createAnalyser();
    this.bAnalyser.fftSize = 256;
    this.bAnalyser.smoothingTimeConstant = 0.8;

    // --- Channel C Setup ---
    this.cOsc = this.ctx.createOscillator();
    this.cGainNode = this.ctx.createGain();
    this.cAirFilter = this.ctx.createBiquadFilter();
    this.cAirFilter.type = 'lowpass';
    this.cAirFilter.frequency.setValueAtTime(20000, t);
    this.cPanner = this.ctx.createStereoPanner();
    this.cPanner3D = this.ctx.createPanner();
    this.configure3DPanner(this.cPanner3D);
    this.cAnalyser = this.ctx.createAnalyser();
    this.cAnalyser.fftSize = 256;
    this.cAnalyser.smoothingTimeConstant = 0.8;

    // --- Syngen King's Chamber Acoustic Feedback Reverb ---
    this.chamberDelayNode = this.ctx.createDelay(1.0);
    this.chamberDelayNode.delayTime.setValueAtTime(0.048, t); // 48ms granite chamber reflection
    this.chamberFeedbackGain = this.ctx.createGain();
    this.chamberFeedbackGain.gain.setValueAtTime(0.38, t);
    this.chamberReverbGain = this.ctx.createGain();
    this.chamberReverbGain.gain.setValueAtTime(this.config.chamberReverb ? 0.35 : 0.0, t);

    this.chamberDelayNode.connect(this.chamberFeedbackGain);
    this.chamberFeedbackGain.connect(this.chamberDelayNode);
    this.chamberDelayNode.connect(this.chamberReverbGain);
    this.chamberReverbGain.connect(this.masterGain);

    // --- Infrasound Acoustic Subharmonic Generator (5.13 Hz & 16 Hz) ---
    this.infrasoundOsc = this.ctx.createOscillator();
    this.infrasoundOsc.type = 'sine';
    this.infrasoundOsc.frequency.setValueAtTime(16.0, t); // 16 Hz pyramid air shaft resonance
    this.infrasoundGain = this.ctx.createGain();
    this.infrasoundGain.gain.setValueAtTime(this.config.infrasoundActive ? 0.15 : 0.0, t);
    this.infrasoundOsc.connect(this.infrasoundGain);
    this.infrasoundGain.connect(this.masterGain);
    this.infrasoundOsc.start(t);

    // Route audio graphs
    this.connectRouting();

    // Set frequencies, waveforms, gains, 3D positions
    this.updateFrequencies(t);
    this.updateWaveforms();
    this.updateGains(t);
    this.updateSpatialPositions(t);

    // Start oscillators
    this.aOsc.start(t);
    this.bOsc.start(t);
    this.cOsc.start(t);

    this.isRunning = true;
  }

  private configure3DPanner(panner: PannerNode): void {
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
  }

  private connectRouting(): void {
    if (
      !this.aOsc ||
      !this.aGainNode ||
      !this.aAirFilter ||
      !this.aPanner ||
      !this.aPanner3D ||
      !this.aAnalyser ||
      !this.bOsc ||
      !this.bGainNode ||
      !this.bAirFilter ||
      !this.bPanner ||
      !this.bPanner3D ||
      !this.bAnalyser ||
      !this.cOsc ||
      !this.cGainNode ||
      !this.cAirFilter ||
      !this.cPanner ||
      !this.cPanner3D ||
      !this.cAnalyser ||
      !this.masterGain
    ) {
      return;
    }

    try {
      this.aOsc.disconnect();
      this.aGainNode.disconnect();
      this.aAirFilter.disconnect();
      this.aPanner.disconnect();
      this.aPanner3D.disconnect();
      this.aAnalyser.disconnect();

      this.bOsc.disconnect();
      this.bGainNode.disconnect();
      this.bAirFilter.disconnect();
      this.bPanner.disconnect();
      this.bPanner3D.disconnect();
      this.bAnalyser.disconnect();

      this.cOsc.disconnect();
      this.cGainNode.disconnect();
      this.cAirFilter.disconnect();
      this.cPanner.disconnect();
      this.cPanner3D.disconnect();
      this.cAnalyser.disconnect();
    } catch {
      // ignore
    }

    if (this.config.spatialMode === 'trinaural-isolated') {
      // Isolated Trinaural: Channel A (-1.0 Left), Channel B (+1.0 Right), Channel C (0.0 Center)
      this.aPanner.pan.value = -1.0;
      this.bPanner.pan.value = 1.0;
      this.cPanner.pan.value = 0.0;

      // CH-A: Osc -> Gain -> AirFilter -> Panner -> Analyser -> Master
      this.aOsc.connect(this.aGainNode);
      this.aGainNode.connect(this.aAirFilter);
      this.aAirFilter.connect(this.aPanner);
      this.aPanner.connect(this.aAnalyser);
      this.aAnalyser.connect(this.masterGain);

      // CH-B: Osc -> Gain -> AirFilter -> Panner -> Analyser -> Master
      this.bOsc.connect(this.bGainNode);
      this.bGainNode.connect(this.bAirFilter);
      this.bAirFilter.connect(this.bPanner);
      this.bPanner.connect(this.bAnalyser);
      this.bAnalyser.connect(this.masterGain);

      // CH-C: Osc -> Gain -> AirFilter -> Panner -> Analyser -> Master
      this.cOsc.connect(this.cGainNode);
      this.cGainNode.connect(this.cAirFilter);
      this.cAirFilter.connect(this.cPanner);
      this.cPanner.connect(this.cAnalyser);
      this.cAnalyser.connect(this.masterGain);
    } else {
      // 3D HRTF Spatial Room
      this.aOsc.connect(this.aGainNode);
      this.aGainNode.connect(this.aAirFilter);
      this.aAirFilter.connect(this.aPanner3D);
      this.aPanner3D.connect(this.aAnalyser);
      this.aAnalyser.connect(this.masterGain);

      this.bOsc.connect(this.bGainNode);
      this.bGainNode.connect(this.bAirFilter);
      this.bAirFilter.connect(this.bPanner3D);
      this.bPanner3D.connect(this.bAnalyser);
      this.bAnalyser.connect(this.masterGain);

      this.cOsc.connect(this.cGainNode);
      this.cGainNode.connect(this.cAirFilter);
      this.cAirFilter.connect(this.cPanner3D);
      this.cPanner3D.connect(this.cAnalyser);
      this.cAnalyser.connect(this.masterGain);
    }

    // Connect to ancient chamber reflection network
    if (this.chamberDelayNode) {
      this.aAnalyser.connect(this.chamberDelayNode);
      this.bAnalyser.connect(this.chamberDelayNode);
      this.cAnalyser.connect(this.chamberDelayNode);
    }
  }

  public stop(): void {
    if (!this.isRunning || !this.ctx) return;

    const t = this.ctx.currentTime;
    try {
      if (this.aGainNode) {
        this.aGainNode.gain.cancelScheduledValues(t);
        this.aGainNode.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      }
      if (this.bGainNode) {
        this.bGainNode.gain.cancelScheduledValues(t);
        this.bGainNode.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      }
      if (this.cGainNode) {
        this.cGainNode.gain.cancelScheduledValues(t);
        this.cGainNode.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      }

      window.setTimeout(() => {
        try {
          this.aOsc?.stop();
          this.bOsc?.stop();
          this.cOsc?.stop();
          this.aOsc?.disconnect();
          this.bOsc?.disconnect();
          this.cOsc?.disconnect();
          this.aGainNode?.disconnect();
          this.bGainNode?.disconnect();
          this.cGainNode?.disconnect();
          this.aPanner?.disconnect();
          this.bPanner?.disconnect();
          this.cPanner?.disconnect();
          this.aPanner3D?.disconnect();
          this.bPanner3D?.disconnect();
          this.aAirFilter?.disconnect();
          this.bAirFilter?.disconnect();
          this.cAirFilter?.disconnect();
          this.infrasoundOsc?.stop();
          this.infrasoundOsc?.disconnect();
          this.infrasoundGain?.disconnect();
          this.chamberDelayNode?.disconnect();
          this.chamberFeedbackGain?.disconnect();
          this.chamberReverbGain?.disconnect();
          this.aAnalyser?.disconnect();
          this.bAnalyser?.disconnect();
          this.cAnalyser?.disconnect();
          this.masterGain?.disconnect();
        } catch {
          // ignore
        }
        this.isRunning = false;
      }, 60);
    } catch {
      this.isRunning = false;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public updateConfig(newConfig: Partial<TrinauralConfig>): void {
    const prevSpatialMode = this.config.spatialMode;
    this.config = { ...this.config, ...newConfig };

    if (!this.ctx || !this.isRunning) return;
    const t = this.ctx.currentTime;

    if (
      newConfig.aFreq !== undefined ||
      newConfig.aFineTune !== undefined ||
      newConfig.bFreq !== undefined ||
      newConfig.bFineTune !== undefined ||
      newConfig.cFreq !== undefined ||
      newConfig.cFineTune !== undefined
    ) {
      this.updateFrequencies(t);
    }

    if (
      newConfig.aWaveform !== undefined ||
      newConfig.bWaveform !== undefined ||
      newConfig.cWaveform !== undefined
    ) {
      this.updateWaveforms();
    }

    if (
      newConfig.masterVolume !== undefined ||
      newConfig.aGain !== undefined ||
      newConfig.bGain !== undefined ||
      newConfig.cGain !== undefined ||
      newConfig.aMuted !== undefined ||
      newConfig.bMuted !== undefined ||
      newConfig.cMuted !== undefined
    ) {
      this.updateGains(t);
    }

    if (
      newConfig.aPos !== undefined ||
      newConfig.bPos !== undefined ||
      newConfig.cPos !== undefined
    ) {
      this.updateSpatialPositions(t);
    }

    if (newConfig.spatialMode !== undefined && newConfig.spatialMode !== prevSpatialMode) {
      this.connectRouting();
    }

    if (newConfig.chamberReverb !== undefined && this.chamberReverbGain) {
      this.chamberReverbGain.gain.cancelScheduledValues(t);
      this.chamberReverbGain.gain.linearRampToValueAtTime(newConfig.chamberReverb ? 0.35 : 0.0, t + 0.05);
    }

    if (newConfig.infrasoundActive !== undefined && this.infrasoundGain) {
      this.infrasoundGain.gain.cancelScheduledValues(t);
      this.infrasoundGain.gain.linearRampToValueAtTime(newConfig.infrasoundActive ? 0.15 : 0.0, t + 0.05);
    }
  }

  private updateFrequencies(t: number): void {
    if (!this.aOsc || !this.bOsc || !this.cOsc) return;

    const aTotal = Math.max(10, Math.min(2000, this.config.aFreq + this.config.aFineTune));
    const bTotal = Math.max(10, Math.min(2000, this.config.bFreq + this.config.bFineTune));
    const cTotal = Math.max(10, Math.min(2000, this.config.cFreq + this.config.cFineTune));

    this.aOsc.frequency.cancelScheduledValues(t);
    this.aOsc.frequency.linearRampToValueAtTime(aTotal, t + 0.03);

    this.bOsc.frequency.cancelScheduledValues(t);
    this.bOsc.frequency.linearRampToValueAtTime(bTotal, t + 0.03);

    this.cOsc.frequency.cancelScheduledValues(t);
    this.cOsc.frequency.linearRampToValueAtTime(cTotal, t + 0.03);
  }

  private updateWaveforms(): void {
    if (!this.aOsc || !this.bOsc || !this.cOsc) return;

    this.aOsc.type = this.config.aWaveform;
    this.bOsc.type = this.config.bWaveform;
    this.cOsc.type = this.config.cWaveform;
  }

  private updateGains(t: number): void {
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.config.masterVolume, t + 0.02);
    }

    if (this.aGainNode) {
      const target = this.config.aMuted ? 0.0 : this.config.aGain;
      this.aGainNode.gain.cancelScheduledValues(t);
      this.aGainNode.gain.linearRampToValueAtTime(target, t + 0.02);
    }

    if (this.bGainNode) {
      const target = this.config.bMuted ? 0.0 : this.config.bGain;
      this.bGainNode.gain.cancelScheduledValues(t);
      this.bGainNode.gain.linearRampToValueAtTime(target, t + 0.02);
    }

    if (this.cGainNode) {
      const target = this.config.cMuted ? 0.0 : this.config.cGain;
      this.cGainNode.gain.cancelScheduledValues(t);
      this.cGainNode.gain.linearRampToValueAtTime(target, t + 0.02);
    }
  }

  private updateSpatialPositions(t: number): void {
    if (!this.ctx) return;

    // Update 3D Panners
    if (this.aPanner3D) {
      this.aPanner3D.positionX.cancelScheduledValues(t);
      this.aPanner3D.positionY.cancelScheduledValues(t);
      this.aPanner3D.positionZ.cancelScheduledValues(t);
      this.aPanner3D.positionX.linearRampToValueAtTime(this.config.aPos.x, t + 0.05);
      this.aPanner3D.positionY.linearRampToValueAtTime(this.config.aPos.y, t + 0.05);
      this.aPanner3D.positionZ.linearRampToValueAtTime(this.config.aPos.z, t + 0.05);
    }

    if (this.bPanner3D) {
      this.bPanner3D.positionX.cancelScheduledValues(t);
      this.bPanner3D.positionY.cancelScheduledValues(t);
      this.bPanner3D.positionZ.cancelScheduledValues(t);
      this.bPanner3D.positionX.linearRampToValueAtTime(this.config.bPos.x, t + 0.05);
      this.bPanner3D.positionY.linearRampToValueAtTime(this.config.bPos.y, t + 0.05);
      this.bPanner3D.positionZ.linearRampToValueAtTime(this.config.bPos.z, t + 0.05);
    }

    if (this.cPanner3D) {
      this.cPanner3D.positionX.cancelScheduledValues(t);
      this.cPanner3D.positionY.cancelScheduledValues(t);
      this.cPanner3D.positionZ.cancelScheduledValues(t);
      this.cPanner3D.positionX.linearRampToValueAtTime(this.config.cPos.x, t + 0.05);
      this.cPanner3D.positionY.linearRampToValueAtTime(this.config.cPos.y, t + 0.05);
      this.cPanner3D.positionZ.linearRampToValueAtTime(this.config.cPos.z, t + 0.05);
    }

    // In trinaural-isolated mode, apply distance falloff
    if (this.config.spatialMode === 'trinaural-isolated' && this.aGainNode && this.bGainNode && this.cGainNode) {
      const aDist = Math.hypot(this.config.aPos.x, this.config.aPos.y, this.config.aPos.z);
      const bDist = Math.hypot(this.config.bPos.x, this.config.bPos.y, this.config.bPos.z);
      const cDist = Math.hypot(this.config.cPos.x, this.config.cPos.y, this.config.cPos.z);

      const aFactor = 1 / (1 + aDist * 0.08);
      const bFactor = 1 / (1 + bDist * 0.08);
      const cFactor = 1 / (1 + cDist * 0.08);

      const aTarget = (this.config.aMuted ? 0 : this.config.aGain) * aFactor;
      const bTarget = (this.config.bMuted ? 0 : this.config.bGain) * bFactor;
      const cTarget = (this.config.cMuted ? 0 : this.config.cGain) * cFactor;

      this.aGainNode.gain.cancelScheduledValues(t);
      this.aGainNode.gain.linearRampToValueAtTime(aTarget, t + 0.05);

      this.bGainNode.gain.cancelScheduledValues(t);
      this.bGainNode.gain.linearRampToValueAtTime(bTarget, t + 0.05);

      this.cGainNode.gain.cancelScheduledValues(t);
      this.cGainNode.gain.linearRampToValueAtTime(cTarget, t + 0.05);
    }

    // Syngen Atmospheric Air Absorption: roll off higher frequencies with distance
    const aDist = Math.hypot(this.config.aPos.x, this.config.aPos.y, this.config.aPos.z);
    const bDist = Math.hypot(this.config.bPos.x, this.config.bPos.y, this.config.bPos.z);
    const cDist = Math.hypot(this.config.cPos.x, this.config.cPos.y, this.config.cPos.z);

    if (this.aAirFilter) {
      const aCutoff = Math.max(1200, 20000 / (1 + aDist * 0.18));
      this.aAirFilter.frequency.cancelScheduledValues(t);
      this.aAirFilter.frequency.linearRampToValueAtTime(aCutoff, t + 0.05);
    }
    if (this.bAirFilter) {
      const bCutoff = Math.max(1200, 20000 / (1 + bDist * 0.18));
      this.bAirFilter.frequency.cancelScheduledValues(t);
      this.bAirFilter.frequency.linearRampToValueAtTime(bCutoff, t + 0.05);
    }
    if (this.cAirFilter) {
      const cCutoff = Math.max(1200, 20000 / (1 + cDist * 0.18));
      this.cAirFilter.frequency.cancelScheduledValues(t);
      this.cAirFilter.frequency.linearRampToValueAtTime(cCutoff, t + 0.05);
    }
  }

  // Real-time Visualizer Analysis helpers
  public getAFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.aAnalyser) this.aAnalyser.getByteFrequencyData(array);
  }

  public getBFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.bAnalyser) this.bAnalyser.getByteFrequencyData(array);
  }

  public getCFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.cAnalyser) this.cAnalyser.getByteFrequencyData(array);
  }

  public getATimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.aAnalyser) this.aAnalyser.getByteTimeDomainData(array);
  }

  public getBTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.bAnalyser) this.bAnalyser.getByteTimeDomainData(array);
  }

  public getCTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.cAnalyser) this.cAnalyser.getByteTimeDomainData(array);
  }

  public getMasterTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.masterAnalyser) this.masterAnalyser.getByteTimeDomainData(array);
  }

  /**
   * Syngen spatial acoustic RMS level (0.0 to 1.0) for live 3D wavefront emission
   */
  public getChannelLevel(channel: 'a' | 'b' | 'c'): number {
    if (!this.isRunning) return 0;
    const analyser = channel === 'a' ? this.aAnalyser : channel === 'b' ? this.bAnalyser : this.cAnalyser;
    if (!analyser) return 0;

    const data = new Uint8Array(128);
    analyser.getByteTimeDomainData(data);
    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const norm = (data[i] - 128) / 128;
      sumSquares += norm * norm;
    }
    const rms = Math.sqrt(sumSquares / data.length);
    return Math.min(1.0, rms * 2.2);
  }

  // Audio Recording
  public startRecording(): boolean {
    if (!this.mediaStreamDest || !this.isRunning) return false;

    try {
      this.recordedChunks = [];
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        this.mediaRecorder = new MediaRecorder(this.mediaStreamDest.stream);
      } else {
        this.mediaRecorder = new MediaRecorder(this.mediaStreamDest.stream, options);
      }

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start recording', err);
      return false;
    }
  }

  public stopRecording(): Blob | null {
    if (!this.mediaRecorder || !this.isRecording) return null;

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      return blob;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}
