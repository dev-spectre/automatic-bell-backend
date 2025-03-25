# Automatic Bell - Backend Server

## Overview

The backend server for Automatic Bell is built using **Hono.js** and **TypeScript**, with **Prisma** as the database ORM. It manages authentication, maps the control unit’s IP address for communication, and provides APIs for schedule management.

## Technologies Used

- **Framework:** Hono.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Hosting:** Cloudflare Workers

## Features

- User authentication (Signup, Sign-in, Password Reset)
- Control unit IP address mapping
- Secure authentication using JWT

## Installation

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- PostgreSQL (or another Prisma-compatible database)

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/dev-spectre/automatic-bell-backend.git
   cd automatic-bell-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   Create  `.env` and `.dev.vars` files and set the following:
   ```env
    DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=<your api key>"
    DIRECT_URL="postgres://<username>:<password>@<host>:<port>/defaultdb?sslmode=require"
    JWT_KEY="your secret key"
    NOISE_LENGTH="<int>"
    SALT_LENGTH="<int>"
    PBKDF2_ITERATION="<int>"
    PBKDF2_LENGTH="<int>"
    DIGEST="sha512"
   ```
4. Initialize Prisma:
   ```sh
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /user/signup` - Register a new user
- `POST /user/signin` - Authenticate user and return JWT
- `PUT /user/password/reset` - Reset user password
- `GET /user/verify` - Verify user JWT
- `DELETE /user/key` - Delete user signin key

### Control Unit

- `POST /device/` - Register control unit
- `GET /device/:key` - Fetch control unit IP
- `GET /device/` - Fetch control unit info
- `PUT /device/` - Update control unit IP
- `PUT /device/assign` - Assign control unit to user

## Deployment

To deploy the backend, set up a PostgreSQL database, configure environment variables, and run:

```sh
npm run deploy
```

## Troubleshooting

### Database Issues

- Ensure PostgreSQL is running and `DATABASE_URL` is correct.
- Run migrations if the database schema is outdated:
  ```sh
  npx prisma migrate deploy
  ```

## Contributing

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

