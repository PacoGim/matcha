#!/usr/bin/env python3
# https://thispersondoesnotexist.com/

import os
import time
import requests
from datetime import datetime


SAVE_DIR = "backend/images"
DELAY = 0.025  # seconds between requests


def download_image(index: int) -> str | None:
    """Download a single image and return its path, or None on failure."""
    url = "https://thispersondoesnotexist.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; face-downloader/1.0)"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"face_{timestamp}_{index:04d}.jpg"
        filepath = os.path.join(SAVE_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(response.content)

        size_kb = len(response.content) / 1024
        print(f"  ✓ Saved: {filename}  ({size_kb:.1f} KB)")
        return filepath

    except requests.RequestException as e:
        print(f"  ✗ Request failed: {e}")
        return None


def main():
    os.makedirs(SAVE_DIR, exist_ok=True)

    try:
        count = int(input("How many images to download? "))
        if count <= 0:
            raise ValueError
    except ValueError:
        print("Please enter a positive integer.")
        return

    print(f"\nDownloading {count} image(s) into ./{SAVE_DIR}/  (5 s delay between each)\n")

    success = 0
    for i in range(1, count + 1):
        print(f"[{i}/{count}] Fetching...")
        result = download_image(i)
        if result:
            success += 1

        if i < count:
            print(f"  Waiting {DELAY} s...\n")
            time.sleep(DELAY)

    print(f"\nDone — {success}/{count} image(s) saved to ./{SAVE_DIR}/")


if __name__ == "__main__":
    main()