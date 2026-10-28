"""
29 Ekim story'si için özgün, 20 saniyelik marş müziği üretir (telifsiz, tamamen sentez).

120 BPM, 4/4, 10 ölçü (her ölçü 2 sn = videoda 60 kare). Re majör başlar,
8. ölçüde (14. sn) Mi majöre modüle olarak doruğa çıkar, 19.5. sn'de final vuruşu.

Kullanım: python3 scripts/generate-march.py  ->  public/cumhuriyet-marsi.wav
Gereksinim: numpy
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DURATION = 20.0
N = int(SR * DURATION)
rng = np.random.default_rng(1923)

out_l = np.zeros(N + SR * 3)
out_r = np.zeros(N + SR * 3)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, beat, gain=1.0, pan=0.0):
    start = int(beat * BEAT * SR)
    end = min(start + len(sig), len(out_l))
    sig = sig[: end - start] * gain
    out_l[start:end] += sig * np.sqrt(0.5 * (1 - pan))
    out_r[start:end] += sig * np.sqrt(0.5 * (1 + pan))


def fft_filter(x, lo=0.0, hi=SR / 2):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    mask = np.ones_like(f)
    if lo > 0:
        mask *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi < SR / 2:
        mask *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(spec * mask, len(x))


# ---------------------------------------------------------------- enstrümanlar

def brass(midi, dur, vel=1.0, bright=0.8, voices=3, detune=6, attack=0.035, release=0.16):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    env = np.clip(t / attack, 0, 1) ** 1.5 * (0.78 + 0.22 * np.exp(-t / 0.15))
    env *= np.where(t > dur, np.clip(1 - (t - dur) / release, 0, 1), 1.0)
    b = bright * (0.72 + 0.28 * np.exp(-t / 0.1)) * np.sqrt(env + 1e-9) * vel ** 0.3
    f0 = hz(midi)
    sig = np.zeros(n)
    kmax = int(min(22, 15000 / f0))
    for v in range(voices):
        cents = detune * (v - (voices - 1) / 2)
        depth = 0.0045 * np.clip((t - 0.22) / 0.4, 0, 1)
        f = f0 * 2 ** (cents / 1200) * (1 - 0.02 * np.exp(-t / 0.03))
        f = f * (1 + depth * np.sin(2 * np.pi * 5.3 * t + rng.uniform(0, 6.28)))
        ph = 2 * np.pi * np.cumsum(f) / SR
        for k in range(1, kmax + 1):
            sig += (b ** ((k - 1) * 0.9)) / k * np.sin(k * ph + rng.uniform(0, 6.28))
    return sig * env * vel / voices


def strings(midi, dur, vel=1.0, attack=0.18, release=0.45, tremolo=False, voices=4):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    env = np.clip(t / attack, 0, 1) ** 2
    env *= np.where(t > dur, np.clip(1 - (t - dur) / release, 0, 1), 1.0)
    if tremolo:
        env *= 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t))
    f0 = hz(midi)
    sig = np.zeros(n)
    kmax = int(min(14, 12000 / f0))
    for v in range(voices):
        cents = 9 * (v - (voices - 1) / 2)
        f = f0 * 2 ** (cents / 1200) * (1 + 0.003 * np.sin(2 * np.pi * 5.8 * t + rng.uniform(0, 6.28)))
        ph = 2 * np.pi * np.cumsum(f) / SR
        for k in range(1, kmax + 1):
            sig += 0.82 ** (k - 1) / k * np.sin(k * ph + rng.uniform(0, 6.28))
    return sig * env * vel / voices


def snare(vel=1.0, decay=0.07):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), 1200, 9000)
    noise /= np.max(np.abs(noise)) + 1e-9
    body = 0.6 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03) + 0.3 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.02)
    return (noise * np.exp(-t / decay) * 0.9 + body) * vel


def bass_drum(vel=1.0):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 48 + 30 * np.exp(-t / 0.05)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    thump = fft_filter(rng.standard_normal(n), 0, 250) * np.exp(-t / 0.04)
    thump /= np.max(np.abs(thump)) + 1e-9
    return (tone + 0.4 * thump) * vel


def timpani(midi, vel=1.0):
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    f0 = hz(midi) * (1 + 0.01 * np.exp(-t / 0.05))
    sig = np.zeros(n)
    for ratio, amp, dec in [(1.0, 1, 1.5), (1.5, 0.6, 1.0), (1.99, 0.35, 0.7), (2.44, 0.2, 0.5), (2.96, 0.1, 0.35)]:
        sig += amp * np.sin(2 * np.pi * np.cumsum(f0 * ratio) / SR) * np.exp(-t / dec)
    thump = fft_filter(rng.standard_normal(n), 0, 900) * np.exp(-t / 0.025)
    thump /= np.max(np.abs(thump)) + 1e-9
    return (sig * 0.8 + 0.5 * thump) * vel


def cymbal(vel=1.0, decay=1.1, length=3.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), 3500, 16000)
    noise /= np.max(np.abs(noise)) + 1e-9
    metal = np.zeros(n)
    for _ in range(36):
        metal += np.sin(2 * np.pi * rng.uniform(3000, 11000) * t + rng.uniform(0, 6.28)) * np.exp(-t / rng.uniform(0.4, 1.4))
    metal /= 36
    env = np.exp(-t / decay) * (0.6 + 0.4 * np.exp(-t / 0.05))
    return (noise * 0.8 + metal * 1.5) * env * vel


def whoosh(dur=0.5):
    # carousel geçişleri için hava sesi: alçaktan tize kayan filtreli gürültü
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    noise = rng.standard_normal(n)
    sig = np.zeros(n)
    for (lo, hi), w in zip([(200, 800), (800, 2500), (2500, 7000)], [1 - u, 1 - np.abs(2 * u - 1), u]):
        band = fft_filter(noise, lo, hi)
        sig += band / (np.max(np.abs(band)) + 1e-9) * np.clip(w, 0, 1)
    env = np.where(u < 0.75, (u / 0.75) ** 2, np.exp(-(u - 0.75) / 0.06))
    return sig * env


# ---------------------------------------------------------------- armoni

MAJ, MIN, DOM7 = (0, 4, 7), (0, 3, 7), (0, 4, 7, 10)
D, E, G, A, B = 62, 64, 67, 69, 71
CHORDS = [  # (başlangıç vuruşu, bitiş, kök, yapı)
    (0, 4, A, (0, 7)),
    (4, 8, D, MAJ), (8, 10, G, MAJ), (10, 12, A, MAJ),
    (12, 16, D, MAJ), (16, 20, G, MAJ), (20, 22, D, MAJ), (22, 24, A, MAJ),
    (24, 26, B, MIN), (26, 28, B, DOM7),
    (28, 32, E, MAJ), (32, 34, A, MAJ), (34, 36, B, DOM7),
    (36, 40, E, MAJ),
]


def chord_at(beat):
    for s, e, root, q in CHORDS:
        if s <= beat < e:
            return root, q
    return CHORDS[-1][2], CHORDS[-1][3]


def voicing(root, q, lo=55, hi=74):
    pcs = {(root + i) % 12 for i in q}
    return [m for m in range(lo, hi + 1) if m % 12 in pcs]


def bass_note(root, fifth=False):
    m = root + (7 if fifth else 0)
    while m > 47:
        m -= 12
    while m < 36:
        m += 12
    return m


MELODY = [
    (3.0, 0.3, 57), (3.333, 0.3, 57), (3.667, 0.3, 57),
    (4, 1.5, 62), (5.5, 0.5, 66), (6, 1.5, 69), (7.5, 0.5, 74),
    (8, 0.75, 71), (8.75, 0.25, 69), (9, 1, 67), (10, 0.75, 69), (10.75, 0.25, 71), (11, 1, 73),
    (12, 2, 74), (14, 1, 69), (15, 1, 66),
    (16, 1, 67), (17, 1, 71), (18, 1.5, 74), (19.5, 0.5, 71),
    (20, 1, 69), (21, 0.75, 66), (21.75, 0.25, 67), (22, 1, 69), (23, 1, 64),
    (24, 1, 66), (25, 1, 71), (26, 0.333, 71), (26.333, 0.333, 71), (26.667, 0.333, 71), (27, 0.5, 75), (27.5, 0.5, 78),
    (28, 1.5, 76), (29.5, 0.5, 71), (30, 0.75, 76), (30.75, 0.25, 78), (31, 1, 80),
    (32, 1, 81), (33, 1, 76), (34, 1, 78), (35, 0.5, 75), (35.5, 0.5, 78),
    (36, 2.9, 76),
]

# ---------------------------------------------------------------- düzenleme

# 1. ölçü: dominant pedal üzerinde kreşendo (yaylı tremolo + timpani ve trampet rulosu)
for m in (45, 57, 64, 69):
    place(strings(m, 2.0, tremolo=True) * np.linspace(0.15, 1, int(2.45 * SR)), 0, 0.16, pan=-0.3 if m < 60 else 0.3)
for i, b in enumerate(np.arange(0, 3.0, 0.14)):
    place(timpani(45, 0.15 + 0.6 * b / 3), b, 0.35, pan=-0.25)
for b in np.arange(1.0, 4.0, 0.125):
    place(snare(0.1 + 0.9 * ((b - 1) / 3) ** 1.6, decay=0.045), b + rng.uniform(-0.01, 0.01), 0.3)

# melodi: trompetler + bir oktav aşağıda kornolar, doruğa doğru üst ses armonisi
for b, dur, m in MELODY:
    vel = 1.0 if b >= 28 else 0.88
    art = dur * (0.92 if dur > 0.4 else 0.75)
    place(brass(m, art * BEAT, vel, bright=0.85), b, 0.34, pan=0.15)
    horn = m - 12 if m - 12 >= 52 else m
    place(brass(horn, art * BEAT, vel, bright=0.55, detune=8), b, 0.22, pan=-0.2)
    if b >= 12:
        root, q = chord_at(b)
        below = [c for c in voicing(root, q, 50, 90) if c <= m - 3]
        if below:
            place(brass(below[-1], art * BEAT, vel * 0.8, bright=0.75), b, 0.18, pan=0.3)

# akorlar: 2-3. ölçü tutulan, 4-9. ölçü marş "um-pa", son ölçü tutulan + final vuruşu
for s, e, root, q in CHORDS:
    if s == 0:
        continue
    vs = voicing(root, q)
    if s < 12 or s >= 36:
        length = (e - s - (1.0 if s >= 36 else 0.1)) * BEAT
        for m in vs:
            place(brass(m, length, 0.75, bright=0.6, attack=0.06), s, 0.12)
        place(brass(bass_note(root), length, 0.9, bright=0.45), s, 0.3)
        place(brass(bass_note(root) - 12 if bass_note(root) >= 48 else bass_note(root), length, 0.8, bright=0.35), s, 0.2)
    else:
        for b in np.arange(s, e, 1.0):
            place(brass(bass_note(root, fifth=(b % 2 == 1)), 0.35 * BEAT, 0.95, bright=0.5), b, 0.32)
            for m in vs:
                place(brass(m, 0.22 * BEAT, 0.7, bright=0.65, attack=0.02), b + 0.5, 0.1)
    for m in voicing(root, q, 62, 86):
        place(strings(m, (e - s) * BEAT, 0.9), s, 0.07, pan=rng.uniform(-0.6, 0.6))

# B7 üzerinde Mi majöre yükselen yaylı koşusu
run = [71, 73, 75, 76, 78, 80, 81, 83, 85, 87, 88, 90, 92, 93, 95, 97]
for i, m in enumerate(run[:8]):
    place(strings(m - 12, 0.12, 0.9, attack=0.01, release=0.15, voices=3), 26 + i * 0.25, 0.12, pan=0.35)

# trampet: marş ritmi + ölçü geçişlerinde rulo
for bar_start in range(12, 36, 4):
    for beat in range(bar_start, bar_start + 4):
        place(snare(1.0), beat, 0.32)
        place(snare(0.55), beat + 0.5, 0.32)
        place(snare(0.45), beat + 0.75, 0.32)
for b in np.arange(26, 28, 0.125):
    place(snare(0.3 + 0.7 * (b - 26) / 2, decay=0.045), b, 0.3)
for b in np.arange(35, 36, 0.125):
    place(snare(0.4 + 0.6 * (b - 35), decay=0.045), b, 0.3)
for b in np.arange(36, 39, 0.125):
    place(snare(0.25 + 0.75 * ((b - 36) / 3) ** 2, decay=0.045), b, 0.3)
for b in (4, 6, 8, 10, 11, 11.5):
    place(snare(1.0), b, 0.35)

# davul, timpani, ziller
for b in list(range(12, 36, 2)) + [4, 8, 39]:
    place(bass_drum(1.0 if b in (4, 12, 28, 39) else 0.75), b, 0.35)
for b, m, v in [(4, 38, 1), (6, 33, 0.8), (8, 43, 0.85), (10, 45, 0.85), (11, 45, 0.7), (11.5, 45, 0.8),
                (12, 38, 1), (16, 43, 0.8), (20, 38, 0.8), (22, 45, 0.8), (24, 47, 0.8), (26, 47, 0.9),
                (28, 40, 1), (32, 45, 0.9), (34, 47, 0.9), (36, 40, 1), (39, 40, 1)]:
    place(timpani(m, v), b, 0.38, pan=-0.25)
for b in np.arange(36.3, 39, 0.11):
    place(timpani(40, 0.2 + 0.6 * (b - 36) / 3), b, 0.3, pan=-0.25)
for b in (4, 12, 28, 36, 39):
    place(cymbal(1.0), b, 0.22, pan=0.2)
for b in range(29, 36, 2):
    place(cymbal(0.6, decay=0.25, length=0.8), b, 0.18, pan=0.2)

# video geçişlerine oturan whoosh'lar (carousel whip'leri + finale dalış)
for b in (8, 12, 16, 20, 24):
    place(whoosh(0.5), b - 0.75, 0.16, pan=0.0)
place(whoosh(1.0), 26.9, 0.2)

# final tutti vuruşu
for m in voicing(E, MAJ, 52, 88):
    place(brass(m, 0.3 * BEAT, 1.0, bright=0.9, attack=0.015), 39, 0.13)
place(brass(40, 0.3 * BEAT, 1.0, bright=0.5), 39, 0.4)

# ---------------------------------------------------------------- reverb + mastering


def impulse_response(seed):
    r = np.random.default_rng(seed)
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    ir = np.zeros(n)
    for lo, hi, tau in [(0, 1000, 0.3), (1000, 4000, 0.2), (4000, SR / 2, 0.1)]:
        ir += fft_filter(r.standard_normal(n), lo, hi) * np.exp(-t / tau)
    ir[: int(0.02 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


def convolve(x, ir):
    size = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]


wet_l = convolve(fft_filter(out_l, 200), impulse_response(1))
wet_r = convolve(fft_filter(out_r, 200), impulse_response(2))
mix = np.stack([out_l + 0.32 * wet_l, out_r + 0.32 * wet_r])[:, :N]

# master EQ: 30 Hz altını kes, 120 Hz altını ~5 dB bastır, 2.5 kHz civarına bakır parlaklığı ekle
spec = np.fft.rfft(mix, axis=1)
f = np.maximum(np.fft.rfftfreq(N, 1 / SR), 1)
spec *= 1 / (1 + (30 / f) ** 4) * (0.55 + 0.45 / (1 + (120 / f) ** 2))
spec *= 1 + 0.8 / (1 + (np.log2(f / 2500) / 1.2) ** 2)
mix = np.fft.irfft(spec, N, axis=1)

# yumuşak bus kompresör
power = np.mean(mix ** 2, axis=0)
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(power, np.ones(win) / win, mode="same") + 1e-12)
thr = np.percentile(rms, 70)
gain = np.minimum(1.0, (thr / rms) ** (1 - 1 / 2.5))
gain = np.convolve(gain, np.ones(win) / win, mode="same")
mix *= gain
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) / np.tanh(1.3)

fade_in = np.clip(np.arange(N) / (0.01 * SR), 0, 1)
fade_out = np.clip((DURATION - np.arange(N) / SR) / 0.35, 0, 1)
mix *= fade_in * fade_out
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

out = os.path.join(os.path.dirname(__file__), "..", "public", "cumhuriyet-marsi.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print("yazıldı:", os.path.normpath(out))
