# Photography Portfolio
My project is a dynamic web app that lets me securely upload and showcase images. I used Vite.js and React for the frontend, which includes features like photo management. I can easily upload and also securely delete photos, ensuring images are managed efficiently.

The app is integrated with an Amazon S3 bucket for storage, which holds all the uploaded images. When photos are deleted, they are removed from both the database and the S3 bucket. For managing image metadata, I use PostgreSQL.

On the backend, FastAPI handles tasks like image uploads, data retrieval, and deletions. I've also set up Auth0 on both the frontend for user login and on the backend to secure endpoints. This means photo upload and deletion are behind authentication, making sure only authorized actions happen.

Lastly, the whole application is containerized using Docker. This helps with consistent deployments and makes scaling easier in the future.

## TODOs:
- [x] **Authentication with Auth0**
  - [x] Integrate Auth0 with the frontend to enable user login and authentication.
  - [x] Integrate Auth0 with the backend to secure endpoints.

- [x] **Photo Management**
  - [x] Implement a "Delete Photo" feature on the frontend.
    - Make API calls to the backend for deletion.
    - Ensure the corresponding image gets deleted from both the database and the S3 bucket.
  - [x] Place the photo deletion feature behind authentication to restrict access.
  - [x] Place the photo upload feature behind authentication to ensure only authorized users can upload photos.

- [x] **Bug Fixes**
  - [x] Fix photo order alteration after page refresh.

- [ ] **Admin Page Separation**:
  - [ ] Install and configure `react-router-dom`.
  - [ ] Create a new `/admin` route and adjust the base route (`/`) in the main app component.
  - [ ] Create a new `Admin` component:
    - [ ] Make sure it contains the photo uploader, photo list, login/logout buttons and the delete button.
    - [ ] Redirect to login page if a user tries to access the admin page without being authenticated.
  - [ ] Update the main `HomePage` component:
    - [ ] It should only display the photo list.
    - [ ] Remove authentication functions and buttons from this component.

- [ ] **UI**
  - [ ] Redesign the photo upload and login/logout buttons (Button component).

- [ ] **Deployment**
  - [ ] Deploy each service (api, frontend, database) to an appropriate cloud platform.

## Video demo of log in and file upload/deletion:

https://github.com/abel-asfaw/photography-portfolio/assets/50559072/f39055ba-8f3f-44f4-80c1-60d7a4e10f98

