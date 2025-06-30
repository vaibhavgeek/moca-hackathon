# Kafka Chat Implementation

This application includes a pub/sub chat system using Apache Kafka with role-based access control for students and teachers.

## Features

- **Kafka Pub/Sub Chat**: Real-time messaging through the `mcp_agent_queen` channel
- **Role-Based Access Control**: 
  - Students: Restricted access (no cheating materials, exam answers, or adult content)
  - Teachers: Full access to all features
- **Message Persistence**: All messages are stored in Kafka topics
- **Real-time Updates**: Messages poll every 2 seconds

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001/api)
- `AWS_ACCESS_KEY_ID`: Your AWS access key for MSK authentication
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region (default: ap-south-1)

### 3. Start the Backend Server

```bash
npm run server
```

The server will start on port 3001 by default.

### 4. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

Or to run both frontend and backend together:

```bash
npm run dev:all
```

## Usage

1. Navigate to http://localhost:5173 (or your Vite dev server URL)
2. Connect your wallet using the login button
3. Go to the Chat section
4. Choose your role (Student or Teacher) and complete verification
5. Start chatting in the `mcp_agent_queen` channel

## Technical Details

### Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js server with Kafka integration
- **Message Broker**: AWS MSK (Managed Streaming for Apache Kafka)
- **Authentication**: AWS IAM SASL for Kafka, AIR Credential SDK for user verification

### Message Flow

1. User sends a message through the chat interface
2. Message is sent to the backend API (`/api/kafka/send`)
3. Backend publishes message to Kafka topic `mcp_agent_queen`
4. Frontend polls for new messages every 2 seconds (`/api/kafka/consume`)
5. Messages are displayed in real-time

### Role-Based Restrictions

For students, the following content is automatically filtered:
- Notion MCP access
- Cheating materials
- Exam/test answers
- Adult content
- Other inappropriate content

Teachers have unrestricted access to all features.

## API Endpoints

- `POST /api/kafka/send`: Send a message to Kafka
- `GET /api/kafka/consume?topic=mcp_agent_queen&limit=50`: Fetch recent messages
- `GET /api/health`: Health check endpoint

## Troubleshooting

1. **Connection Issues**: Ensure your AWS credentials are correctly configured
2. **Messages Not Appearing**: Check the browser console for errors and verify the backend is running
3. **Verification Fails**: Ensure you have the correct program IDs for student/teacher verification