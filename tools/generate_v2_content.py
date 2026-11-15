#!/usr/bin/env python3
"""Build the 10-world / 100-level v2 content from the current 25 handcrafted levels."""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/src/content.json"
rng = random.Random(20261114)

WORLD_CONFIG = [
    ("forest", "青芽森林", "squirrel", "果果", "flower", "数感启蒙", "第 1–10 关"),
    ("candy", "糖果镇", "bear", "糖糖", "candy", "数量与分配", "第 11–20 关"),
    ("castle", "星光城堡", "owl", "星宝", "star", "规律与序数", "第 21–30 关"),
    ("sky", "云上天空", "firefly", "萤萤", "star", "观察与目标", "第 31–40 关"),
    ("ocean", "海底奇遇", "turtle", "小龟", "fish", "分类与数量", "第 41–50 关"),
    ("dino", "恐龙化石谷", "dino", "小恐龙隆隆", "fossil", "大小、配对、排除", "第 51–60 关"),
    ("space", "星际数字站", "firefly", "星仔", "planet", "坐标与序列", "第 61–70 关"),
    ("music", "音乐泡泡镇", "owl", "哆哆", "note", "节奏与序数", "第 71–80 关"),
    ("donut", "甜甜圈工厂", "bear", "糖糖", "donut", "等分与组合", "第 81–90 关"),
    ("magic", "魔法花园", "fox", "点点", "star", "变换与逻辑", "第 91–100 关"),
]
WORLDS = {w[0]: {"name": w[1], "guardian": w[2], "guardianName": w[3], "object": w[4], "skill": w[5], "range": w[6]} for w in WORLD_CONFIG}
TITLES = {
    "forest": ["种子数一数", "花圃里的数字", "小桥数字", "哪边花更多", "叶子规律", "花园数一数", "一篮草莓", "树根数字迷宫", "多一朵少一朵", "森林星光小路"],
    "candy": ["糖果罐", "装糖果", "糖果小火车", "哪条传送带更多", "糖纸规律", "糖果工厂", "一盒糖果", "糖果迷宫", "糖果数量关系", "糖果镇夜灯"],
    "castle": ["城门数字", "星星的数量", "数字台阶", "哪边星星更多", "星光规律", "谁排在前面", "塔内小路", "多一颗少一颗", "塔顶数字迷宫", "星光城堡庆典"],
    "sky": ["云朵数一数", "云朵星星罐", "云上数字桥", "哪片云更多", "飞机大战", "云朵星星罐", "云上规律", "云朵数字迷宫", "数字云朵变魔术", "星光灯塔"],
    "ocean": ["数字捕鱼", "海星数一数", "珍珠宝盒", "海底规律", "珊瑚数字迷宫", "哪边鱼多", "潜水艇路线", "数字泡泡变魔术", "水母数字灯", "珍珠宫迷宫"],
    "dino": ["恐龙蛋数一数", "化石配对", "小小考古队", "哪堆骨头更多", "恐龙脚印规律", "恐龙蛋数量", "化石层数", "火山数字小路", "多一块少一块", "恐龙谷之夜"],
    "space": ["星球数一数", "太空舱数量", "火箭倒计时", "哪边星球更多", "星图规律", "舱门密码", "燃料舱数量", "星门坐标", "多一颗少一颗", "星际数字站"],
    "music": ["音符数一数", "泡泡数量", "节拍排队", "第几个音符", "节拍规律", "哪边泡泡更多", "小鼓手数字", "一段新旋律", "多一拍少一拍", "音乐泡泡庆典"],
    "donut": ["甜甜圈数一数", "装盒订单", "哪边更多", "糖霜规律", "平分甜甜圈", "工厂数字", "订单数量", "多一个少一个", "甜甜圈迷宫", "工厂夜班"],
    "magic": ["花园数一数", "魔法材料", "数字咒语", "哪边光更多", "魔法规律", "变形数字", "多一个少一个", "镜面花园", "花园迷宫", "魔法花园庆典"],
}
KIND_SKILL = {"odd": "观察与分类", "coord": "坐标与空间", "share": "等分与公平", "count": "点数与基数", "quantity": "数字→数量", "sequence": "数字顺序", "compare": "比较多少", "pattern": "规律", "ordinal": "序数", "maze": "数字迷宫", "plane": "目标识别", "relation": "数量关系"}
OBJECT_NAMES = {"flower": "朵花", "candy": "颗糖", "star": "颗星星", "fish": "条小鱼", "pearl": "颗珍珠", "starfish": "只海星", "fossil": "块化石", "planet": "颗星球", "note": "个音符", "donut": "个甜甜圈"}
PLANS = {
    "forest": [("existing", "forest-1"), ("existing", "forest-2"), ("existing", "forest-3"), ("kind", "compare"), ("kind", "pattern"), ("kind", "count"), ("kind", "quantity"), ("kind", "maze3"), ("kind", "relation"), ("kind", "maze5")],
    "candy": [("existing", "candy-1"), ("existing", "candy-2"), ("existing", "candy-3"), ("kind", "compare"), ("kind", "pattern"), ("kind", "quantity"), ("kind", "count"), ("kind", "maze3"), ("kind", "relation"), ("kind", "maze5")],
    "castle": [("kind", "count"), ("kind", "quantity"), ("kind", "sequence"), ("existing", "castle-1"), ("existing", "castle-2"), ("existing", "castle-3"), ("kind", "maze3"), ("kind", "relation"), ("kind", "maze5"), ("kind", "pattern")],
    "sky": [("kind", "count"), ("kind", "quantity"), ("kind", "sequence"), ("kind", "compare"), ("existing", "sky-1"), ("existing", "sky-2"), ("existing", "sky-3"), ("existing", "sky-4"), ("existing", "sky-5"), ("existing", "lighthouse-1")],
    "ocean": [("existing", f"ocean-{i}") for i in range(1, 11)],
    "dino": [("kind", "count"), ("kind", "odd"), ("kind", "sequence"), ("kind", "compare"), ("kind", "pattern"), ("kind", "count"), ("kind", "quantity"), ("kind", "maze3"), ("kind", "odd"), ("kind", "maze5")],
    "space": [("kind", "coord"), ("kind", "count"), ("kind", "sequence"), ("kind", "coord"), ("kind", "quantity"), ("kind", "pattern"), ("kind", "relation"), ("kind", "coord"), ("kind", "maze3"), ("kind", "maze5")],
    "music": [("kind", "pattern"), ("kind", "count"), ("kind", "quantity"), ("kind", "ordinal"), ("kind", "pattern"), ("kind", "compare"), ("kind", "sequence"), ("kind", "maze3"), ("kind", "relation"), ("kind", "pattern")],
    "donut": [("kind", "count"), ("kind", "quantity"), ("kind", "share"), ("kind", "share"), ("kind", "compare"), ("kind", "pattern"), ("kind", "relation"), ("kind", "share"), ("kind", "maze3"), ("kind", "maze5")],
    "magic": [("kind", "count"), ("kind", "quantity"), ("kind", "odd"), ("kind", "pattern"), ("kind", "relation"), ("kind", "compare"), ("kind", "count"), ("kind", "odd"), ("kind", "maze3"), ("kind", "maze5")],
}

def opts(correct, lo, hi):
    values = {correct}
    while len(values) < 3:
        values.add(rng.randint(lo, hi))
    out = list(values)
    rng.shuffle(out)
    return out

def maze(n, path_len):
    start = rng.randrange(n * n)
    path_cells = [start]
    while len(path_cells) < path_len:
        row, col = divmod(path_cells[-1], n)
        choices = []
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = row + dr, col + dc
            idx = nr * n + nc
            if 0 <= nr < n and 0 <= nc < n and idx not in path_cells:
                choices.append(idx)
        if not choices:
            return maze(n, path_len)
        path_cells.append(rng.choice(choices))
    grid = [rng.choice([7, 8, 9]) for _ in range(n * n)]
    for value, cell in enumerate(path_cells, 1):
        grid[cell] = value
    return {"grid": grid, "path": list(range(1, path_len + 1)), "cols": n, "goalLabel": "终点"}

def round_for(kind, world, level_index, round_index):
    cfg = WORLDS[world]
    obj = cfg["object"]
    name = OBJECT_NAMES[obj]
    tag = f"{WORLDS[world]['name']}第{level_index}关第{round_index + 1}题"
    if kind == "count":
        target = rng.randint(3, 9)
        prompt = f"{tag}：数一数，这里有几{name}？"
        return {"target": target, "object": obj, "options": opts(target, 1, 10), "prompt": prompt}
    if kind == "quantity":
        target = rng.randint(2, 9)
        prompt = f"{tag}：看清目标，要 {target}{name}。哪一组正好？"
        return {"target": target, "object": obj, "options": opts(target, 1, 10), "prompt": prompt}
    if kind == "sequence":
        start = rng.randint(1, 4)
        step = rng.choice([1, 1, 2])
        seq = [start + step * i for i in range(4)]
        answer = seq[-1]
        rounded = seq[:3] + [None]
        prompt = f"{tag}：数字在排队，{rounded[0]}、{rounded[1]}、{rounded[2]}，下一个是几？"
        return {"sequence": rounded, "answer": answer, "options": opts(answer, max(1, answer - 4), answer + 4), "prompt": prompt}
    if kind == "compare":
        left, right = rng.sample(range(2, 9), 2)
        ask = rng.choice(["more", "fewer"])
        prompt = f"{tag}：哪边{('更多' if ask == 'more' else '更少')}？"
        return {"left": left, "right": right, "ask": ask, "object": obj, "prompt": prompt}
    if kind == "pattern":
        pool = ["star", "cloud", "sun", "moon", "1", "2", "3", "fish", "shell"]
        a, b = rng.sample(pool, 2)
        seq = [a, b, a, b, a]
        answer = b
        prompt = f"{tag}：看一看，{seq[0]}、{seq[1]}、{seq[2]}、{seq[3]}、{seq[4]}，下一个是什么？"
        return {"sequence": seq, "answer": answer, "options": [answer] + [x for x in rng.sample(pool, 2) if x != answer], "prompt": prompt}
    if kind == "ordinal":
        lineup = rng.sample(["squirrel", "bear", "owl", "fox", "firefly", "turtle"], 4)
        pos = rng.randint(2, 4)
        answer = lineup[pos - 1]
        prompt = f"{tag}：从小旗这边数，谁排第 {pos} 个？"
        return {"lineup": lineup, "position": pos, "answer": answer, "options": [answer] + [x for x in lineup if x != answer][:2], "prompt": prompt}
    if kind in ("maze3", "maze5"):
        n = 3 if kind == "maze3" else 5
        data = maze(n, n)
        data["prompt"] = f"{tag}：从 1 开始，按顺序走到 {n}。走错就回起点。"
        return data
    if kind == "odd":
        items = [rng.choice([1, 2, 3, 4, 5]), rng.choice([1, 2, 3, 4, 5]), rng.choice([1, 2, 3, 4, 5])]
        # two identical values and one different value
        items[1] = items[0]
        if items[2] == items[0]:
            items[2] = next(v for v in [1, 2, 3, 4, 5, 6] if v != items[0])
        rng.shuffle(items)
        odd = items[0] if items[1] == items[2] else (items[1] if items[0] == items[2] else items[2])
        prompt = f"{tag}：三个数字里，哪一个和大家不一样？"
        return {"items": items, "oddIndex": items.index(odd), "prompt": prompt}
    if kind == "coord":
        rows, cols = 3, 3
        items = rng.sample(["star", "planet", "fish", "shell", "cloud", "sun", "moon", "note", "donut"], 9)
        target_row, target_col = rng.randint(1, rows), rng.randint(1, cols)
        prompt = f"{tag}：第 {target_row} 行、第 {target_col} 列是哪一颗星球？"
        return {"rows": rows, "cols": cols, "items": items, "targetRow": target_row, "targetCol": target_col, "prompt": prompt}
    if kind == "share":
        total = rng.choice([4, 6, 8])
        half = total // 2
        answer = f"{half}+{half}"
        wrong = []
        for left in range(1, total):
            value = f"{left}+{total - left}"
            if value != answer and value not in wrong:
                wrong.append(value)
        rng.shuffle(wrong)
        prompt = f"{tag}：把 {total} 个甜甜圈分给 2 个盘子，哪种分法一样多？"
        return {"total": total, "parts": 2, "options": [answer, *wrong[:2]], "answer": answer, "prompt": prompt}
    if kind == "relation":
        base = rng.randint(4, 7)
        delta = rng.choice([1, 1, -1, 2])
        answer = base + delta
        prompt = f"{tag}：{'又多了' if delta > 0 else '少了'} {abs(delta)} 个。{base} {('+' if delta > 0 else '−')} {abs(delta)} 等于几？"
        return {"base": base, "delta": delta, "answer": answer, "options": opts(answer, 1, 10), "prompt": prompt}
    raise ValueError(kind)

def make_level(world, slot, kind, number):
    cfg = WORLDS[world]
    level_id = f"{world}-x{slot}"
    title = TITLES[world][slot - 1]
    intro = f"来到{cfg['name']}的第 {slot} 站。{title}开始啦，和{cfg['guardianName']}一起看清楚再选。"
    base_kind = "maze" if kind.startswith("maze") else kind
    rounds = [round_for(kind, world, slot, i) for i in range(3)]
    return {
        "id": level_id, "number": number, "world": world, "title": title,
        "skill": KIND_SKILL[base_kind], "kind": base_kind, "guardian": cfg["guardian"],
        "intro": intro, "rounds": rounds,
    }

def main():
    data = json.loads(CONTENT.read_text())
    existing = {level["id"]: level for level in data["levels"]}
    all_levels = []
    number = 1
    for world in [w[0] for w in WORLD_CONFIG]:
        for slot, (mode, value) in enumerate(PLANS[world], 1):
            if mode == "existing":
                level = existing[value]
                level["number"] = number
                level["world"] = "sky" if level["id"] == "lighthouse-1" else level["world"]
                all_levels.append(level)
            else:
                all_levels.append(make_level(world, slot, value, number))
            number += 1
    data["levels"] = all_levels
    data["worlds"] = [{"id": w[0], "name": w[1], "range": w[6], "guardian": w[2], "guardianName": w[3], "skill": w[5]} for w in WORLD_CONFIG]
    data["version"] = 4
    data["voices"]["finale"] = "一百颗数字星都亮啦！十座数字岛连成一片，庆典开始啦！"
    CONTENT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("levels", len(all_levels), "numbers", all_levels[0]["number"], all_levels[-1]["number"])
    print("worlds", [w["id"] for w in data["worlds"]])

if __name__ == "__main__":
    main()
