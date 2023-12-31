# Photography Portfolio
## Why This Project?
1. **Easy Sharing**: This site makes it simple for anyone to view my photos without the noise and clutter of social media.
2. **Personal Touch**: I wanted a place where I could control how my photos are presented and showcase them in a layout/style that I prefer.
3. **All About the Photos**: No likes, comments, or followers—just pure visuals.

## The Details
This is a full-stack web application that lets me securely upload and display my photos.

I used React for the frontend, which includes features like photo management. On the backend, FastAPI handles tasks like image upload, data retrieval, and photo deletion. The app is integrated with an Amazon S3 bucket for image storage. And for managing image data I use PostgreSQL.

I've also set up Auth0 on the frontend for user login and the backend to secure endpoints. This means both photo upload and deletion are behind authentication, making sure only authorized actions happen.

Lastly, the whole application is containerized using Docker. This helps with consistent deployments and makes scaling easier in the future.

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

- [ ] **Deployment**:
  - [ ] Deploy each service (api, frontend, database) to an appropriate cloud platform.
