# Country Currency Exchange API

A robust RESTful API built with TypeScript, Node.js, and Express, utilizing Sequelize for ORM, designed to manage and provide comprehensive country data including currency exchange rates and estimated GDPs. 🌍 It integrates with external APIs to refresh data and dynamically generates summary images, offering a powerful backend for global data applications.

---

# Country Currency Exchange API

## Overview
This project is a RESTful API developed with TypeScript, Node.js, and Express, leveraging Sequelize as an ORM to interact with a MySQL database. It's designed to fetch, store, and serve comprehensive country data, including population, capital, region, currency codes, exchange rates, and estimated GDPs, with capabilities to refresh data from external sources and generate visual summaries.

## Features
-   **TypeScript**: Enhanced code quality and maintainability through strong typing.
-   **Node.js & Express**: A fast, scalable, and unopinionated web framework for building robust APIs.
-   **Sequelize ORM**: Simplifies database interactions with MySQL, providing robust model definitions and migrations.
-   **External API Integration**: Fetches real-time country data from `restcountries.com` and exchange rates from `open.er-api.com`.
-   **Data Refresh Mechanism**: An endpoint to programmatically update and synchronize country and currency data in the database.
-   **Dynamic Image Generation**: Creates a summary image displaying total countries, last refresh timestamp, and top countries by estimated GDP using `canvas`.
-   **Data Filtering and Sorting**: Endpoints supporting queries based on region, currency code, and sorting by estimated GDP.
-   **Country Search**: Retrieve specific country details by name with case-insensitive and partial matching.
-   **Data Management**: Functionality to delete country records from the database.
-   **Health and Status Checks**: An endpoint to retrieve API status, including total countries and last refresh time.

## Getting Started

To get this project up and running locally, follow these steps.

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/TemitopeAlawode/HNG-Stage-Two-Task.git
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Build TypeScript**:
    ```bash
    npm run build
    ```
4.  **Database Setup**: Ensure you have a MySQL server running and create a database for this project.
5.  **Run Migrations**:
    ```bash
    npx sequelize-cli db:migrate
    ```

### Environment Variables
Create a `.env` file in the root directory of the project with the following variables:

```dotenv
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

# Optional: For production deployments, use a single DATABASE_URL
# DATABASE_URL=mysql://your_mysql_user:your_mysql_password@your_db_host:3306/your_database_name?ssl={"rejectUnauthorized":false}
```

## API Documentation

### Base URL
The base URL for all API endpoints is typically `http://localhost:8080` in development.

### Endpoints

#### `POST /countries/refresh`
Triggers a refresh of country data and exchange rates from external APIs (`restcountries.com` and `open.er-api.com`), updates the database, and regenerates the summary image.

**Request**:
No request body required.

**Response**:
```json
{
  "message": "Refresh successful!!",
  "insertedCount": 195
}
```

**Errors**:
-   `503 Service Unavailable`: External data source unavailable.
-   `500 Internal Server Error`: Generic server error during data fetching or processing.

#### `GET /countries`
Retrieves a list of countries from the database, with optional filtering and sorting capabilities.

**Request**:
Query Parameters:
-   `region` (string, optional): Filter countries by region (e.g., `Africa`, `Europe`).
-   `currency` (string, optional): Filter countries by currency code (e.g., `USD`, `NGN`).
-   `sort` (string, optional): Sort results by estimated GDP.
    -   `gdp_desc`: Sort by estimated GDP in descending order.
    -   `gdp_asc`: Sort by estimated GDP in ascending order.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 789.50,
    "estimated_gdp": "440834000000.00",
    "flag_url": "https://restcountries.com/data/nga.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "United States",
    "capital": "Washington, D.C.",
    "region": "Americas",
    "population": 331002651,
    "currency_code": "USD",
    "exchange_rate": 1.00,
    "estimated_gdp": "22000000000000.00",
    "flag_url": "https://restcountries.com/data/usa.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```

**Errors**:
-   `400 Bad Request`: Invalid query parameter values or types.

#### `GET /countries/:name`
Retrieves detailed information for a single country by its name. Supports case-insensitive and partial matching.

**Request**:
Path Parameter:
-   `name` (string, required): The name or partial name of the country.

**Response**:
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 789.50,
  "estimated_gdp": "440834000000.00",
  "flag_url": "https://restcountries.com/data/nga.svg",
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `400 Bad Request`: Invalid or missing country name in the request.
-   `404 Not Found`: No country found matching the provided name.

#### `DELETE /countries/:name`
Deletes a country record from the database based on its name. Supports case-insensitive matching.

**Request**:
Path Parameter:
-   `name` (string, required): The name of the country to delete.

**Response**:
```json
{
  "message": "Country \"Nigeria\" deleted."
}
```

**Errors**:
-   `400 Bad Request`: Invalid or missing country name in the request.
-   `404 Not Found`: No country found matching the provided name to delete.
-   `500 Internal Server Error`: Generic server error during deletion.

#### `GET /status`
Provides a summary of the API's current status, including the total number of countries stored and the timestamp of the last data refresh.

**Request**:
No request body required.

**Response**:
```json
{
  "total_countries": 195,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: Generic server error while fetching status information.

#### `GET /countries/image`
Serves a dynamically generated PNG image that summarizes the country data, including total countries, last refresh date, and top 5 countries by estimated GDP.

**Request**:
No request body required.

**Response**:
A PNG image file.

**Errors**:
-   `404 Not Found`: Summary image has not been generated yet or is missing.
-   `500 Internal Server Error`: Failed to serve the summary image.

## Usage

Once the server is running, you can interact with the API using tools like Postman, Insomnia, or `curl`.

1.  **Start the Server**:
    ```bash
    npm run server
    # or npm start for production build
    ```
    The server will typically run on `http://localhost:8080`.

2.  **Initial Data Refresh**:
    It's recommended to populate your database with initial data by hitting the refresh endpoint. This fetches data from external APIs and stores it locally.
    ```bash
    curl -X POST http://localhost:8080/countries/refresh
    ```
    Wait for this operation to complete, as it populates the database and generates the summary image.

3.  **Get All Countries**:
    Retrieve a comprehensive list of all countries in the database.
    ```bash
    curl http://localhost:8080/countries
    ```

4.  **Filter Countries by Region and Sort by GDP**:
    Find countries in 'Africa' sorted by estimated GDP in descending order.
    ```bash
    curl "http://localhost:8080/countries?region=Africa&sort=gdp_desc"
    ```

5.  **Get a Specific Country by Name**:
    Fetch details for 'Nigeria'.
    ```bash
    curl http://localhost:8080/countries/nigeria
    ```

6.  **View API Status**:
    Check the total number of countries and the last data refresh timestamp.
    ```bash
    curl http://localhost:8080/status
    ```

7.  **Retrieve Summary Image**:
    Access the dynamically generated summary image (this will download a PNG file).
    ```bash
    curl http://localhost:8080/countries/image -o summary.png
    ```

## Technologies Used

| Technology    | Description                                                 | Link                                                            |
| :------------ | :---------------------------------------------------------- | :-------------------------------------------------------------- |
| **TypeScript**| Superset of JavaScript that adds static typing.             | [TypeScript](https://www.typescriptlang.org/)                   |
| **Node.js**   | JavaScript runtime for server-side execution.               | [Node.js](https://nodejs.org/en)                                |
| **Express.js**| Fast, unopinionated, minimalist web framework for Node.js.  | [Express.js](https://expressjs.com/)                            |
| **Sequelize** | Promise-based Node.js ORM for MySQL.                        | [Sequelize](https://sequelize.org/)                             |
| **MySQL**     | Open-source relational database management system.          | [MySQL](https://www.mysql.com/)                                 |
| **Axios**     | Promise-based HTTP client for the browser and Node.js.      | [Axios](https://axios-http.com/)                                |
| **Dotenv**    | Loads environment variables from a `.env` file.             | [Dotenv](https://www.npmjs.com/package/dotenv)                  |
| **Canvas**    | Node.js Canvas implementation for image generation.         | [Node-Canvas](https://github.com/Automattic/node-canvas)        |

## License

This project is licensed under the ISC License. See the [LICENSE](https://opensource.org/licenses/ISC) file for details.

## Author

**Temitope Alawode**

-   **LinkedIn**: [linkedin.com/in/temitopealawode](https://www.linkedin.com/in/temitope-alawode/)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)