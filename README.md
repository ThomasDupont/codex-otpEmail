# Email OTP API

Minimal Express API that issues and validates email OTP requests with rate limits and attempt limits.

## Features

- `POST /otp/request` to generate an OTP request.
- `POST /otp/validation` to validate a passcode.
- Rate limiting:
  - 120 seconds between requests for the first three requests.
  - 60 minutes from the 4th request.
- Attempt limiting:
  - After more than 10 failed attempts, wait 60 minutes before requesting a new OTP.
- OTP validity: 60 minutes.

## Install

```bash
npm install
```

## Run checks

```bash
npm run check
```

## Start the server

```bash
npm run build
node dist/main.js
```

The server listens on `http://localhost:3000`.

## API

### POST /otp/request

Generates a new OTP request. The server derives previous request data from storage.

Request body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "email": "user@example.com",
  "requestedAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T01:00:00.000Z",
  "passcode": "123456",
  "waitMs": 120000,
  "nextAllowedAt": "2024-01-01T00:02:00.000Z"
}
```

### POST /otp/validation

Validates the passcode for an existing OTP request.

Request body:

```json
{
  "email": "user@example.com",
  "requestedAt": "2024-01-01T00:00:00.000Z",
  "inputPasscode": "123456"
}
```

Response:

```json
{
  "isValid": true,
  "failedAttempts": 0
}
```

## Notes

- This API uses an in-memory repository. Restarting the server clears data.
- `requestedAt` is used to identify which OTP request to validate.
