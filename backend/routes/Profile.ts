import { Router } from "express"
import db from "../database/db"
import { authenticateToken, AuthRequest } from "../middleware/auth"

const profileRoute = Router()

profileRoute.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const result = await db.getPool().query("SELECT email,username,first_name,last_name,created_at FROM profiles WHERE user_id=$1;", [userId])
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

profileRoute.get("/profiles", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user?.id
        if (!currentUserId) {
            return res.status(401).json({ error: "User not authenticated" })
        }

        const count = parseInt(req.query.count as string) || 20

        // Get all users with profiles (excluding current user)
        const result = await db.getPool().query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.is_verified, u.fame_rating, u.created_at, u.updated_at,
                   p.gender, p.sexual_preference, DATE_PART('year', AGE(u.birthdate)) AS age, p.biography, p.location, p.latitude, p.longitude, p.coordinates, p.allow_gps, p.created_at as profile_created_at, p.updated_at as profile_updated_at
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id != $1 AND p.user_id IS NOT NULL
            LIMIT $2
        `, [currentUserId, count])

        // Transform to UserProfile format with mocked photos
        const userProfiles = result.rows.map(profile => ({
            id: profile.id,
            email: profile.email,
            username: profile.username,
            first_name: profile.first_name,
            last_name: profile.last_name,
            is_verified: profile.is_verified,
            fame_rating: profile.fame_rating,
            age: profile.age,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            profile: {
                user_id: profile.id,
                gender: profile.gender,
                sexual_preference: profile.sexual_preference,
                biography: profile.biography,
                location: profile.location,
                latitude: profile.latitude,
                longitude: profile.longitude,
                coordinates: profile.coordinates,
                allow_gps: profile.allow_gps,
                created_at: profile.profile_created_at,
                updated_at: profile.profile_updated_at
            },
            photos: generateMockPhotos(profile.id)
        }))

        res.json(userProfiles)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error" })
    }
})

// Helper function to generate consistent mock photo URLs
function generateMockPhotos(userId: string) {
    // Use a hash of userId for consistent URLs
    const hash = require('crypto').createHash('md5').update(userId).digest('hex')
    const baseUrl = 'https://via.placeholder.com'

    return {
        large: `${baseUrl}/400x400?text=Profile+${hash.substring(0, 6)}`,
        medium: `${baseUrl}/200x200?text=Profile+${hash.substring(0, 6)}`,
        thumbnail: `${baseUrl}/100x100?text=Profile+${hash.substring(0, 6)}`
    }
}

export default profileRoute

/* 
podman exec -it matcha-db bash
1e1030038b72:/# psql -U matcha_user -d matcha_db
psql (15.17)
Type "help" for help.

matcha_db=# select * from profiles;
               user_id                | gender | sexual_preference |                                        biography                                         |                               location                                |      latitude      |     longitude      | allow_gps |         created_at         |         updated_at         
--------------------------------------+--------+-------------------+------------------------------------------------------------------------------------------+-----------------------------------------------------------------------+--------------------+--------------------+-----------+----------------------------+----------------------------
 9a4e0b2e-d9b5-4e79-9599-8467b88a129f | male   | both              | Hi, I'm Anthony from Beaumont, Prince Edward Island, Canada.                             | Beaumont, Prince Edward Island, Canada                                | 48.835826476200594 | 2.3731833856421805 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:14:13.106861
 e314647b-4d8e-430a-807e-c5e25519e637 | female | female            | Hi, I'm Lucy from Wolverhampton, Kent, United Kingdom.                                   | Wolverhampton, Kent, United Kingdom                                   |            10.0679 |            50.7452 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 0f886870-708e-4722-9f03-272566a75fa5 | male   | male              | Hi, I'm Derek from Port Macquarie, New South Wales, Australia.                           | Port Macquarie, New South Wales, Australia                            |            26.3303 |           121.7482 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 8c7b4377-9732-4f16-8b5a-b8e12b3f201e | male   | female            | Hi, I'm Logan from Deer Lake, Northwest Territories, Canada.                             | Deer Lake, Northwest Territories, Canada                              |            40.8503 |            51.2574 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 8d8d5289-650e-40fc-86c7-6d74f405f832 | male   | female            | Hi, I'm Nolan from Kingston upon Hull, West Yorkshire, United Kingdom.                   | Kingston upon Hull, West Yorkshire, United Kingdom                    |            69.4621 |           -14.7067 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 c825886b-cf52-4239-ab92-8474b4d10ad3 | female | male              | Hi, I'm Mary from Preston, Borders, United Kingdom.                                      | Preston, Borders, United Kingdom                                      |            -44.513 |           -26.1753 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 ff102bc9-83ee-4bf4-a70a-50c2df10dac2 | female | female            | Hi, I'm Christy from Port Macquarie, Tasmania, Australia.                                | Port Macquarie, Tasmania, Australia                                   |             -39.65 |           -18.3132 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 23fa1e1c-bb47-4db7-8b2e-3b2dfe80d275 | female | female            | Hi, I'm Beth from Pembroke Pines, South Carolina, United States.                         | Pembroke Pines, South Carolina, United States                         |             2.0825 |             2.4323 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 d92c54a4-7df1-4136-9db9-f03915e2eed8 | female | male              | Hi, I'm Hannah from Georgetown, Yukon, Canada.                                           | Georgetown, Yukon, Canada                                             |             -46.55 |          -146.6344 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 a2d2081a-d8ed-4593-b725-6c3be40eb493 | female | both              | Hi, I'm Sarah from Winfield, New Brunswick, Canada.                                      | Winfield, New Brunswick, Canada                                       |            84.4641 |            148.212 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 7c192b09-7f57-45cb-85b6-234f6b31ac1e | female | male              | Hi, I'm Rachel from Phoenix, California, United States.                                  | Phoenix, California, United States                                    |            66.4371 |             7.2736 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 ada6dc8d-aa3c-4b52-a581-d2f1873ff865 | male   | female            | Hi, I'm Gabriel from Orange, Queensland, Australia.                                      | Orange, Queensland, Australia                                         |             39.847 |           -82.8622 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 8bdc5c72-177d-4176-a44b-6438dd9202b0 | female | male              | Hi, I'm Felecia from Des Moines, Vermont, United States.                                 | Des Moines, Vermont, United States                                    |           -57.5324 |          -167.5471 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 cfa40738-cf20-4d3e-8515-b082ae9d5d34 | male   | both              | Hi, I'm Philip from Darwin, Australian Capital Territory, Australia.                     | Darwin, Australian Capital Territory, Australia                       |            15.3168 |             68.872 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 d7d15d60-7fc8-46fe-996a-f093f26bea01 | male   | male              | Hi, I'm Fred from Tweed, South Australia, Australia.                                     | Tweed, South Australia, Australia                                     |            86.2566 |           176.1443 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 fde9dec4-1881-4da0-854c-d6929b315d20 | female | female            | Hi, I'm Sharon from Wolverhampton, Humberside, United Kingdom.                           | Wolverhampton, Humberside, United Kingdom                             |            78.0024 |            80.9368 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 25b2847a-4413-430f-a337-1ae680ef930f | male   | female            | Hi, I'm Nelson from Sunshine Coast, New South Wales, Australia.                          | Sunshine Coast, New South Wales, Australia                            |            31.0937 |           111.2651 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 6a3b1247-edde-4258-af31-17d337ade2f5 | female | female            | Hi, I'm Clara from Killarney, Saskatchewan, Canada.                                      | Killarney, Saskatchewan, Canada                                       |            60.4288 |           -41.6869 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 62ec0ea1-827c-48a6-9993-7d02e4a85bb2 | female | both              | Hi, I'm Lola from Gloucester, Staffordshire, United Kingdom.                             | Gloucester, Staffordshire, United Kingdom                             |            29.7769 |            22.4905 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 f4b0129c-2cdc-4a68-b1a3-4b18c3e7a2e5 | male   | female            | Hi, I'm Brandon from Centennial, Indiana, United States.                                 | Centennial, Indiana, United States                                    |            61.8996 |            85.7844 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 d8d811df-5e00-45e6-af15-05920a4ed3f2 | male   | male              | Hi, I'm Arnaud from Kingston, Newfoundland and Labrador, Canada.                         | Kingston, Newfoundland and Labrador, Canada                           |            -6.1402 |           106.9556 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 3a9ea0aa-42e1-44c2-a6dc-08834b01ad2c | female | female            | Hi, I'm Stacey from Bathurst, Tasmania, Australia.                                       | Bathurst, Tasmania, Australia                                         |            76.3557 |           151.7092 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 a32279ff-6df7-4095-bbc6-0c508b49bf02 | female | both              | Hi, I'm Katherine from Fresno, Colorado, United States.                                  | Fresno, Colorado, United States                                       |             80.074 |          -105.9243 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 36b8617f-6b0b-4cea-8b97-240018a21449 | male   | female            | Hi, I'm Jared from Bundaberg, South Australia, Australia.                                | Bundaberg, South Australia, Australia                                 |             42.582 |           142.5517 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 4cb9e90a-d545-41f1-a837-c5ec481d007d | female | male              | Hi, I'm Kim from Wilmington, Iowa, United States.                                        | Wilmington, Iowa, United States                                       |             86.624 |           142.7681 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 1f52bc5f-5abd-429d-bc3c-0ef5bbe1546b | male   | both              | Hi, I'm Wade from Des Moines, Nebraska, United States.                                   | Des Moines, Nebraska, United States                                   |            42.3829 |           -93.1692 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
 be8844a4-5d83-4f6a-8a3b-58d7d5ccb7bf | male   | female            | Hi, I'm Logan from Seymour, Minnesota, United States.                                    | Seymour, Minnesota, United States                                     |           -53.1292 |            71.6103 | f         | 2026-05-12 08:10:35.286358 | 2026-05-12 08:10:35.286358
--More-- 

*/