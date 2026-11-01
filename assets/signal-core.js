/* Schematic ECG illustrations for a recognition game, not diagnostic recordings. */
(function (root) {
  'use strict';
  const cases = [
    { id: 'normal', label: 'Normal sinus rhythm', description: 'Regularly spaced narrow complexes, each preceded by a visible P wave; the ST segment follows the reference baseline.', explanation: 'Regular R–R intervals, a P wave before every narrow QRS complex, and an ST segment at the reference baseline.', source: 'https://www.msdmanuals.com/professional/cardiovascular-disorders/cardiovascular-tests-and-procedures/electrocardiography' },
    { id: 'elevation', label: 'ST elevation', description: 'Regular narrow complexes with a clearly raised, flat segment after each QRS, above the dashed reference baseline.', explanation: 'The ST segment is visibly above the dashed isoelectric reference. ST elevation is a finding with multiple causes; this illustration does not establish a heart-attack diagnosis.', source: 'https://www.ncbi.nlm.nih.gov/books/NBK459364/' },
    { id: 'depression', label: 'ST depression', description: 'Regular narrow complexes with a clearly lowered, flat segment after each QRS, below the dashed reference baseline.', explanation: 'The ST segment is visibly below the dashed isoelectric reference. This is a schematic ST-segment finding, not a diagnosis of its cause.', source: 'https://www.ncbi.nlm.nih.gov/books/NBK459364/' },
    { id: 'afib', label: 'Atrial fibrillation (AFib)', description: 'Narrow complexes with irregularly irregular spacing, no discrete P waves, and a fine irregular baseline.', explanation: 'Irregularly irregular R–R intervals, absent discrete P waves, and fine fibrillatory activity illustrate AFib. The narrow complexes are intentional in this example.', source: 'https://jamanetwork.com/journals/jama/article-abstract/2748482' },
    { id: 'vt', label: 'Ventricular tachycardia (VT)', description: 'A rapid regular sequence of broad, uniform complexes, with no consistent preceding P waves.', explanation: 'This schematic represents monomorphic VT: rapid, regular, broad complexes. A real wide-complex tachycardia can have other causes; width and rate alone do not prove VT.', source: 'https://www.merckmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/ventricular-tachycardia-vt' }
  ];
  const normalTimes = [.45, 1.25, 2.05, 2.85, 3.65];
  function interpolate(nodes, time) {
    if (time < nodes[0][0] || time > nodes[nodes.length - 1][0]) return 0;
    for (let i = 1; i < nodes.length; i++) {
      if (time <= nodes[i][0]) {
        const a = nodes[i - 1], b = nodes[i];
        return a[1] + (b[1] - a[1]) * (time - a[0]) / (b[0] - a[0]);
      }
    }
    return 0;
  }
  function makeTrace(id) {
    if (!cases.some(item => item.id === id)) throw new Error('Unknown ECG illustration');
    const vt = id === 'vt', afib = id === 'afib';
    const st = id === 'elevation' ? .28 : id === 'depression' ? -.22 : 0;
    const beats = vt ? Array.from({ length: 12 }, (_, i) => .23 + i / 3) : afib ? [.36, .92, 1.73, 2.15, 2.83, 3.70] : normalTimes.slice();
    const p = afib ? [] : [[-.25, 0], [-.21, .07], [-.18, .13], [-.15, .07], [-.12, 0]];
    const qrs = [[-.04, 0], [-.025, -.13], [0, 1], [.025, -.25], [.055, st], [.17, st], [.22, .17 + st * .4], [.27, .28 + st * .25], [.33, .17], [.39, 0]];
    const broad = [[-.08, 0], [-.06, -.12], [-.015, .4], [.015, 1.05], [.07, .35], [.10, 0], [.15, -.30], [.22, 0]];
    function sample(t) {
      let value = afib ? .018 * Math.sin(2 * Math.PI * 6.7 * t) + .012 * Math.sin(2 * Math.PI * 9.3 * t + .7) + .008 * Math.sin(2 * Math.PI * 13.1 * t + 1.4) : 0;
      for (const beat of beats) {
        value += interpolate(vt ? broad : qrs, t - beat);
        if (!vt && !afib) value += interpolate(p, t - beat);
      }
      return value;
    }
    return { id, duration: 4, beats, st, qrsDuration: vt ? .18 : .095, hasP: !vt && !afib, sample, values: Array.from({ length: 1601 }, (_, i) => sample(4 * i / 1600)) };
  }
  class SignalGame {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset() {
      this.deck = cases.slice();
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
      this.index = 0; this.score = 0; this.selected = null;
    }
    get current() { return this.deck[this.index]; }
    get trace() { return makeTrace(this.current.id); }
    get completed() { return this.index === this.deck.length - 1 && this.selected !== null; }
    answer(id) {
      if (this.selected !== null || !cases.some(item => item.id === id)) return false;
      this.selected = id;
      if (id === this.current.id) this.score++;
      return true;
    }
    next() {
      if (this.selected === null) return false;
      if (this.completed) this.reset();
      else { this.index++; this.selected = null; }
      return true;
    }
  }
  SignalGame.cases = cases;
  SignalGame.makeTrace = makeTrace;
  if (typeof module !== 'undefined' && module.exports) module.exports = SignalGame;
  else root.SignalGame = SignalGame;
})(typeof globalThis !== 'undefined' ? globalThis : this);
