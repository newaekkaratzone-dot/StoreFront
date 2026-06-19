# StoreFront Management System

A Full-Stack web application that facilitates interactions between Sellers and Buyers, developed with Django REST Framework and React.js (TypeScript).

## Features

*   **Role-based Access Control**: Distinct roles for Sellers and Buyers.
*   **Seller Dashboard**: Create, edit, and manage product listings.
*   **Buyer Storefront**: Browse products, add to cart, and checkout.
*   **Persistent Cart**: Buyer's cart is saved across sessions.
*   **Price Snapshot & Inventory**: Order items capture prices at the time of purchase, and inventory is accurately decreased.

## Architecture

*   **Backend**: Python, Django, Django REST Framework (DRF). Uses SQLite for data storage and SimpleJWT for authentication.
*   **Frontend**: React.js with TypeScript and Vite. Styled with Tailwind CSS. State managed using Zustand.
*   **Separation of Concerns**: The backend serves strictly as an API, decoupled from the frontend UI.

## Setup Instructions

### Prerequisites
*   Python 3.x
*   Node.js & npm (for running the frontend)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pytest-django
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Testing

The backend includes comprehensive unit tests verifying core business logic such as inventory reduction upon checkout and role-based access.

To run the tests:
```bash
cd backend
pytest
```
