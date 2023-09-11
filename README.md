# Photography Portfolio
This project is a dynamic web application that allows users (me) to securely upload and display images. It's built using Vite.js with React for the frontend, integrated with an S3 bucket for image storage, and utilizes PostgreSQL as the database for image metadata. The backend, crafted with FastAPI, manages image uploads and data retrieval, while Docker facilitates containerization for consistent deployment and scalability.

Soon, Auth0 will be introduced to the mix for authentication for selective access to the upload and delete features.

## TODOs:
- [ ] **Authentication with Auth0**
  - [ ] Integrate Auth0 with the frontend to enable user login and authentication.
  - [ ] Place the photo upload feature behind authentication to ensure only authorized users can upload photos.

- [ ] **Photo Management**
  - [ ] Implement a "Delete Photo" feature on the frontend.
    - Make API calls to the backend for deletion.
    - Ensure the corresponding image gets deleted from both the database and the S3 bucket.
  - [ ] Place the "Delete Photo" feature behind authentication to restrict access.
