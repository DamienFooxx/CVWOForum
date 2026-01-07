# Forum Platform

## User Stories

* “I want to be able to see a year-in-review of my contributions to each topic in the forum.”
* “I want to be able to check if a post is legit — whether the poster is generally truthful or known for false statements.”
* “I want to be able to edit my posts easily.”
* “I want more than simple likes or dislikes. I want richer reactions.”

## Overall Goal

A modern forum platform designed to enhance engagement, credibility, and user experience through analytics, trust metrics, and strong moderation tools.

## Tech Stack

### Frontend

* React.js
* TypeScript

### Backend

* Go

### Database

* PostgreSQL

### Authentication

* Username + JWT
* Google OAuth 2.0

### Deployment & Infrastructure

* Hosting: Google Cloud Platform
* Containerisation: Docker
* CI/CD: GitHub Actions

## Features

### Users Can:

* Create and manage topics
* Create and edit posts
* Create and edit comments
* React & unreact to posts and comments
* Browse via an **Explore Homepage** (improves engagement)
* Search topics and posts easily
* Access **history tools**:

    * Search past comments (reply easily)
    * Search past posts (track ongoing discussions)
* Receive notifications when:

    * New posts appear in followed topics
    * Someone comments on their posts
* View a **Contribution Score**

    * Shows user activity levels
* View a **Reputation Score**

    * Flags users with consistently harmful or false content

### Admin Capabilities

Admins are extended users who can:

* Moderate and edit hateful or harmful content
* Manage or ban users
* Manage and edit topics

## Database UML

./Database.drawio

## Libraries

### Backend (Go)

* Routing: **chi**
* Database: **pgx + sqlc**
  * pgx > in-built go sql: Built for psql, so it is faster and supports more advanced psql commands.
  * pgxPool minimize the overhead of connection handshakes and authentication by having multiple open connections.
  * pgx provides better type safety when working with sqlc.
* Migrations: **goose**
* Auth: **jwt / oauth2**
* Validation: **go-playground**
* Logging: **zap**
* Testing: **testify**

### Frontend (React + TypeScript)

* Routing: **react-router**
* Server State: **react-query**
* Forms: **react-hook-form + zod**
* UI: **MUI**

## Build Timeline

| Phase              | Dates          | Goal                        |
| ------------------ | -------------- | --------------------------- |
| Phase 0            | 15–17 Dec      | Foundation & Design         |
| Phase 1            | 18–27 Dec      | Core Backend + DB           |
| Phase 2            | 28 Dec – 3 Jan | Core Frontend + Integration |
| **MID SUBMISSION** | **4 Jan**      | **End-to-End MVP**          |
| Phase 3            | 5–12 Jan       | Engagement Features         |
| Phase 4            | 13–20 Jan      | Trust, Analytics, Polish    |
| Phase 5            | 21–25 Jan      | Hardening & Demo Readiness  |