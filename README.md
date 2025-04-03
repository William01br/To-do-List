# To-Do List API

This project is a robust backend API dedicated to managing to-do lists. It demonstrates advanced practices and modern technologies while following a functional programming paradigm and the Single Responsibility Principle throughout its file and directory structure.

---

### Installation & Setup Guide

1. **Clone the Repository:**

   ```bash
   git clone git@github.com:William01br/To-do-List.git
   ```

2. **Install Docker:**  
   Ensure Docker and Docker Compose are installed on your machine.

   - [Get Docker](https://docs.docker.com/get-docker/)
   - [Docker Compose Installation](https://docs.docker.com/compose/install/)

3. **Set Up Environment Variables:**  
   Create a `.env` file in the project root with the following variables:

   - `GOOGLE_API_KEY`: Your Google API key for OAuth 2.0 (see [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)).
   - `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_CLOUD_NAME`: Your Cloudinary credentials (see [Cloudinary Documentation](https://cloudinary.com/documentation)).
   - **Email Service Configuration:**  
      For sending emails, use Ethereal Email. You can generate test credentials at [Ethereal Email](https://ethereal.email/create).

4. **Build & Run the Application:**  
   With Docker Compose configured, simply run:

   ```bash
   docker compose up --build
   ```

   This command will start the Node.js service along with the required development and test databases.

5. **Access API Documentation:**  
   Once the application is running, you can view the API documentation via Swagger UI at:  
   `http://localhost:3000/docs`

---

### Features

- **Task and List Management:**  
  Users can create, update, and delete tasks as well as lists. Each user owns multiple lists, and each list contains its own set of tasks, ensuring an organized and scalable structure.

- **Cloudinary Integration:**  
  Users can change their avatar by uploading images directly to Cloudinary, enhancing the personalization of their profile.

- **Password Recovery:**  
  The system supports password change functionalities, complete with email notifications sent via NodeMailer, providing a secure and user-friendly recovery process.

- **Robust Authentication & Authorization:**

  - Session management is handled using cookies along with JWT for secure and efficient user authentication.
  - OAuth 2.0 is implemented using the Google Strategy, allowing seamless authorization through Google accounts.

- **Performance Optimization:**  
  Routes that return lists and tasks are paginated to improve performance, ensuring a responsive experience even with large data sets.

- **Security Measures:**  
  User passwords are encrypted using bcrypt, maintaining high standards of security.

- **Comprehensive Testing:**  
  The application includes both integration and unit tests, executed with Jest and Supertest, ensuring code reliability and maintainability.

- **Containerized Deployment:**  
  The entire application runs within Docker containers. Docker Compose orchestrates the Node application alongside the development and test databases, simplifying setup and deployment.

- **Technology Stack:**  
  Built with Node.js (using JavaScript), this API leverages PostgreSQL as its database, showcasing modern development practices and ensuring high performance and reliability.

- **Swagger UI Documentation:**  
   Full API documentation is available via Swagger UI, making it easier for developers to understand and interact with the API.

This project demonstrates a wide range of skills from backend development and API design to secure user authentication, cloud integrations, and modern DevOps practices. It is a testament to applying industry-standard technologies and best practices to deliver a scalable, maintainable, and well-documented application.

---

### Running the Tests

1. **Ensure Containers Are Active:**  
   Make sure your Docker containers are running (Node.js service and databases) by executing:

   ```bash
   docker compose up
   ```

2. **Use the Test Environment:**  
   The project includes a `.env.test` file which overrides environment variables to connect with the test database. This file ensures your tests run in isolation from your development database.
3. **Run the Tests:**  
   With the application running and containers active, open a terminal in the project directory and run:

   ```bash
   npm test
   ```

   This command will execute all unit and integration tests defined in the project.

---

### License and Legal Information

This project is licensed under the MIT License, which means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. The license ensures that the project remains open and accessible to everyone, while also protecting the original authors from liability. For more details, please refer to the LICENSE file in the repository.
