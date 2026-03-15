"""
OG Image Generator for AI OOTD 무드 진단기
카카오톡 공유용 1200x630 PNG 생성
"""

from PIL import Image, ImageDraw, ImageFont
import math

W, H = 400, 400
OUT = "og-image.png"

FONT_KO   = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG  = "/System/Library/Fonts/Supplemental/Arial.ttf"

# ─── 헬퍼: 선형 그라데이션 ────────────────────────────────────────────────────
def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_linear_gradient(img, x0, y0, x1, y1, color_stops):
    """color_stops: [(t, (r,g,b)), ...] t in [0,1]"""
    pixels = img.load()
    dx, dy = x1 - x0, y1 - y0
    length = math.sqrt(dx*dx + dy*dy)
    for y in range(img.height):
        for x in range(img.width):
            # 그라데이션 방향 투영
            px, py = x - x0, y - y0
            t = max(0.0, min(1.0, (px * dx + py * dy) / (length * length)))
            # 구간 색상 보간
            col = color_stops[0][1]
            for i in range(len(color_stops) - 1):
                t0, c0 = color_stops[i]
                t1, c1 = color_stops[i + 1]
                if t0 <= t <= t1:
                    local_t = (t - t0) / (t1 - t0)
                    col = lerp_color(c0, c1, local_t)
                    break
            pixels[x, y] = col
    return img

def draw_radial_gradient_overlay(draw, cx, cy, r, color, max_alpha=80):
    """중심에서 방사형으로 퍼지는 원형 오버레이"""
    steps = 60
    for i in range(steps, 0, -1):
        ratio = i / steps
        alpha = int(max_alpha * (1 - ratio))
        cr = int(r * ratio)
        bbox = [cx - cr, cy - cr, cx + cr, cy + cr]
        draw.ellipse(bbox, fill=(*color, alpha))

# ─── 텍스트에 그라데이션 적용 ─────────────────────────────────────────────────
def draw_gradient_text(img, text, font, x, y, c1, c2, anchor="lt"):
    """텍스트를 임시 레이어에 그린 뒤 좌→우 그라데이션 마스크 적용"""
    # 텍스트 bbox 계산
    dummy = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = dummy.textbbox((0, 0), text, font=font, anchor=anchor)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    # 텍스트 레이어 (흰색)
    text_layer = Image.new("RGBA", (tw + 4, th + 4), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    td.text((-bbox[0] + 2, -bbox[1] + 2), text, font=font, fill=(255, 255, 255, 255))

    # 그라데이션 레이어
    grad_layer = Image.new("RGBA", (tw + 4, th + 4), (0, 0, 0, 0))
    gp = grad_layer.load()
    for gx in range(tw + 4):
        t = gx / max(tw + 3, 1)
        col = lerp_color(c1, c2, t)
        for gy in range(th + 4):
            gp[gx, gy] = (*col, 255)

    # 텍스트 알파를 그라데이션 레이어에 적용
    grad_layer.putalpha(text_layer.split()[3])

    # 메인 이미지에 합성
    paste_x = x + bbox[0] - 2
    paste_y = y + bbox[1] - 2
    img.paste(grad_layer, (paste_x, paste_y), grad_layer)


# ─── 메인 ─────────────────────────────────────────────────────────────────────
def generate():
    # 1. 배경 그라데이션 (좌상단 → 우하단, 짙은 남색)
    bg = Image.new("RGB", (W, H))
    color_stops = [
        (0.0, (5,   5,  20)),
        (0.5, (10,  8,  30)),
        (1.0, (7,   5,  15)),
    ]
    draw_linear_gradient(bg, 0, 0, W, H, color_stops)

    # RGBA로 변환 (오버레이 합성용)
    img = bg.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    # 2. 방사형 글로우 (중앙 상단 퍼플 + 하단 핑크)
    draw_radial_gradient_overlay(od, W // 2, 100,  260, (100, 40, 220), max_alpha=100)
    draw_radial_gradient_overlay(od, W // 2, H - 80, 220, (200, 40, 140), max_alpha=80)

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # 3. 격자 도트 패턴
    for gx in range(0, W, 28):
        for gy in range(0, H, 28):
            draw.ellipse([gx-1, gy-1, gx+1, gy+1], fill=(255, 255, 255, 16))

    # 4. 상단 뱃지 "2026 TREND" — 중앙 정렬
    badge_font = ImageFont.truetype(FONT_BOLD, 13)
    badge_text = "2026 TREND"
    bb = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw = bb[2] - bb[0] + 24
    bh = bb[3] - bb[1] + 12
    bx = (W - bw) // 2
    by = 36
    badge_bg = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    bbg_d = ImageDraw.Draw(badge_bg)
    bbg_d.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=bh // 2,
                             fill=(120, 60, 240, 45),
                             outline=(139, 92, 246, 180), width=2)
    img.paste(badge_bg, (bx, by), badge_bg)
    draw.text((bx + 12, by + 6), badge_text, font=badge_font,
              fill=(180, 140, 255, 255))

    # 5. 메인 타이틀 "AI OOTD" — 중앙 정렬 그라데이션
    title_font = ImageFont.truetype(FONT_BOLD, 82)
    tb = draw.textbbox((0, 0), "AI OOTD", font=title_font)
    tx = (W - (tb[2] - tb[0])) // 2
    draw_gradient_text(img, "AI OOTD", title_font,
                       x=tx, y=78,
                       c1=(160, 100, 255),
                       c2=(240, 80, 180))

    # 6. 네온 링 장식 (타이틀 아래, 중앙)
    ring_cx, ring_cy = W // 2, 226
    for r, alpha, color in [
        (52, 35,  (139, 92, 246)),
        (42, 70,  (160, 80, 255)),
        (32, 110, (200, 60, 200)),
        (22, 70,  (236, 72, 153)),
    ]:
        ring_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring_overlay)
        rd.ellipse([ring_cx - r, ring_cy - r, ring_cx + r, ring_cy + r],
                   outline=(*color, alpha), width=2)
        img = Image.alpha_composite(img, ring_overlay)

    inner_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    id_ = ImageDraw.Draw(inner_overlay)
    draw_radial_gradient_overlay(id_, ring_cx, ring_cy, 28, (180, 100, 255), max_alpha=70)
    img = Image.alpha_composite(img, inner_overlay)
    draw = ImageDraw.Draw(img)

    # 링 안 십자별
    sc, sr = ring_cx, ring_cy
    star_color = (220, 180, 255, 230)
    star_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(star_overlay)
    arm, thick = 10, 2
    sd.rectangle([sc - thick, sr - arm, sc + thick, sr + arm], fill=star_color)
    sd.rectangle([sc - arm, sr - thick, sc + arm, sr + thick], fill=star_color)
    for d in range(-arm, arm):
        for s in [(sc+d, sr+d), (sc+d, sr-d)]:
            sd.ellipse([s[0]-1, s[1]-1, s[0]+1, s[1]+1], fill=star_color)
    img = Image.alpha_composite(img, star_overlay)
    draw = ImageDraw.Draw(img)

    # 7. 서브타이틀 "무드 진단기" — 중앙
    sub_font = ImageFont.truetype(FONT_KO, 32)
    sb = draw.textbbox((0, 0), "무드 진단기", font=sub_font)
    sx = (W - (sb[2] - sb[0])) // 2
    draw_gradient_text(img, "무드 진단기", sub_font,
                       x=sx, y=258,
                       c1=(200, 160, 255),
                       c2=(255, 130, 210))

    # 8. 설명 텍스트 — 중앙
    desc_font = ImageFont.truetype(FONT_KO, 14)
    draw = ImageDraw.Draw(img)
    desc = "AI가 찰떡같이 알아맞혀줘"
    db = draw.textbbox((0, 0), desc, font=desc_font)
    dx = (W - (db[2] - db[0])) // 2
    draw.text((dx, 308), desc, font=desc_font, fill=(160, 155, 200, 200))

    # 9. 하단 구분선 + URL
    line_y = H - 42
    draw.line([(40, line_y), (W - 40, line_y)], fill=(255, 255, 255, 25), width=1)
    url_font = ImageFont.truetype(FONT_REG, 13)
    url_text = "ootd-mood.ehdqhddl91.workers.dev"
    ub = draw.textbbox((0, 0), url_text, font=url_font)
    ux = (W - (ub[2] - ub[0])) // 2
    draw.text((ux, line_y + 10), url_text, font=url_font, fill=(140, 130, 180, 180))

    # 10. PNG로 저장
    final = img.convert("RGB")
    final.save(OUT, "PNG", optimize=True)
    print(f"✅ OG 이미지 생성 완료: {OUT}  ({W}×{H})")


if __name__ == "__main__":
    generate()
