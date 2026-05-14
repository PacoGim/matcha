#!/usr/bin/env python3
# https://thispersondoesnotexist.com/

import os
import time
import requests
from datetime import datetime


SAVE_DIR = "backend/images"
DELAY = 0.025  # seconds between requests


def download_image_for_user(user_id: int) -> str | None:
    url = "https://thispersondoesnotexist.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; face-downloader/1.0)"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        filename = f"{user_id}.jpg"  # 🔥 use DB id
        filepath = os.path.join(SAVE_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(response.content)

        print(f"  ✓ Saved: {filename}")
        return filepath

    except requests.RequestException as e:
        print(f"  ✗ Failed for user {user_id}: {e}")
        return None

def download_images_for_users(user_ids: list[int]):
    os.makedirs(SAVE_DIR, exist_ok=True)

    print(f"\nDownloading {len(user_ids)} images...\n")

    success = 0

    for i, user_id in enumerate(user_ids, 1):
        print(f"[{i}/{len(user_ids)}] User {user_id}")
        result = download_image_for_user(user_id)

        if result:
            success += 1

        time.sleep(DELAY)  # keep your delay

    print(f"\nDone — {success}/{len(user_ids)} images saved.")

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