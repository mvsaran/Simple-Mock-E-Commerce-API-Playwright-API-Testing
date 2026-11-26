# Simple Mock E-Commerce API + Playwright API Testing

A beginner-friendly learning project that shows how to build a **Mock API** with **Node.js, Express, and TypeScript**, and how to write automated API tests (without a browser) using **Playwright Test**.

---

## 1. What Is a Mock API?

A **Mock API** is a lightweight, simulated version of a real backend service. Instead of connecting to a real database, payment gateway, or inventory system, it returns realistic fake (synthetic) JSON responses.

Think of it like a flight simulator for software: it looks and behaves like the real API over HTTP, but everything inside is controlled and safe to test.

---

## 2. Why QA Engineers and SDETs Build Mock Services

In real-world projects, QA engineers and SDETs build mock APIs for several important reasons:

- **Test before the real backend exists**: Frontend and QA teams can build and run tests while backend developers are still working.
- **Simulate hard-to-reproduce failures**: Real payment gateways rarely return `503 Service Unavailable`, `504 Gateway Timeout`, or `402 Payment Declined` on command. A mock API lets you trigger these exact failures with a simple HTTP header (`x-mock-scenario`).
- **Fast and reliable tests**: No real database setup, no network flakiness, and no accidental charges to real credit cards.
- **Independent, repeatable test runs**: Every test sees the exact same starting data every time it runs.

---

## Step-by-Step Guide: How to Build This Mock Server From Scratch (In Layman Terms)

If you are completely new to building APIs, think of building a mock server like **opening a practice restaurant kitchen**:
- **Node.js** is the kitchen electricity/power.
- **Express** is the waiter who listens to customer orders (HTTP requests) and brings back food (JSON responses).
- **JSON files** are the pre-cooked fake dishes sitting in the fridge (no real farm or database needed).
- **TypeScript** is a checklist that catches spelling/type mistakes before you open the kitchen.
- **Playwright** is your food inspector that automatically tests every dish.

### What Are the Requirements Before You Start?

You only need **3 basic things** on your computer:
1. **Node.js (v18 or newer)** & **npm** (installed automatically with Node.js) — lets you run JavaScript/TypeScript outside a web browser and download packages.
2. **A code editor** (such as VS Code) — to write and read your files.
3. **A terminal / command prompt** — to type commands like starting the server and running tests.

You do **NOT** need a database (no MySQL/MongoDB), a frontend website, or real payment keys.

### What Is the Very First Step to Start?

**Step 0 (The Starting Line): Create a folder and initialize the project.**

Before writing any code, you create an empty folder and tell Node.js, *"This folder is a new project."* You do that by creating `package.json`:

```bash
mkdir MOCKAPI
cd MOCKAPI
npm init -y
```

`package.json` is simply the project's **shopping list and command book** — it records which libraries you installed and shortcuts like `npm start` or `npm test`.

---

### Complete 7-Step Recipe to Build a Mock Server

1. **Step 1 — Install the core tools (`express`, `typescript`, `tsx`, `@playwright/test`)**
   Install Express (to handle web requests), TypeScript (for type safety), `tsx` (to run TypeScript directly while developing), and Playwright Test (to write automated API checks).
   - Files involved: `package.json`, `tsconfig.json`

2. **Step 2 — Create your fake (mock) data**
   Instead of setting up a real database, create a simple JSON file containing fake products (`id`, `name`, `price`, `category`, `stock`).
   - File: `src/data/products.json`

3. **Step 3 — Define your data shapes (TypeScript types)**
   Write down what a `Product`, an `OrderRequest`, and an `ErrorResponse` look like so your editor warns you if you mistype a field name.
   - File: `src/types/ecommerce.ts`

4. **Step 4 — Build the API endpoints (routes)**
   Each URL is like a different counter in your store:
   - `GET /health` (`src/routes/health.ts`) — answers *"Are you awake?"* with `200 OK` and `{"status": "UP"}`.
   - `GET /api/products` & `GET /api/products/:id` (`src/routes/products.ts`) — lists all 5 fake products or looks up 1 product by ID (returning `404` if missing or `400` if the ID isn't a positive whole number).
   - `POST /api/orders` (`src/routes/orders.ts`) — checks that the incoming order makes sense (valid `productId`, positive integer `quantity`, non-empty `customerName`, enough stock) before confirming the order (`201 Created`).

5. **Step 5 — Add failure & delay simulation (`x-mock-scenario`)**
   Create a small helper (`src/handlers/mockScenarioHandler.ts`) that looks at an optional header named `x-mock-scenario`. Depending on the value (`payment_failure`, `server_error`, `unavailable`, `timeout`, or an unknown value), it returns `402`, `500`, `503`, waits 3 seconds and returns `504`, or returns `400`.

6. **Step 6 — Wire everything together and start listening**
   - `src/middleware/logger.ts` prints every incoming request and status code to your terminal so you can watch what happens live.
   - `src/middleware/errorHandler.ts` catches broken JSON or unknown URLs and returns clean error JSON instead of crashing.
   - `src/app.ts` connects JSON parsing, logging, routes, and error handling.
   - `src/server.ts` opens the server on port `4001` (`http://localhost:4001`).

7. **Step 7 — Verify manually, then automate with Playwright**
   First test one or two endpoints manually using `curl` (see Section 7 below), then write automated checks in `tests/*.spec.ts` using Playwright's `APIRequestContext` so one command (`npm test`) verifies all 30 scenarios in seconds.

---

## How Do We Replace the Mock API With the Real API Once It Is Ready?

In real projects, the mock server is a **temporary stand-in** (like a stunt double). Once the backend team finishes the real service, you **do not throw away your Playwright tests**—you simply point those same tests at the real server!

Because all our tests use relative paths (`/health`, `/api/products`, `/api/orders`) instead of hardcoded URLs, switching from mock to real takes just a few practical steps:

### 1. Change the Target URL (`API_BASE_URL`)
`playwright.config.ts` already reads an optional `API_BASE_URL` environment variable:
- **When `API_BASE_URL` is not set**: Playwright boots your local mock server (`http://localhost:4001`).
- **When `API_BASE_URL` is set**: Playwright skips starting the mock server and runs the tests directly against the real API URL!

```bash
# Windows PowerShell (run against real QA/Staging server)
$env:API_BASE_URL="https://staging-api.yourcompany.com"; npm test

# macOS / Linux
API_BASE_URL="https://staging-api.yourcompany.com" npm test
```

### 2. Verify the "Contract" Matches
Check that the real backend returns the same JSON field names (`id`, `name`, `price`, `category`, `stock`, `orderId`, `status`, `totalAmount`) and HTTP status codes (`200`, `201`, `400`, `404`). If the real backend catches a mismatch (for example, returning `total_amount` instead of `totalAmount`), your Playwright tests catch that integration bug immediately!

### 3. Separate Mock-Only Failure Tests From Real API Tests
Real servers do **not** recognize our fake `x-mock-scenario` header (`payment_failure`, `server_error`, `unavailable`, `timeout`). Once you switch to the real server:
- Keep **contract & validation tests** (health check, product list, valid order, invalid quantity/missing fields) running against the real QA/Staging API.
- Tag or separate the **`x-mock-scenario` tests** (e.g., `@mock-only`) so they keep running against the mock server, or replace `payment_failure` with a real sandbox test card (like Stripe's declined test card).

### 4. Replace Hardcoded Test Data With Dynamic Data
Our mock server uses static data (`productId: 1`, `price: 79.99`, `stock: 15`) that never changes. A real database changes whenever orders are placed, so when moving to a real backend:
- Fetch a real product dynamically via `GET /api/products` inside the test instead of assuming `id: 1` always exists with `stock: 15`.
- Run tests against a **QA/Staging environment** (never real customer production data), and clean up test orders afterward if needed.

### 5. Add Authentication Headers (If Required)
Real APIs usually require a login token or API key. Once the real backend is ready, add your auth header in `playwright.config.ts` (`extraHTTPHeaders`) or obtain a token in a setup step before running `tests/*.spec.ts`.

### 6. Keep or Retire the Mock Server
- **If an application (like a frontend app) was calling `http://localhost:4001`**, update its `.env` / config file from `http://localhost:4001` to the real backend URL (e.g., `https://api.yourcompany.com`).
- You can then either delete `src/` or keep the mock server around for local offline development and edge-case failure testing (`503`, `504`).

---

## 3. Project Architecture

```text
+-----------------------------------+
|  Playwright API Tests (No Browser)|
|  tests/*.spec.ts                  |
|  - Uses APIRequestContext         |
|  - Reads test-data/*.json         |
+-----------------+-----------------+
                  | HTTP (http://localhost:4001)
                  v
+-----------------------------------+
|  Express Mock Server              |
|  src/app.ts & src/server.ts       |
|  1. express.json() (parse body)   |
|  2. requestLogger (log method/url)|
|  3. Routes:                       |
|     - GET  /health                |
|     - GET  /api/products          |
|     - GET  /api/products/:id      |
|     - POST /api/orders            |
|        -> Payload & stock check   |
|        -> mockScenarioHandler     |
|  4. notFoundHandler & errorHandler|
+-----------------+-----------------+
                  | Reads static JSON
                  v
+-----------------------------------+
|  src/data/products.json           |
|  (5 synthetic store products)     |
+-----------------------------------+
```

**Important design note:** Request validation happens **before** the `x-mock-scenario` header is applied. That means invalid payloads always return `400` or `404` first, even if a failure scenario header is sent. Also, creating an order does not mutate `products.json` in memory so every Playwright test stays completely independent.

---

## 4. Folder Structure and What Each File Does

```text
MOCKAPI/
├── src/
│   ├── data/
│   │   └── products.json              # 5 synthetic products (headphones, keyboard, mouse, monitor, webcam)
│   ├── handlers/
│   │   └── mockScenarioHandler.ts     # Reads x-mock-scenario header and simulates 402, 500, 503, 504, or 400
│   ├── middleware/
│   │   ├── logger.ts                  # Logs every request method, URL, status code, and duration
│   │   └── errorHandler.ts            # Returns clean JSON for unknown routes (404) and invalid JSON/errors
│   ├── routes/
│   │   ├── health.ts                  # GET /health endpoint
│   │   ├── products.ts                # GET /api/products and GET /api/products/:id endpoints
│   │   └── orders.ts                  # POST /api/orders endpoint with validation + scenario control
│   ├── types/
│   │   └── ecommerce.ts               # TypeScript interfaces for products, orders, errors, and scenarios
│   ├── app.ts                         # Creates and wires up the Express application
│   └── server.ts                      # Starts the HTTP server on PORT (default: 4001)
├── tests/
│   ├── helpers/
│   │   └── apiAssertions.ts           # Shared helper assertions for Content-Type and error JSON payloads
│   ├── health.spec.ts                 # Tests 1–3: Health check endpoint tests
│   ├── products.spec.ts               # Tests 4–13: Product listing and single-product tests
│   └── orders.spec.ts                 # Tests 14–30: Order creation, scenario control, and validation tests
├── test-data/
│   ├── products.json                  # Reusable test expectations for health & product tests
│   └── orders.json                    # Reusable valid, invalid, and scenario test payloads
├── playwright.config.ts               # Playwright API config (baseURL, list + HTML reporters, auto webServer)
├── tsconfig.json                      # TypeScript compiler configuration
├── package.json                       # Project dependencies and npm scripts
└── README.md                          # This guide
```

---

## 5. How to Install Dependencies

Make sure you have **Node.js** (v18 or newer) and **npm** installed, then run:

```bash
npm install
```

> **Note:** Because this project only uses Playwright's `APIRequestContext` (no browser testing), you do **not** need to download Playwright browser binaries.

---

## 6. How to Start the Mock Service

You have two ways to run the server:

### Development mode (auto-restarts when you edit code)
```bash
npm run dev
```

### Production mode (compile TypeScript first, then run JavaScript)
```bash
npm run build
npm start
```

By default, the server listens on port **4001**. You can override it with the `PORT` environment variable:

```bash
# Windows PowerShell
$env:PORT=5000; npm start

# macOS / Linux
PORT=5000 npm start
```

---

## 7. How to Manually Test APIs Using `curl`

Once the server is running on `http://localhost:4001`, try these commands:

### 1) Health Check
```bash
curl -i http://localhost:4001/health
```

### 2) Get All Products
```bash
curl -i http://localhost:4001/api/products
```

### 3) Get Product by ID (Existing vs Non-Existing)
```bash
curl -i http://localhost:4001/api/products/1
curl -i http://localhost:4001/api/products/9999
```

### 4) Create Order (Success)
```bash
curl -i -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"productId\": 1, \"quantity\": 2, \"customerName\": \"Test Customer\"}"
```

### 5) Create Order With Mock Scenarios
```bash
# Payment failure (402)
curl -i -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -H "x-mock-scenario: payment_failure" \
  -d "{\"productId\": 1, \"quantity\": 2, \"customerName\": \"Test Customer\"}"

# Timeout after 3 seconds (504)
curl -i -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -H "x-mock-scenario: timeout" \
  -d "{\"productId\": 1, \"quantity\": 2, \"customerName\": \"Test Customer\"}"
```

---

## 8. How to Run Playwright Tests

`playwright.config.ts` is configured with `webServer` (`reuseExistingServer: true`), so Playwright will automatically start the mock API if it is not already running, or reuse your running server.

```bash
# Run all 30 API tests
npm test

# Run tests in a specific file
npm run test:file -- tests/orders.spec.ts

# Shortcut scripts for individual test files
npm run test:health
npm run test:products
npm run test:orders
```

---

## 9. How to View the HTML Report

After running `npm test`, Playwright saves a visual report in `playwright-report/`. Open it in your browser with:

```bash
npm run report
```

---

## 10. Explaining the `x-mock-scenario` Header

The `POST /api/orders` endpoint inspects the optional HTTP request header **`x-mock-scenario`**. If omitted, it defaults to `success`.

| Header Value | HTTP Status | Simulated Behavior |
| :--- | :---: | :--- |
| *(not provided)* or `success` | `201` | Normal order confirmation with `orderId`, `status: "CONFIRMED"`, product info, and `totalAmount`. |
| `payment_failure` | `402` | Simulates a declined payment card/provider. |
| `server_error` | `500` | Simulates an unexpected crash inside the backend. |
| `unavailable` | `503` | Simulates a downstream service being temporarily offline/maintenance. |
| `timeout` | `504` | Waits **3 seconds (3000ms)**, then returns a Gateway Timeout error. |
| *(any unknown value)* | `400` | Rejects the unsupported scenario name and lists valid options. |

---

## 11. What Each Test Verifies (In Simple Language)

### Health Tests (`tests/health.spec.ts`)
1. **Health endpoint returns 200**: Confirms the server is alive and returns JSON.
2. **Status is UP**: Confirms the `status` field equals `"UP"`.
3. **Service name is correct**: Confirms the `service` field equals `"Mock E-Commerce API"`.

### Product Tests (`tests/products.spec.ts`)
4. **Get all products returns 200**: Confirms the catalog endpoint responds successfully with JSON.
5. **Products response is an array**: Confirms the response is a JSON list (`[]`), not an object or string.
6. **At least 5 products are returned**: Confirms the catalog has the expected minimum of 5 items.
7. **Each product contains required fields**: Checks every product has integer `id`, non-empty `name`, numeric `price`, non-empty `category`, and integer `stock`.
8. **Product price is greater than zero**: Prevents free or negative-priced catalog bugs.
9. **Product stock is non-negative**: Ensures inventory counts are `0` or higher.
10. **Get existing product by ID returns 200**: Confirms fetching product `1` succeeds.
11. **Product ID in response matches requested ID**: Confirms the returned product matches ID `1` and its expected details.
12. **Get non-existing product returns 404**: Confirms asking for ID `9999` returns a clear Not Found error.
13. **Invalid product ID is handled appropriately**: Confirms invalid IDs like `abc`, `0`, and `-5` return `400` with a helpful validation message.

### Order Tests (`tests/orders.spec.ts`)
14. **Valid order returns 201**: Confirms creating a valid order succeeds with `201 Created`.
15. **Order ID is returned**: Confirms a generated `orderId` (e.g., `ORD-XXXXXXXX`) is present.
16. **Order status is CONFIRMED**: Confirms `status` equals `"CONFIRMED"`.
17. **Total amount is calculated correctly**: Confirms `totalAmount` equals `product.price * quantity` rounded cleanly to 2 decimal places.
18. **Payment failure scenario returns 402**: Confirms `x-mock-scenario: payment_failure` returns `402`.
19. **Server error scenario returns 500**: Confirms `x-mock-scenario: server_error` returns `500`.
20. **Service unavailable scenario returns 503**: Confirms `x-mock-scenario: unavailable` returns `503`.
21. **Timeout scenario returns 504 after configured delay**: Confirms the API waits ~3 seconds and returns `504`.
22. **Unsupported scenario returns 400**: Confirms an unknown `x-mock-scenario` header is rejected with `400`.
23. **Missing product ID returns 400**: Confirms omitting `productId` fails validation.
24. **Missing quantity returns 400**: Confirms omitting `quantity` fails validation.
25. **Quantity zero returns 400**: Boundary test ensuring `quantity: 0` is rejected.
26. **Negative quantity returns 400**: Boundary test ensuring `quantity: -2` is rejected.
27. **Decimal quantity returns 400**: Ensures fractional quantities like `1.5` are rejected.
28. **Missing customer name returns 400**: Ensures orders without `customerName` are rejected.
29. **Non-existing product ID returns 404**: Ensures ordering a non-existent product returns `404`.
30. **Order quantity greater than available stock returns 400**: Boundary test ensuring orders cannot exceed stock.

---

## 12. Expected Results for Success and Failure Scenarios

### Success Order (`POST /api/orders` -> `201 Created`)
```json
{
  "orderId": "ORD-1A2B3C4D",
  "status": "CONFIRMED",
  "product": {
    "id": 1,
    "name": "Wireless Studio Headphones",
    "price": 79.99,
    "category": "Audio"
  },
  "quantity": 2,
  "customerName": "Test Customer",
  "totalAmount": 159.98
}
```

### Error Response Format (`400`, `402`, `404`, `500`, `503`, `504`)
Every error returns consistent JSON with `error` and `message`:
```json
{
  "error": "Payment Declined",
  "message": "Payment declined for this mock order."
}
```
