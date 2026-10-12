# WorkVoice

# WorkVoice AI – Worker Grievance Management Platform

WorkVoice AI is a full-stack worker grievance management platform designed to help workers raise workplace complaints, track their status, and communicate with worksite owners. It aims to make workplace issue reporting and resolution more organized and transparent.

## Features

- **Worker Management:** Worker registration, login, and profile management.
- **Worksite Management:** Create and manage worksites and assign workers.
- **Complaint Management:** Raise complaints related to salary, workplace conditions, equipment, payments, and other work-related issues.
- **Complaint Tracking:** Track complaint status and view updates.
- **Owner Dashboard:** Manage worksites, assigned workers, and worker complaints.
- **AI-Based Complaint Support:** Use Python and Flask to classify complaints and retrieve relevant workplace policy information.
- **RAG-Based Responses:** Retrieve relevant policy documents using embeddings and FAISS to generate context-based responses.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| AI Service | Python, Flask |
| Retrieval | RAG, Sentence Transformers, FAISS |
| Language Module | Java, OOP concepts |

## Project Structure

```text
WorkVoice/
├── frontend/       # User interface
├── backend/        # Express APIs and business logic
├── ai-service/     # Python Flask AI service
├── java-module/    # Java OOP module
├── database/       # Database scripts
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3
- MySQL Server
- Java JDK (for the Java module)

## Setup and Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/SNEHA5605/WorkVoice.git
cd WorkVoice
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure your local database credentials and required environment variables.

Example:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=workvoice
PORT=3000
```

Use the actual variable names expected by your backend code. Never commit your real `.env` file or passwords to GitHub.

Run the backend using the start script defined in `backend/package.json`, for example:

```bash
npm start
```

### 3. Set up the database

- Start MySQL Server.
- Create the database and tables using the SQL scripts provided in the `database` directory.
- Update the backend environment variables with your local database configuration.

### 4. Run the AI service

Open a separate terminal:

```bash
cd ai-service
pip install -r requirements.txt
```

Configure the required environment variables if needed, then run the Flask application using the entry-point file specified in the project.

**Note:** The AI service may download model files on its first run and may require an internet connection.

### 5. Run the frontend

Open the frontend files using your local development setup or a local static server. Ensure the backend API URL in the frontend configuration matches the running backend.

### 6. Run the Java module (optional)

Compile and run the Java source files from the `java-module` directory using the Java JDK. This module demonstrates complaint-handling rules and OOP concepts.

## Security

- Keep `.env` files out of version control.
- Do not publish database passwords, API keys, or other secrets.
- Use `.env.example` files with placeholder values to document required configuration.
- Configure your own local credentials before running the project.

## Future Improvements

- Notifications for complaint status updates.
- Enhanced complaint analytics and reporting.
- Role-based access control and additional administrative workflows.
- Improved deployment and automated testing.

## Author

**Sneha Sagade**

GitHub: [SNEHA5605](https://github.com/SNEHA5605)

---

*WorkVoice AI – Making workplace grievance reporting more organized and transparent.*
