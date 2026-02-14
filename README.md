# Photography Portfolio

Check it out at https://photography.abelasfaw.com/

## The Details
This is a full stack web app that lets me upload and display my photos.

I used React + TypeScript for the frontend. On the backend, FastAPI handles photo upload, retrieval, and deletion. The app is integrated with an Amazon S3 bucket for photo storage. And for storing and managing image metadata I use PostgreSQL.

I've also set up Auth0 for login @ https://photography.abelasfaw.com/admin and both photo upload and deletion are secured via token-based access.

The entire stack is running on the same host and is logically separated by containers to make local development easy. `docker-compose up` will spin up everything on `localhost:3005`.

## Why This Project?
1. I don't have social media and I wanted to make it easy for anyone to view my photos without all the social media noise.
2. I wanted a place where I could control how my photos are presented and show them in a layout/style that I like.
3. No likes, comments or followers, I just wanted pure visuals.
