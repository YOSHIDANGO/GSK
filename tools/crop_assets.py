"""MY儀式の素材シートからゲーム用PNGを再生成する。

座標は (left, top, right, bottom) 形式。シートを更新した場合は
ASSETS の値だけを微調整すればよい。ラベルや区切り線を避け、絵の周囲に
少量の余白を残している。
"""

from collections import deque
from pathlib import Path
from statistics import median

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_CANDIDATES = (
    ROOT / "source_asset_sheet.png",
    ROOT / "assets" / "source_asset_sheet.png",
)
OUTPUT_DIR = ROOT / "assets"

# name: (crop box, remove connected dark sheet background)
ASSETS = {
    "logo.png": ((25, 22, 350, 202), True),
    "ogp.png": ((364, 19, 789, 229), False),
    "bg_main.png": ((23, 304, 259, 467), False),
    "noise_overlay.png": ((272, 304, 471, 467), False),
    "omen_orb_off.png": ((820, 65, 1015, 224), True),
    "omen_orb_on.png": ((1045, 62, 1225, 224), True),
    "lever.png": ((1263, 59, 1423, 224), True),
    # ラベルは y=449 前後から始まるため、下端を少し手前に置く。
    "seal_capsule_idle.png": ((507, 296, 683, 447), True),
    "seal_capsule_shake_l.png": ((680, 296, 847, 447), True),
    "seal_capsule_shake_r.png": ((844, 296, 1010, 447), True),
    "seal_capsule_success.png": ((1002, 288, 1190, 447), True),
    "seal_capsule_break.png": ((1180, 294, 1354, 447), True),
    "wish_shadow.png": ((1344, 294, 1515, 447), True),
    "fate_gate_closed.png": ((25, 535, 242, 709), True),
    "fate_gate_open.png": ((244, 530, 453, 709), True),
    "fate_light_normal.png": ((449, 534, 571, 709), True),
    "fate_light_rare.png": ((568, 530, 697, 709), True),
    "stone_icon.png": ((705, 563, 808, 709), True),
    "envelope_closed.png": ((831, 544, 1041, 704), True),
    "envelope_open.png": ((1038, 526, 1224, 704), True),
    "ticket_win.png": ((1215, 536, 1373, 707), True),
    "ticket_lose.png": ((1360, 548, 1516, 707), True),
    "exam_page_wait.png": ((23, 792, 198, 959), False),
    "exam_page_loading.png": ((204, 792, 386, 959), False),
    "exam_page_pass.png": ((393, 792, 567, 959), False),
    "exam_page_fail.png": ((573, 792, 748, 959), False),
    "type_resonance.png": ((765, 798, 877, 918), True),
    "type_mash.png": ((873, 798, 987, 918), True),
    "type_hide.png": ((981, 798, 1094, 918), True),
    "type_stroke.png": ((1088, 798, 1202, 918), True),
    "type_timing.png": ((1197, 798, 1311, 918), True),
    "type_stare.png": ((1305, 798, 1419, 918), True),
    "type_escape.png": ((1413, 798, 1527, 918), True),
}


def remove_edge_background(image: Image.Image, tolerance: int = 34) -> Image.Image:
    """四辺につながる暗いシート背景だけを透明にする簡易処理。

    輪郭が欠ける素材は ASSETS の第2要素を False にすれば矩形のまま出力できる。
    """
    rgba = image.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    edge_samples = []
    for x in range(0, w, max(1, w // 30)):
        edge_samples.extend((px[x, 0][:3], px[x, h - 1][:3]))
    for y in range(0, h, max(1, h // 30)):
        edge_samples.extend((px[0, y][:3], px[w - 1, y][:3]))
    matte = tuple(int(median(c[i] for c in edge_samples)) for i in range(3))

    seen = set()
    queue = deque()
    for x in range(w):
        queue.extend(((x, 0), (x, h - 1)))
    for y in range(h):
        queue.extend(((0, y), (w - 1, y)))

    def is_background(x: int, y: int) -> bool:
        rgb = px[x, y][:3]
        distance = max(abs(rgb[i] - matte[i]) for i in range(3))
        return distance <= tolerance and max(rgb) < 72

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not is_background(x, y):
            continue
        seen.add((x, y))
        px[x, y] = (*px[x, y][:3], 0)
        if x:
            queue.append((x - 1, y))
        if x + 1 < w:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < h:
            queue.append((x, y + 1))
    return rgba


def main() -> None:
    source_path = next((path for path in SOURCE_CANDIDATES if path.exists()), None)
    if source_path is None:
        choices = " / ".join(str(path) for path in SOURCE_CANDIDATES)
        raise FileNotFoundError(f"素材シートが見つかりません: {choices}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with Image.open(source_path) as sheet:
        for filename, (box, transparent) in ASSETS.items():
            cropped = sheet.crop(box)
            if transparent:
                cropped = remove_edge_background(cropped)
            cropped.save(OUTPUT_DIR / filename, optimize=True)
            print(f"created assets/{filename} {cropped.size}")


if __name__ == "__main__":
    main()
