#!/bin/bash

set -e

# Config (modifiable via variables d'env)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-matcha_db}
DB_USER=${DB_USER:-matcha_user}
DB_PASSWORD=${DB_PASSWORD:-matcha_password}


export PGPASSWORD=$DB_PASSWORD

NB_USERS=50

echo "[*] Connecting to $DB_HOST:$DB_PORT..."

# PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1"
PSQL="podman exec -i -e PGPASSWORD=matcha_password matcha-db psql -U matcha_user -d matcha_db"

echo "[*] Seeding database with $NB_USERS users..."

# Tags
echo "[*] Creating tags..."
$PSQL <<EOF
INSERT INTO tags (name) VALUES
('music'), ('sports'), ('coding'), ('travel'),
('food'), ('movies'), ('art'), ('gaming'),
('fitness'), ('books')
ON CONFLICT DO NOTHING;
EOF

# Users + profiles
for i in $(seq 1 $NB_USERS); do
    EMAIL="user${i}@test.com"
    USERNAME="user${i}"
    FIRSTNAME="First${i}"
    LASTNAME="Last${i}"

    GENDER=$(shuf -e "male" "female" "other" -n 1)
    PREF=$(shuf -e "male" "female" "both" -n 1)

    BIO="Hello, I am user ${i}"
    LOCATION="Paris"

    echo "[*] Creating user $USERNAME"

    $PSQL <<EOF
WITH new_user AS (
    INSERT INTO users (email, username, password_hash, first_name, last_name, is_verified, fame_rating)
    VALUES (
        '$EMAIL',
        '$USERNAME',
        'hashed_password',
        '$FIRSTNAME',
        '$LASTNAME',
        TRUE,
        (RANDOM() * 100)::int
    )
    RETURNING id
)
INSERT INTO profiles (user_id, gender, sexual_preference, biography, location, latitude, longitude)
SELECT
    id,
    '$GENDER',
    '$PREF',
    '$BIO',
    '$LOCATION',
    48.8566 + (RANDOM() - 0.5) * 0.1,
    2.3522 + (RANDOM() - 0.5) * 0.1
FROM new_user;
EOF

done

# Tags users
echo "[*] Assigning tags..."
$PSQL <<EOF
INSERT INTO user_tags (user_id, tag_id)
SELECT u.id, t.id
FROM users u
JOIN tags t ON RANDOM() < 0.2
ON CONFLICT DO NOTHING;
EOF

# Likes
echo "[*] Generating likes..."
$PSQL <<EOF
INSERT INTO likes (liker_id, liked_id)
SELECT u1.id, u2.id
FROM users u1
JOIN users u2 ON u1.id <> u2.id
WHERE RANDOM() < 0.2
ON CONFLICT DO NOTHING;
EOF

# Messages
echo "[*] Generating messages..."
$PSQL <<EOF
INSERT INTO messages (sender_id, receiver_id, content)
SELECT l1.liker_id, l1.liked_id, 'Hello there!'
FROM likes l1
JOIN likes l2
ON l1.liker_id = l2.liked_id
AND l1.liked_id = l2.liker_id;
EOF

echo "[✔] Seeding complete."