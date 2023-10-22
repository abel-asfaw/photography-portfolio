# Photography Portfolio
This is a dynamic web app that lets me securely upload and display my photos. I used Vite.js and React for the frontend, which includes features like photo management.

The app is integrated with an Amazon S3 bucket for storage, which holds all the uploaded images. When photos are deleted, they are removed from both the database and the S3 bucket. For managing image metadata, I use PostgreSQL.

On the backend, FastAPI handles tasks like image uploads, data retrieval, and deletions. I've also set up Auth0 on the frontend for user login and the backend to secure endpoints. This means both photo upload and deletion are behind authentication, making sure only authorized actions happen.

Lastly, the whole application is containerized using Docker. This helps with consistent deployments and makes scaling easier in the future.

## Video demo:

https://github.com/abel-asfaw/photography-portfolio/assets/50559072/6e6de8a2-d10f-409d-aa82-b14fc5e8fbf2

## TODOs:
- [ ] **Backend Enhancements**:
  - [ ] Raise specific exceptions instead of generic ones.
  - [ ] Implement rate limiter to protect API.

- [ ] **Deployment**:
  - [ ] Deploy each service (api, frontend, database) to an appropriate cloud platform.
