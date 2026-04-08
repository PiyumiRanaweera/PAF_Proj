# Member 1 - Module A Demo Checklist

This checklist is for the Facilities & Assets Catalogue implementation only.

## 1) Backend proof

- Show public metadata endpoint:
  - `GET /api/resources/metadata`
- Show public filtered listing:
  - `GET /api/resources?name=Lab&type=LAB&status=ACTIVE&location=Engineering&minCapacity=20&sortBy=name&sortDir=asc`
- Show admin-only CRUD:
  - `POST /api/resources`
  - `PUT /api/resources/{id}`
  - `PATCH /api/resources/{id}/status`
  - `DELETE /api/resources/{id}`

## 2) Frontend proof

- Open `/resources` page.
- Show filters:
  - Name, Type, Status, Location, Min Capacity
  - Sort By and Direction
- Show table updates when filters are applied.
- Login as admin and show:
  - Add Resource modal
  - Edit Resource
  - Quick status toggle
  - Delete action

## 3) Validation proof

- In add/edit modal, set `Available From` later than `Available To`.
- Show inline validation error message.

## 4) Testing evidence

- Unit test file:
  - `smart-campus-api/src/test/java/com/smartcampus/api/resource/service/ResourceServiceTest.java`
- Unit test file:
  - `smart-campus-api/src/test/java/com/smartcampus/api/resource/controller/ResourceControllerTest.java`
- Postman collection:
  - `smart-campus-api/postman/member1-resources.postman_collection.json`

## 5) Branch and commits proof

- Branch: `Hirunya`
- Show commit history containing only Module A increments.
