"""
OOTD AI 이미지 크롤러
Teachable Machine 학습용 패션 이미지 수집 스크립트
각 카테고리당 200장, 총 1000장 다운로드
"""

import os
import sys
from pathlib import Path
from PIL import Image
from icrawler.builtin import BingImageCrawler

# ─── 설정 ───────────────────────────────────────────────────────────────────
DATASET_DIR = Path("dataset")
TARGET_COUNT = 200  # 폴더당 목표 이미지 수

CATEGORIES = [
    {
        "folder": "01_geek_chic",
        "keywords": [
            "Geek Chic fashion ootd outfit 2024",
            "geek chic style streetwear glasses nerd aesthetic",
            "tech wear geek chic outfit trendy",
        ],
    },
    {
        "folder": "02_gorpcore",
        "keywords": [
            "Gorpcore street style outdoor fashion 2024",
            "gorpcore aesthetic outfit hiking fashion ootd",
            "gorpcore fleece vest trail runner fashion",
        ],
    },
    {
        "folder": "03_old_money",
        "keywords": [
            "Old money aesthetic outfit fashion 2024",
            "old money style preppy elegant ootd",
            "quiet luxury old money fashion look",
        ],
    },
    {
        "folder": "04_balletcore",
        "keywords": [
            "Balletcore fashion outfit 2024 aesthetic",
            "balletcore style tutu skirt ballet flat ootd",
            "soft feminine balletcore fashion trend",
        ],
    },
    {
        "folder": "05_y2k_fashion",
        "keywords": [
            "Y2K maximalism outfit fashion 2024",
            "Y2K fashion aesthetic retro 2000s ootd",
            "y2k style butterfly clip low rise trendy",
        ],
    },
]


# ─── 유틸 함수 ───────────────────────────────────────────────────────────────

def validate_and_clean(folder: Path) -> int:
    """
    다운로드된 이미지 중 깨지거나 열리지 않는 파일 삭제.
    유효한 이미지 수를 반환.
    """
    valid = 0
    removed = 0
    for file in list(folder.iterdir()):
        if file.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
            continue
        try:
            with Image.open(file) as img:
                img.verify()  # 파일 손상 여부 확인
            valid += 1
        except Exception:
            file.unlink(missing_ok=True)
            removed += 1
    if removed:
        print(f"  ⚠️  손상된 이미지 {removed}장 삭제됨")
    return valid


def crawl_category(folder_name: str, keywords: list[str], target: int) -> None:
    save_dir = DATASET_DIR / folder_name
    save_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*55}")
    print(f"📂  [{folder_name}]  목표: {target}장")
    print(f"{'='*55}")

    # 키워드를 순서대로 시도, 누적 다운로드
    per_keyword = target // len(keywords) + 20  # 여유분 포함
    downloaded_total = 0

    for i, keyword in enumerate(keywords, 1):
        current_count = len(list(save_dir.glob("*.*")))
        if current_count >= target:
            print(f"  ✅  목표 달성 (현재 {current_count}장) — 추가 크롤링 생략")
            break

        remaining = target - current_count
        fetch_count = min(per_keyword, remaining + 20)

        print(f"  🔍  키워드 {i}/{len(keywords)}: \"{keyword}\"  ({fetch_count}장 시도)")

        try:
            crawler = BingImageCrawler(
                storage={"root_dir": str(save_dir)},
                feeder_threads=2,
                parser_threads=2,
                downloader_threads=6,
                log_level=40,  # ERROR만 출력
            )
            crawler.crawl(
                keyword=keyword,
                max_num=fetch_count,
                min_size=(200, 200),
                file_idx_offset="auto",
            )
        except Exception as e:
            print(f"  ❌  크롤링 오류: {e}")
            continue

    # 유효성 검사 & 손상 파일 정리
    valid_count = validate_and_clean(save_dir)
    print(f"  📊  최종 유효 이미지: {valid_count}장 / 목표 {target}장")
    return valid_count


# ─── 메인 ────────────────────────────────────────────────────────────────────

def main():
    print("🚀  OOTD AI 이미지 크롤러 시작!")
    print(f"📁  저장 경로: {DATASET_DIR.resolve()}")
    print(f"🎯  총 목표: {len(CATEGORIES) * TARGET_COUNT}장 ({len(CATEGORIES)}개 카테고리 × {TARGET_COUNT}장)\n")

    DATASET_DIR.mkdir(exist_ok=True)

    total_valid = 0
    results = []

    for cat in CATEGORIES:
        count = crawl_category(cat["folder"], cat["keywords"], TARGET_COUNT)
        total_valid += count
        results.append((cat["folder"], count))

    # ─── 최종 요약 ──────────────────────────────────────────────────────────
    print(f"\n{'='*55}")
    print("🎉  크롤링 완료! 최종 결과 요약")
    print(f"{'='*55}")
    for folder, count in results:
        status = "✅" if count >= TARGET_COUNT else "⚠️ "
        print(f"  {status}  {folder:<25} {count:>4}장")
    print(f"{'─'*55}")
    print(f"  📦  총 수집 이미지: {total_valid}장")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()
