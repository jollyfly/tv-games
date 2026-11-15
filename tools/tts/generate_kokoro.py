#!/usr/bin/env python3
"""Generate the game's Chinese narration with the open-source Kokoro TTS model.

Requirements (one-time):
  cd tools/tts
  uv venv --python 3.11 .venv
  uv pip install --python .venv/bin/python kokoro soundfile 'misaki[zh]'
  # A proxy may be needed to download the HuggingFace model:
  HHOME=... HF_HOME="$PWD/.hf-cache" .venv/bin/python generate_kokoro.py

The generated files are AAC/M4A (for Android WebView compatibility) in
web/public/audio. The Kokoro model itself is Apache-2.0; see LICENSES.md.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
import time
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parents[2]
CONTENT = json.loads((ROOT / "web/src/content.json").read_text(encoding="utf-8"))
AUDIO_DIR = ROOT / "web/public/audio-v3"
SAMPLE_RATE = 24000
DIGITS = {"0": "零", "1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "10": "十"}
VOICE_NAMES = {
    "zf_001": "晓晴（默认候选）",
    "zf_002": "候选 002",
    "zf_003": "候选 003",
    "zf_017": "候选 017",
    "zf_018": "候选 018",
    "zf_021": "候选 021",
    "zf_022": "候选 022",
}


def normalize_text(text: str) -> str:
    """Make mixed Chinese/number/English lines speak naturally in Kokoro zh.

    The TTS frontend reads the polyphonic character 数 as shù (noun) by default.
    Here the verb is pronounced shǔ (as in 数一数). We use a TTS-only homophone
    (属, also shǔ) so the displayed game copy stays unchanged while the audio
    gets the correct third tone. 数字/数量 keep their noun reading shù.
    """
    text = text.replace("OK", "确定键").replace("ok", "确定键")
    # TTS-only pronunciation fixes for the verb 数 (shǔ). Keep noun words intact.
    text = text.replace("数一数", "属一属")
    text = text.replace("数得", "属得")
    text = text.replace("一朵一朵数", "一朵一朵属")
    text = text.replace("慢慢数", "慢慢属")
    text = text.replace("这边数", "这边属")
    # Voice lines only use small integers; convert them to Chinese words for reliable G2P.
    text = re.sub(r"(?<![\d.])(10|[0-9])(?![\d.])", lambda match: DIGITS[match.group(1)], text)
    text = text.replace("–", "到").replace("-", "到")
    return text


def collect_lines() -> dict[str, str]:
    lines = dict(CONTENT["voices"])
    for level in CONTENT["levels"]:
        lines[f"intro-{level['id']}"] = level["intro"]
        for index, round_data in enumerate(level["rounds"], 1):
            lines[f"prompt-{level['id']}-{index}"] = round_data["prompt"]
    return {key: normalize_text(value) for key, value in lines.items()}


def trim_and_pad(audio: np.ndarray) -> np.ndarray:
    audio = np.asarray(audio, dtype=np.float32)
    peak = max(0.001, float(np.max(np.abs(audio))))
    audio = audio / peak * 0.72
    threshold = 0.006
    nonzero = np.where(np.abs(audio) > threshold)[0]
    if len(nonzero):
        audio = audio[max(0, nonzero[0] - 300): min(len(audio), nonzero[-1] + 1200)]
    fade = min(len(audio) // 2, 120)
    if fade > 0:
        audio[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
        audio[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    return np.concatenate([np.zeros(int(SAMPLE_RATE * 0.06), dtype=np.float32), audio, np.zeros(int(SAMPLE_RATE * 0.14), dtype=np.float32)])


def synthesize(pipe: KPipeline, text: str, voice: str, speed: float) -> np.ndarray:
    chunks: list[np.ndarray] = []
    for _graphemes, _phonemes, audio in pipe(text, voice=voice, speed=speed):
        if audio is not None and len(audio):
            chunks.append(np.asarray(audio, dtype=np.float32))
    if not chunks:
        raise RuntimeError("Kokoro produced no audio")
    # Keep a small breath between sentence chunks so long prompts do not feel rushed.
    silence = np.zeros(int(SAMPLE_RATE * 0.1), dtype=np.float32)
    joined = chunks[0]
    for chunk in chunks[1:]:
        joined = np.concatenate([joined, silence, chunk])
    return trim_and_pad(joined)


def write_m4a(audio: np.ndarray, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="number-island-tts-") as temp_dir:
        wav_path = Path(temp_dir) / "line.wav"
        sf.write(wav_path, audio, SAMPLE_RATE, subtype="PCM_16")
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", str(wav_path), str(destination)],
            check=True,
            capture_output=True,
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="zf_001")
    parser.add_argument("--speed", type=float, default=0.96)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", nargs="*", default=None, help="Optional voice IDs")
    args = parser.parse_args()

    lines = collect_lines()
    if args.only:
        lines = {key: value for key, value in lines.items() if key in set(args.only)}

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {key: {"text": text, "voice": args.voice, "speed": args.speed} for key, text in lines.items()}
    (ROOT / "tools/tts/kokoro-lines.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Loading Kokoro-82M-v1.1-zh on CPU, voice={args.voice}, speed={args.speed}", flush=True)
    pipe = KPipeline(lang_code="z", repo_id="hexgrad/Kokoro-82M-v1.1-zh", device="cpu")
    started = time.time()
    done = 0
    for index, (key, text) in enumerate(lines.items(), 1):
        destination = AUDIO_DIR / f"{key}.m4a"
        if destination.exists() and not args.force:
            print(f"[{index}/{len(lines)}] skip {key}", flush=True)
            done += 1
            continue
        try:
            audio = synthesize(pipe, text, args.voice, args.speed)
            write_m4a(audio, destination)
            done += 1
            print(f"[{index}/{len(lines)}] {key}: {len(audio)/SAMPLE_RATE:.2f}s", flush=True)
        except Exception as error:
            print(f"[{index}/{len(lines)}] FAILED {key}: {type(error).__name__}: {error}", flush=True)
    print(f"done: {done}/{len(lines)} in {time.time() - started:.1f}s -> {AUDIO_DIR}", flush=True)


if __name__ == "__main__":
    main()
