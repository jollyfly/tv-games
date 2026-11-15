#!/usr/bin/env python3
"""Verify every micro-level audio file and write a text/audio hash manifest."""
import hashlib
import json
import subprocess
from typing import Optional
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = json.loads((ROOT / "web/src/content.json").read_text(encoding="utf-8"))
AUDIO = ROOT / "web/public/audio-v4"
OUT = ROOT / "docs/voice-audio-manifest.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def duration(path: Path) -> Optional[float]:
    try:
        text = subprocess.check_output(["afinfo", str(path)], text=True, stderr=subprocess.DEVNULL)
        for line in text.splitlines():
            if "estimated duration" in line:
                return float(line.split(":")[-1].strip().split()[0])
    except Exception:
        return None
    return None


rows = []
for level in CONTENT["levels"]:
    key = f"micro-{level['id']}"
    text = CONTENT["voices"].get(key)
    audio = AUDIO / f"{key}.m4a"
    row = {"id": level["id"], "key": key, "text": text, "textSha256": hashlib.sha256((text or "").encode()).hexdigest(), "audio": audio.name, "audioExists": audio.exists()}
    if audio.exists():
        row["audioBytes"] = audio.stat().st_size
        row["audioSha256"] = sha(audio)
        row["durationSeconds"] = duration(audio)
    rows.append(row)
OUT.write_text(json.dumps({"levels": rows, "count": len(rows)}, ensure_ascii=False, indent=2), encoding="utf-8")
missing = [r["id"] for r in rows if not r["audioExists"]]
print(f"manifest {OUT}: {len(rows)} levels, missing {len(missing)}")
if missing:
    print("missing:", ", ".join(missing))
    raise SystemExit(1)
