# Photography Portfolio

Deployed at https://photography.abelasfaw.com/

## The Details
This is a full-stack web app that lets me upload and display my photos.

I used React + TypeScript for the frontend. On the backend, FastAPI handles photo upload, retrieval, and deletion. The app is integrated with an Amazon S3 bucket for photo storage. And for storing and managing image metadata I use PostgreSQL.

I've also set up Auth0 on the frontend for user login and the backend to secure endpoints. This means both photo upload and deletion are behind authentication and only authorized actions can happen.

Lastly, the each application (FE and BE) is containerized using Docker and I use docker compose to make local development easy for myself.

## Why This Project?
1. I don't have social media and I wanted to make it easy for anyone to view my photos without the noise and clutter of social media.
2. I wanted a place where I could control how my photos are presented and show them in a layout/style that I like.
3. No likes, comments or followers—just purely visuals.

## Video demo

https://github.com/abel-asfaw/photography-portfolio/assets/50559072/6e6de8a2-d10f-409d-aa82-b14fc5e8fbf2
