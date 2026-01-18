# Digital Footprint Finder

Digital Footprint Finder is a web application that helps you discover your digital footprint online. It provides a set of tools to search for your username, email, phone number, and even reverse image search to find where your images are used.

## Features

- **Username Search:** Searches for a username across hundreds of social media and other websites.
- **Email Search:** Checks for email breaches to see if your email has been compromised.
- **Phone Search:** Gathers information about a phone number, such as the carrier and country.
- **Reverse Image Search:** Performs a reverse image search to find websites that use a specific image.

## Project Structure

This project is a monorepo that consists of several services:

- `frontend/`: The React-based frontend of the application, built with Vite.
- `api/`: The backend server that provides the API for the frontend. It is a Node.js/Express server.
- `backend/`: Another Node.js/Express server used for local development, likely containing the same API logic as `api/`.
- `sherlock/`: A submodule containing the Sherlock project, which is used for the username search.
- `phoneinfoga/`: A submodule containing the PhoneInfoga project, which is used for the phone number search.
- `python/`: Contains a Python script that acts as a wrapper for Sherlock.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [Python](https://www.python.org/) (version 3.x)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies for all services:
    ```bash
    npm run install-all
    ```

### Running the Application

To run the application locally, use the following command:

```bash
npm run dev
```

This will start the frontend and the backend services concurrently. The application will be available at `http://localhost:5173`.

## Deployment

This project can be deployed to platforms like [Railway.app](https://railway.app/) using the provided `Dockerfile`.

The `Dockerfile` sets up the environment, installs necessary dependencies for all services (frontend, api, backend, puppeteer dependencies), builds the frontend, and prepares the application for execution.

The `Dockerfile` is configured to:
- Build `phoneinfoga` from source.
- Install `sherlock` using `pip`.
- Install `chromium` for `puppeteer`.
- Conditionally build the `frontend` only if it has been built locally.

## Technologies Used

-   **Frontend:** React, Vite
-   **Backend:** Node.js, Express
-   **Username Search:** Sherlock
-   **Phone Search:** PhoneInfoga
-   **Image Search:** Puppeteer
-   **Deployment:** Docker, Railway.app