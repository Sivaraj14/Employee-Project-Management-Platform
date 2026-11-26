# Employee & Project Management Platform

React client for the Spring Boot and MySQL application.

## Run locally

1. Start the Spring Boot API in `D:\SpringBootProjects\HR_Management_System` (see that project’s README or run `.\mvnw.cmd spring-boot:run`). It listens on port 8080.
2. From this folder, run `npm start`. The development proxy forwards API requests to Spring Boot.
3. To point a deployed frontend at another API, copy `.env.example` to `.env` and set `REACT_APP_API_BASE_URL` before building.

With `ACTIVATION_MODE=local`, employee and manager signup returns a local activation link. Set SMTP variables and `ACTIVATION_MODE=email` to send activation emails.
