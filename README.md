# AppLabAgent

App Lab Agent bir yapay zeka ajanlarını kullnarak insanların hem test hem uygulama yapabilecekleri hesapları baglayıp github hostinger n8n otomasyanlarını ve diğe ryapay zeka ajanlarını kullanıp uygulama cıkarbilecekleri bir uygulama geliştirme firmasına ait ve domain hosting ve kendi uygulamalarını geliştirdikleri bir uygulama 

## Project Management API

This platform provides comprehensive APIs for managing projects, tasks, and integrations.

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will run on port 3000 by default (or the PORT environment variable).

### Running Tests

```bash
npm test
```

## API Documentation

### Projects

#### Create Project
- **POST** `/api/projects`
- **Body:**
  ```json
  {
    "name": "Project Name",
    "description": "Project Description",
    "status": "active"
  }
  ```
- **Response:** Created project object with id and timestamps

#### Get All Projects
- **GET** `/api/projects`
- **Response:** Array of all projects

#### Get Project by ID
- **GET** `/api/projects/:id`
- **Response:** Project object

#### Get Project with Details (including tasks and integrations)
- **GET** `/api/projects/:id/details`
- **Response:** Project object with tasks and integrations arrays

#### Update Project
- **PUT** `/api/projects/:id`
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "description": "Updated Description",
    "status": "inactive"
  }
  ```
- **Response:** Updated project object

#### Delete Project
- **DELETE** `/api/projects/:id`
- **Response:** Deleted project object with success message

### Project-Task Mappings

#### Add Task to Project
- **POST** `/api/projects/:id/tasks/:taskId`
- **Response:** Success message

#### Get Project Tasks
- **GET** `/api/projects/:id/tasks`
- **Response:** Array of tasks for the project

#### Remove Task from Project
- **DELETE** `/api/projects/:id/tasks/:taskId`
- **Response:** Success message

### Project-Integration Mappings

#### Add Integration to Project
- **POST** `/api/projects/:id/integrations/:integrationId`
- **Response:** Success message

#### Get Project Integrations
- **GET** `/api/projects/:id/integrations`
- **Response:** Array of integrations for the project

#### Remove Integration from Project
- **DELETE** `/api/projects/:id/integrations/:integrationId`
- **Response:** Success message

### Tasks

#### Create Task
- **POST** `/api/tasks`
- **Body:**
  ```json
  {
    "title": "Task Title",
    "description": "Task Description",
    "status": "pending",
    "priority": "high"
  }
  ```
- **Response:** Created task object

#### Get All Tasks
- **GET** `/api/tasks`
- **Response:** Array of all tasks

#### Get Task by ID
- **GET** `/api/tasks/:id`
- **Response:** Task object

#### Update Task
- **PUT** `/api/tasks/:id`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "status": "completed",
    "priority": "medium"
  }
  ```
- **Response:** Updated task object

#### Delete Task
- **DELETE** `/api/tasks/:id`
- **Response:** Deleted task object with success message

### Integrations

#### Create Integration
- **POST** `/api/integrations`
- **Body:**
  ```json
  {
    "name": "GitHub",
    "type": "git",
    "config": {
      "apiKey": "your-api-key"
    }
  }
  ```
- **Response:** Created integration object

#### Get All Integrations
- **GET** `/api/integrations`
- **Response:** Array of all integrations

#### Get Integration by ID
- **GET** `/api/integrations/:id`
- **Response:** Integration object

#### Update Integration
- **PUT** `/api/integrations/:id`
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "config": {
      "apiKey": "new-api-key"
    },
    "status": "active"
  }
  ```
- **Response:** Updated integration object

#### Delete Integration
- **DELETE** `/api/integrations/:id`
- **Response:** Deleted integration object with success message

### Health Check

#### Check API Status
- **GET** `/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "message": "AppLabAgent API is running"
  }
  ```

## Data Models

### Project
```javascript
{
  id: string,           // Auto-generated UUID
  name: string,         // Required
  description: string,  // Optional, default: ""
  status: string,       // Optional, default: "active"
  createdAt: string,    // ISO timestamp
  updatedAt: string     // ISO timestamp
}
```

### Task
```javascript
{
  id: string,           // Auto-generated UUID
  title: string,        // Required
  description: string,  // Optional, default: ""
  status: string,       // Optional, default: "pending"
  priority: string,     // Optional, default: "medium"
  createdAt: string,    // ISO timestamp
  updatedAt: string     // ISO timestamp
}
```

### Integration
```javascript
{
  id: string,           // Auto-generated UUID
  name: string,         // Required
  type: string,         // Required
  config: object,       // Optional, default: {}
  status: string,       // Default: "active"
  createdAt: string,    // ISO timestamp
  updatedAt: string     // ISO timestamp
}
```

## Example Workflow

1. **Create a project:**
   ```bash
   curl -X POST http://localhost:3000/api/projects \
     -H "Content-Type: application/json" \
     -d '{"name": "My App", "description": "A great app"}'
   ```

2. **Create tasks:**
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Design UI", "priority": "high"}'
   ```

3. **Create integrations:**
   ```bash
   curl -X POST http://localhost:3000/api/integrations \
     -H "Content-Type: application/json" \
     -d '{"name": "GitHub", "type": "git", "config": {"repo": "myrepo"}}'
   ```

4. **Add task to project:**
   ```bash
   curl -X POST http://localhost:3000/api/projects/{projectId}/tasks/{taskId}
   ```

5. **Add integration to project:**
   ```bash
   curl -X POST http://localhost:3000/api/projects/{projectId}/integrations/{integrationId}
   ```

6. **Get project with all details:**
   ```bash
   curl http://localhost:3000/api/projects/{projectId}/details
   ```

## Architecture

The platform is built with:
- **Express.js** - Web framework
- **In-Memory Store** - Data persistence (projects, tasks, integrations)
- **Jest & Supertest** - Testing framework

The in-memory store provides:
- CRUD operations for projects, tasks, and integrations
- Project-task mappings
- Project-integration mappings
- Automatic cleanup when entities are deleted

