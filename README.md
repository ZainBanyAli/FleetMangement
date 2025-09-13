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
## Root Directory

- `/fleet-management`
  - `backend/` – **Laravel API**
    - `app/` 
      - `Http/Controllers/` – API controllers  
        - `AuthController.php` – register/login (JWT)  
        - `VehicleController.php` – vehicles CRUD  
        - `GpsLocationController.php` – GPS points  
        - `DashboardController.php` – totals/summary  
        - `Concerns/ApiResponse.php` – unified API responses
      - `Http/Requests/` – Form validation  
        - `VehicleRequest.php`, `LocationRequest.php`
      - `Models/`   
        - `User.php`, `Vehicle.php`, `GpsLocation.php`
      - `Services/` 
        - `VehicleService.php`, `GpsLocationService.php`, `DashboardService.php`
      - `Support/` – Helpers  
        - `Geo.php` – Haversine distance calculation
    - `routes/` – Routes definitions  
      - `api.php` – REST endpoints
    - `database/` – DB migrations & seeders  
      - `migrations/` – `users`, `vehicles`, `gps_locations`, jobs/cache  
      - `seeders/` – `UsersTableSeeder`, `VehiclesTableSeeder`, `GpsLocationsTableSeeder`
    - `config/` – app, auth, cors, database, queue, etc.
    - `public/` 
    - `composer.json` – PHP dependencies
  - `frontend/` – **Next.js (App Router)**
    - `src/app/` – Routes & pages
      - `(app)/vehicles/` – Vehicle CRUD page
      - `(app)/dashboard/` – Distance table page
      - `(app)/map/` – Map view 
      - `login/`, `register/` – Auth screens
      - `layout.tsx`, `globals.css` – App shell & global styles
    - `src/components/` – UI components  
      - `AppShell.tsx`, `Nav.tsx`, `VehicleForm.tsx`, `ui/*`
    - `src/context/` – State management  
      - `AuthContext.tsx` – stores JWT & user state
    - `src/lib/` – Utilities  
      - `api.ts` – API client (uses `NEXT_PUBLIC_API_URL`)  
      - `utils.ts`
    - `public/` – static assets (icons/images)
    - `package.json`, `package-lock.json` – JS deps & scripts
  - `README.md` – How to run the project
  - `.gitignore` – Ignore env/build/runtime files



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



