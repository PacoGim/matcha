#!/bin/bash

set -euo pipefail

# Config (modifiable via environment variables)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-matcha_db}
DB_USER=${DB_USER:-matcha_user}
DB_PASSWORD=${DB_PASSWORD:-matcha_password}
NB_USERS=${NB_USERS:-500}

export PGPASSWORD=$DB_PASSWORD

PSQL="podman exec -i -e PGPASSWORD=$DB_PASSWORD matcha-db psql -U $DB_USER -d $DB_NAME"

echo "[*] Connecting to $DB_HOST:$DB_PORT..."
echo "[*] Seeding database with $NB_USERS random users..."

echo "[*] Fetching random users from randomuser.me..."
SQL_COMMANDS=$(python3 <<'PY'
import json
import os
import urllib.request
import random
import math
import sys

count = int(os.environ.get('NB_USERS', '500'))
url = f'https://randomuser.me/api/?results={count}&inc=name,email,gender,location,login&nat=us,ca,gb,au&noinfo'
with urllib.request.urlopen(url, timeout=30) as resp:
    data = json.load(resp)

users_values = []
profiles_data = []
used_usernames = set()
used_emails = set()

for item in data['results']:
    email = item['email'].replace("'", "''")
    
    # Skip if email already used
    if email in used_emails:
        continue
    used_emails.add(email)
    
    username = item['login']['username'].replace("'", "''")
    
    # Ensure unique username
    original_username = username
    counter = 1
    while username in used_usernames:
        username = f"{original_username}{counter}"
        counter += 1
    used_usernames.add(username)
    
    first = item['name']['first'].replace("'", "''")
    last = item['name']['last'].replace("'", "''")
    gender = item['gender']
    # Ensure gender is valid for ENUM
    if gender not in ['male', 'female', 'other', 'null']:
        gender = 'other'
    
    city = item['location'].get('city', '')
    state = item['location'].get('state', '')
    country = item['location'].get('country', '')
    location_parts = [p for p in [city, state, country] if p]
    location = ', '.join(location_parts).replace("'", "''")
    
    # Generate random coordinates around Paris (48.8566°N, 2.3522°E) within 25km radius
    paris_lat = 48.8566
    paris_lon = 2.3522
    radius_km = 25
    
    # Generate random angle and distance
    angle = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0, radius_km)
    
    # Convert to lat/lon offsets (1° lat ≈ 111.32 km, 1° lon ≈ 111.32 * cos(lat) km)
    lat_offset = (distance / 111.32) * math.cos(angle)
    lon_offset = (distance / (111.32 * math.cos(math.radians(paris_lat)))) * math.sin(angle)
    
    latitude = paris_lat + lat_offset
    longitude = paris_lon + lon_offset
    
    # Debug: print coordinates
    print(f"DEBUG: lat={latitude}, lon={longitude}", file=sys.stderr)
    
    pref = random.choice(['male', 'female', 'both'])
    fame_rating = random.randint(0, 100)
    bio = f"Hi, I'm {first} from {location or 'somewhere nice'}.".replace("'", "''")
    
    users_values.append(f"('{email}', '{username}', 'hashed_password', '{first}', '{last}', TRUE, {fame_rating})")
    profiles_data.append((email, gender, pref, bio, location, latitude, longitude))

print('INSERT INTO users (email, username, password_hash, first_name, last_name, is_verified, fame_rating) VALUES')
print(',\n'.join(users_values))
print('ON CONFLICT (email) DO NOTHING;')

print()
print('INSERT INTO profiles (user_id, gender, sexual_preference, biography, location, latitude, longitude)')
print('SELECT u.id, v.gender::gender, v.pref::sexual_pref, v.bio, v.location, v.lat::double precision, v.lon::double precision')
print('FROM users u')
print('JOIN (VALUES')
values_list = [f"('{email}', '{gender}', '{pref}', '{bio}', '{location}', {latitude}, {longitude})" for email, gender, pref, bio, location, latitude, longitude in profiles_data]
print(',\n'.join(values_list))
print(') AS v(email, gender, pref, bio, location, lat, lon) ON u.email = v.email')
print('ON CONFLICT (user_id) DO UPDATE SET')
print('    gender = EXCLUDED.gender,')
print('    sexual_preference = EXCLUDED.sexual_preference,')
print('    biography = EXCLUDED.biography,')
print('    location = EXCLUDED.location,')
print('    latitude = EXCLUDED.latitude,')
print('    longitude = EXCLUDED.longitude,')
print('    updated_at = NOW();')
PY
)

if [ -z "$SQL_COMMANDS" ]; then
  echo "[!] Failed to fetch random user data."
  exit 1
fi

echo "[*] Inserting users and profiles in batch..."

echo "$SQL_COMMANDS" | $PSQL

echo "[*] Creating special user bob..."

$PSQL <<'EOF'
WITH new_user AS (
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
        'b@b.b',
        'bob',
        '$2b$10$S/TOfkABQGcCr.tf3PsBSO9/gVWh6VPT5KV3iCabLrWXRQkxbdBu2',
        'Bob',
        'Doe',
        TRUE,
        42
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id
),
user_id AS (
    SELECT id FROM new_user
    UNION ALL
    SELECT id FROM users WHERE email = 'b@b.b'
)
INSERT INTO profiles (
    user_id,
    gender,
    sexual_preference,
    biography,
    location,
    latitude,
    longitude
)
SELECT
    id,
    'male',
    'female',
    'Hello, I am Bob. I love coding and traveling.',
    'Paris',
    48.8566,
    2.3522
FROM user_id
ON CONFLICT (user_id) DO UPDATE SET
    gender = EXCLUDED.gender,
    sexual_preference = EXCLUDED.sexual_preference,
    biography = EXCLUDED.biography,
    location = EXCLUDED.location,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();
EOF

echo "[✔] Seeding complete."
