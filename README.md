# Photography Portfolio

Deployed at: https://photography.abelasfaw.com/

## Why This Project?
1. I wanted to make it easy for anyone to view my photos without the noise and clutter of social media.
2. I wanted a place where I could control how my photos are presented and showcase them in a layout/style that I prefer.
3. No likes, comments or followers—just pure visuals.

## The Details
This is a full-stack web app that lets me securely upload and display my photos.

I used React + TypeScript for the frontend. On the backend, FastAPI handles photo upload, retrieval, and deletion. The app is integrated with an Amazon S3 bucket for photo storage. And for storing and managing image metadata I use PostgreSQL.

I've also set up Auth0 on the frontend for user login and the backend to secure endpoints. This means both photo upload and deletion are behind authentication and only authorized actions can happen.

Lastly, the each application (FE and BE) is containerized using Docker and I use docker compose to make local development easy for myself.

## Video demo

https://github.com/abel-asfaw/photography-portfolio/assets/50559072/6e6de8a2-d10f-409d-aa82-b14fc5e8fbf2

## Todos
- [ ] **Frontend Enhancements**:
  - [ ] Add unit tests.

- [ ] **Backend Enhancements**:
  - [x] Switch from using traditional SQL to an ORM.
  - [x] Raise specific exceptions instead of generic ones.
  - [ ] Add unit tests.
  - [ ] Implement rate limiter to protect API (stretch goal).

- [x] **Deployment**:
  - [x] Deploy each service (api, frontend, database) to an appropriate cloud platform.
