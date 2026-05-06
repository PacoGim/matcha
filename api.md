## Auth

POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password

## User/Profile

GET    /me
PUT    /me
GET    /users/:id

## Pictures

POST   /pictures
DELETE /pictures/:id
PUT    /pictures/:id/set-profile

## Tags

GET    /tags
POST   /tags
POST   /me/tags

## Likes

POST   /users/:id/like
DELETE /users/:id/like
GET    /me/likes
GET    /me/liked-by
GET    /me/matches

## Views

GET /me/views

## Search

GET /search?age_min=&age_max=&location=&fame_min=&tags=

## Suggestions

GET /suggestions?sort=age|distance|fame|tags

## Block / Report

POST /users/:id/block
DELETE /users/:id/block
POST /users/:id/report

## Chat

GET /conversations
GET /messages/:userId
POST /messages/:userId

## WebSocket

/ws/notifications
/ws/chat


## Events
{
  "type": "message",
  "payload": { ... }
}