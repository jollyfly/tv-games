#!/usr/bin/env python3
"""Generate the game's Mandarin narration with CosyVoice3 (zero-shot voice).

This is an offline, local inference script. It uses the native Mandarin reference
voice shipped with the CosyVoice repository and the CosyVoice3 pinyin-capable
model. The generated audio is what ships in the APK; model weights do not.

Setup (macOS Apple Silicon, Python 3.10):
  git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git /tmp/CosyVoice
  # use tools/tts/.venv-cosy and the model in
  # /tmp/CosyVoice/pretrained_models/Fun-CosyVoice3-0.5B
  COSY_REPO=/tmp/CosyVoice .venv-cosy/bin/python generate_cosyvoice.py --force
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import numpy as np
import torch
import torchaudio

ROOT = Path(__file__).resolve().parents[2]
CONTENT = json.loads((ROOT / "web/src/content.json").read_text(encoding="utf-8"))
SAMPLE_RATE = 24000
DIGITS = {"0": "零", "1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "10": "十"}


def normalize_text(text: str) -> str:
    """TTS-only text normalization, never changes the displayed game copy.

    CosyVoice3 has a stronger native Mandarin frontend than Kokoro, but the
    verb 数 is still ambiguous. We use the TTS-only homophone 属 (shǔ) for the
    verb and keep 数字/数量 (shù) intact. Numbers are normalized to Chinese
    characters so the model does not switch to an English-style reading.
    """
    text = text.replace("OK", "确定键").replace("ok", "确定键")
    text = text.replace("数一数", "属一属")
    text = text.replace("数得", "属得")
    text = text.replace("一朵一朵数", "一朵一朵属")
    text = text.replace("慢慢数", "慢慢属")
    text = text.replace("这边数", "这边属")
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
    audio = np.asarray(audio, dtype=np.float32).reshape(-1)
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


def write_m4a(audio: np.ndarray, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="number-island-cosy-") as temp_dir:
        wav_path = Path(temp_dir) / "line.wav"
        # CosyVoice returns float32 tensors; write PCM16 WAV then convert to AAC.
        import soundfile as sf
        sf.write(wav_path, audio, SAMPLE_RATE, subtype="PCM_16")
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", str(wav_path), str(destination)],
            check=True,
            capture_output=True,
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cosy-repo", default="/tmp/CosyVoice")
    parser.add_argument("--model-dir", default="")
    parser.add_argument("--audio-dir", default="web/public/audio-v4")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", nargs="*", default=None)
    parser.add_argument("--style", choices=["natural", "warm"], default="natural")
    parser.add_argument("--speed", type=float, default=0.96)
    args = parser.parse_args()

    repo = Path(args.cosy_repo)
    model_dir = Path(args.model_dir) if args.model_dir else repo / "pretrained_models/Fun-CosyVoice3-0.5B"
    prompt_wav = repo / "asset/zero_shot_prompt.wav"
    prompt_text = "You are a helpful assistant.<|endofprompt|>希望你以后能够做的比我还好呦。"
    warm_instruct = "You are a helpful assistant. 请用温柔、活泼、亲切的语气，像幼儿园老师给小朋友讲故事。<|endofprompt|>"

    if not (repo / "cosyvoice").exists():
        raise SystemExit(f"CosyVoice repo not found: {repo}")
    if not model_dir.exists():
        raise SystemExit(f"CosyVoice model not found: {model_dir}")
    sys.path.insert(0, str(repo))
    sys.path.append(str(repo / "third_party/Matcha-TTS"))
    from cosyvoice.cli.cosyvoice import AutoModel

    lines = collect_lines()
    if args.only:
        lines = {key: value for key, value in lines.items() if key in set(args.only)}
    audio_dir = ROOT / args.audio_dir
    audio_dir.mkdir(parents=True, exist_ok=True)
    manifest = {key: {"text": text, "style": args.style, "speed": args.speed, "prompt": str(prompt_wav)} for key, text in lines.items()}
    (ROOT / "tools/tts/cosy-lines.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"loading CosyVoice3 from {model_dir}", flush=True)
    cosy = AutoModel(model_dir=str(model_dir))
    print(f"loaded; sample_rate={cosy.sample_rate}; style={args.style}; lines={len(lines)}", flush=True)
    started = time.time()
    done = 0
    for index, (key, text) in enumerate(lines.items(), 1):
        destination = audio_dir / f"{key}.m4a"
        if destination.exists() and not args.force:
            print(f"[{index}/{len(lines)}] skip {key}", flush=True)
            done += 1
            continue
        try:
            begin = time.time()
            chunks = []
            if args.style == "warm":
                generator = cosy.inference_instruct2(text, warm_instruct, str(prompt_wav), stream=False, speed=args.speed)
            else:
                generator = cosy.inference_zero_shot(text, prompt_text, str(prompt_wav), stream=False, speed=args.speed)
            for _i, item in enumerate(generator):
                chunks.append(item["tts_speech"])
            if not chunks:
                raise RuntimeError("model produced no audio")
            audio = torch.cat(chunks, dim=1).cpu().numpy().reshape(-1)
            if cosy.sample_rate != SAMPLE_RATE:
                import librosa
                audio = librosa.resample(audio, orig_sr=cosy.sample_rate, target_sr=SAMPLE_RATE)
            write_m4a(trim_and_pad(audio), destination)
            done += 1
            print(f"[{index}/{len(lines)}] {key}: {len(audio)/cosy.sample_rate:.2f}s ({time.time()-begin:.1f}s)", flush=True)
        except Exception as error:
            print(f"[{index}/{len(lines)}] FAILED {key}: {type(error).__name__}: {error}", flush=True)
    print(f"done: {done}/{len(lines)} in {time.time()-started:.1f}s -> {audio_dir}", flush=True)


if __name__ == "__main__":
    main()
