#!/usr/bin/env python3

import json
import math
import os
import random
import urllib.request

import psycopg


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "matcha_db")
DB_USER = os.getenv("DB_USER", "matcha_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "matcha_password")

NB_USERS = int(os.getenv("NB_USERS", "50"))

PARIS_LAT = 48.8566
PARIS_LON = 2.3522
RADIUS_KM = 25


def random_coordinates_around_paris():
    angle = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0, RADIUS_KM)

    lat_offset = (distance / 111.32) * math.cos(angle)

    lon_offset = (
        distance
        / (111.32 * math.cos(math.radians(PARIS_LAT)))
    ) * math.sin(angle)

    latitude = PARIS_LAT + lat_offset
    longitude = PARIS_LON + lon_offset

    return latitude, longitude


def fetch_random_users(count: int):
    url = (
        "https://randomuser.me/api/"
        f"?results={count}"
        "&inc=name,email,gender,location,login"
        "&nat=us,ca,gb,au"
        "&noinfo"
    )

    with urllib.request.urlopen(url, timeout=30) as response:
        data = json.load(response)

    return data["results"]


def sanitize(value: str | None):
    if value is None:
        return None

    return value.strip()


def build_location(user_data):
    city = sanitize(user_data["location"].get("city"))
    state = sanitize(user_data["location"].get("state"))
    country = sanitize(user_data["location"].get("country"))

    parts = [p for p in [city, state, country] if p]

    return ", ".join(parts)


def ensure_unique_username(username, used_usernames):
    original = username
    counter = 1

    while username in used_usernames:
        username = f"{original}{counter}"
        counter += 1

    used_usernames.add(username)

    return username


def generate_users():
    raw_users = fetch_random_users(NB_USERS)

    used_usernames = set()
    used_emails = set()

    users = []

    for item in raw_users:
        email = item["email"].lower().strip()

        if email in used_emails:
            continue

        used_emails.add(email)

        username = ensure_unique_username(
            item["login"]["username"].strip(),
            used_usernames,
        )

        gender = item["gender"]

        if gender not in ("male", "female", "other"):
            gender = "other"

        latitude, longitude = (
            random_coordinates_around_paris()
        )

        user = {
            "email": email,
            "username": username,
            "password_hash":
                "$2b$10$S/TOfkABQGcCr.tf3PsBSO9/gVWh6VPT5KV3iCabLrWXRQkxbdBu2",
            "first_name": item["name"]["first"].strip(),
            "last_name": item["name"]["last"].strip(),
            "gender": gender,
            "sexual_preference": random.choice(
                ["male", "female", "both"]
            ),
            "biography":
                f"Hi, I'm {item['name']['first']} and I love Matcha.",
            "location": build_location(item),
            "latitude": latitude,
            "longitude": longitude,
            "allow_gps": True,
            "fame_rating": random.randint(0, 100),
        }

        users.append(user)

    return users


def insert_users(conn, users):
    with conn.cursor() as cur:
        for user in users:
            cur.execute(
                """
                INSERT INTO users (
                    email,
                    username,
                    password_hash,
                    first_name,
                    last_name,
                    is_verified,
                    fame_rating
                )
                VALUES (
                    %(email)s,
                    %(username)s,
                    %(password_hash)s,
                    %(first_name)s,
                    %(last_name)s,
                    TRUE,
                    %(fame_rating)s
                )
                ON CONFLICT (email)
                DO UPDATE SET
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    fame_rating = EXCLUDED.fame_rating,
                    updated_at = NOW()
                RETURNING id;
                """,
                user,
            )

            user_id = cur.fetchone()[0]

            cur.execute(
                """
                INSERT INTO profiles (
                    user_id,
                    gender,
                    sexual_preference,
                    biography,
                    location,
                    latitude,
                    longitude,
                    coordinates,
                    allow_gps
                )
                VALUES (
                    %(user_id)s,
                    %(gender)s::gender,
                    %(sexual_preference)s::sexual_pref,
                    %(biography)s,
                    %(location)s,
                    %(latitude)s,
                    %(longitude)s,

                    ST_SetSRID(
                        ST_MakePoint(
                            %(longitude)s,
                            %(latitude)s
                        ),
                        4326
                    )::geography,

                    %(allow_gps)s
                )

                ON CONFLICT (user_id)

                DO UPDATE SET
                    gender = EXCLUDED.gender,
                    sexual_preference =
                        EXCLUDED.sexual_preference,
                    biography = EXCLUDED.biography,
                    location = EXCLUDED.location,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    coordinates = EXCLUDED.coordinates,
                    allow_gps = EXCLUDED.allow_gps,
                    updated_at = NOW();
                """,
                {
                    **user,
                    "user_id": user_id,
                },
            )

    conn.commit()


def create_bob(conn):
    bob = {
        "email": "b@b.b",
        "username": "bob",
        "password_hash":
            "$2b$10$S/TOfkABQGcCr.tf3PsBSO9/gVWh6VPT5KV3iCabLrWXRQkxbdBu2",
        "first_name": "Bob",
        "last_name": "Doe",
        "gender": "male",
        "sexual_preference": "female",
        "biography":
            "Hello, I am Bob. I love coding and traveling.",
        "location": "Paris",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "allow_gps": True,
        "fame_rating": 42,
    }

    insert_users(conn, [bob])


def create_tags(conn):
    tags = [
        "music",
        "sports",
        "coding",
        "travel",
        "food",
        "movies",
        "art",
        "gaming",
        "fitness",
        "books",
    ]

    with conn.cursor() as cur:
        for tag in tags:
            cur.execute(
                """
                INSERT INTO tags (name)
                VALUES (%s)
                ON CONFLICT (name) DO NOTHING;
                """,
                (tag,),
            )

    conn.commit()


def assign_random_tags(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO user_tags (user_id, tag_id)

            SELECT
                u.id,
                t.id

            FROM users u
            CROSS JOIN tags t

            WHERE RANDOM() < 0.2

            ON CONFLICT DO NOTHING;
            """
        )

    conn.commit()


def generate_likes(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO likes (liker_id, liked_id)

            SELECT
                u1.id,
                u2.id

            FROM users u1
            JOIN users u2
                ON u1.id <> u2.id

            WHERE RANDOM() < 0.15

            ON CONFLICT DO NOTHING;
            """
        )

    conn.commit()


def generate_messages(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO messages (
                sender_id,
                receiver_id,
                content
            )

            SELECT
                l1.liker_id,
                l1.liked_id,
                'Hello there!'

            FROM likes l1

            JOIN likes l2
                ON l1.liker_id = l2.liked_id
               AND l1.liked_id = l2.liker_id;
            """
        )

    conn.commit()


def main():
    print("[*] Connecting to PostgreSQL...")

    conn = psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )

    try:
        print("[*] Creating tags...")
        create_tags(conn)

        print(f"[*] Generating {NB_USERS} users...")
        users = generate_users()

        print("[*] Inserting users/profiles...")
        insert_users(conn, users)

        print("[*] Creating Bob...")
        create_bob(conn)

        print("[*] Assigning tags...")
        assign_random_tags(conn)

        print("[*] Generating likes...")
        generate_likes(conn)

        print("[*] Generating messages...")
        generate_messages(conn)

        print("[✔] Seeding complete.")

    finally:
        conn.close()


if __name__ == "__main__":
    main()