# Fleet Management System

A basic fleet management system where users can log in, manage vehicles, submit GPS locations, and see the **total distance traveled** per vehicle.

## Project Overview
- **Auth:** Register/Login with **JWT**.
- **Vehicles:** CRUD (plate number, brand, model).
- **GPS:** Submit latitude/longitude per vehicle.
- **Distance:** Haversine calculation; dashboard table per vehicle.
- **charts & map views.** 

## Technologies Used
- **Backend:** Laravel (PHP 8.2+), MySQL, JWT
- **Frontend:** Next.js (React), Tailwind CSS, Context API
- **Tooling:** Vite (Laravel assets), Next dev server
- **Auth Storage:** Bearer token (Context/localStorage)

## Project Structure

├─ backend/ # Laravel API
│ ├─ app/ # Controllers, Models, Services, Requests
│ ├─ routes/api.php # REST endpoints
│ ├─ database/migrations # users, vehicles, gps_locations
│ ├─ database/seeders # sample data
│ ├─ composer.json
│ └─ ...
├─ frontend/ # Next.js app (App Router)
│ ├─ src/app/(app)/vehicles # vehicle CRUD page
│ ├─ src/app/(app)/dashboard # distance table
│ ├─ src/app/(app)/map # map page (optional)
│ ├─ src/app/login, register # auth screens
│ └─ src/context/AuthContext.tsx
└─ README.md


## Setup & Installation

### Prerequisites
- PHP 8.2+, Composer
- Node.js 18+ and npm
- MySQL 8+ (or MariaDB)

### 1) Backend (Laravel)
```bash
cd backend
cp .env.example .env
# edit .env -> set DB_DATABASE, DB_USERNAME, DB_PASSWORD

composer install
php artisan key:generate
php artisan jwt:secret

# create database 'fleet_db' (or the name you set) then:
php artisan migrate --seed

# run API server
php artisan serve --host=127.0.0.1 --port=8000

```
### 2) Frontend (Next.js)
```bash
cd frontend
cp .env.local.example .env.local
# default: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

npm install
npm run dev   # http://localhost:3000
```



