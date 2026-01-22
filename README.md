# Netopia Payments Integration (Elysia + Bun)

A standalone **Elysia** server running on **Bun**, designed to handle Netopia payment processing.


## Setup

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Configure Environment**:
    Ensure your `.env` file is populated with valid Netopia credentials (see `.env.example` or existing `.env`).
    ```env
    NETOPIA_API_KEY=...
    NETOPIA_POS_SIGNATURE=...
    NETOPIA_SANDBOX_ENDPOINT=...
    ```

3.  **Run Development Server**:
    ```bash
    bun dev
    ```
    Server runs at: `http://localhost:3000`

## API Endpoints

All endpoints are prefixed with `/api`.

### 1. Health Check
- **URL**: `/api/payment/health`
- **Method**: `GET`
- **Description**: Verify the service is running.
- **Response**: `{ "status": "ok", "timestamp": "..." }`

### 2. Payment Actions
- **URL**: `/api/payment`
- **Method**: `POST`
- **Body**: JSON
- **Supported Actions**:

    #### Start Payment
    Initiates a new payment request to Netopia.
    ```json
    {
      "action": "start",
      "payload": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "amount": 100 // Example
      }
    }
    ```

    #### Verify Auth (3DS)
    Verifies a 3D Secure authentication.
    ```json
    {
      "action": "verifyAuth",
      "verify": {
        "paymentId": "PAYMENT_ID",
        "authData": { ... }
      }
    }
    ```

    #### Check Status
    Checks the status of a payment.
    ```json
    {
      "action": "status",
      "status": {
        "paymentId": "PAYMENT_ID" 
        // OR
        "orderID": "ORDER_ID"
      }
    }
    ```

### 3. Payment Callback (IPN)
- **URL**: `/api/payment/callback`
- **Method**: `POST`
- **Description**: Webhook endpoint for Netopia IPN checks.