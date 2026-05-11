## User

 - [x] POST   /user/register
 - [x] POST   /user/login
 - [x] POST   /user/logout
 - [x] POST   /user/check-email
 - POST   /user/forgot-password
 - POST   /user/reset-password
 - PUT	  /user/password
 - [x] GET    /user/profile
 - PUT    /user/profile

## Profile

 - GET    /profile/:id

## Pictures

 - POST   /pictures
 - DELETE /pictures/:id
 - PUT    /pictures/:id

## Tags

 - GET    /tags
 - POST   /tags
 - POST   /me/tags

## Likes

 - POST   /like/:id
 - DELETE /like/:id
 - GET    /me/likes
 - GET    /me/liked-by
 - GET    /me/matches

## Views

 - GET /me/views

## Search

 - GET /search?age_min=&age_max=&location=&fame_min=&tags=

## Suggestions

 - GET /suggestions?sort=age|distance|fame|tags

## Block / Report

 - POST /block/:id
 - DELETE /block/:id
 - POST /report/:id

## Chat

 - GET /conversations
 - GET /messages/:id
 - POST /messages/:id

## WebSocket

 - /ws/notifications
 - /ws/chat


## Events
{
  "type": "message",
  "payload": { ... }
}