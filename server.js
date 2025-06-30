import express from 'express';
import cors from 'cors';
import { Kafka, logLevel } from 'kafkajs';
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// OAuth bearer token provider for AWS MSK
async function oauthBearerTokenProvider(region) {
  const authTokenResponse = await generateAuthToken({ region });
  return {
    value: authTokenResponse.token
  };
}

// Kafka configuration with reduced log level
const kafka = new Kafka({
  clientId: 'chat-kafka-server',
  brokers: process.env.MSK_BOOTSTRAP_SERVERS?.split(',') || [
    'b-3-public.commandhive.aewd11.c4.kafka.ap-south-1.amazonaws.com:9198',
    'b-2-public.commandhive.aewd11.c4.kafka.ap-south-1.amazonaws.com:9198',
    'b-1-public.commandhive.aewd11.c4.kafka.ap-south-1.amazonaws.com:9198'
  ],
  ssl: true,
  sasl: {
    mechanism: 'oauthbearer',
    oauthBearerProvider: () => oauthBearerTokenProvider('ap-south-1')
  },
  connectionTimeout: 3000,
  requestTimeout: 25000,
  retry: {
    initialRetryTime: 100,
    retries: 3
  },
  logLevel: logLevel.ERROR // Only show errors, not warnings or info
});

// Create a single persistent consumer instance
const consumer = kafka.consumer({ 
  groupId: `chat-consumer-${Date.now()}`, // Unique group ID to avoid conflicts
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000,
});

let isConsumerConnected = false;
let consumerRunning = false;

// Initialize consumer connection
async function initializeConsumer() {
  if (isConsumerConnected) return;
  
  try {
    console.log('🔄 Initializing Kafka consumer...');
    await consumer.connect();
    await consumer.subscribe({ topic: 'mcp_agent_queen', fromBeginning: true });
    isConsumerConnected = true;
    console.log('✅ Kafka consumer connected and subscribed');
  } catch (error) {
    console.error('❌ Failed to initialize consumer:', error.message);
    isConsumerConnected = false;
  }
}

// Initialize consumer on server start
initializeConsumer();

// Send message endpoint
app.post('/api/kafka/send', async (req, res) => {
  const producer = kafka.producer();
  
  try {
    const { topic, key, value } = req.body;
    
    console.log('📤 Received send request:', { topic, key, value });
    
    if (!topic || !value) {
      return res.status(400).json({
        success: false,
        error: 'Topic and value are required'
      });
    }

    await producer.connect();
    
    const message = {
      key: key || null,
      value: JSON.stringify(value)
    };

    const result = await producer.send({
      topic,
      messages: [message],
    });

    console.log('✅ Message sent successfully:', result);
    
    await producer.disconnect();

    res.json({
      success: true,
      message: 'Message sent successfully',
      metadata: result,
    });

  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    await producer.disconnect();
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Store messages in memory (in production, use Redis or database)
const messageStore = new Map();
const MAX_MESSAGES_PER_TOPIC = 100;

// Consume messages endpoint - using persistent consumer
app.get('/api/kafka/consume', async (req, res) => {
  try {
    const { topic, limit = 10 } = req.query;
    
    console.log('📥 Consume request:', { topic, limit });
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    // Ensure consumer is connected
    if (!isConsumerConnected) {
      await initializeConsumer();
    }

    // Start consumer if not already running
    if (!consumerRunning) {
      consumerRunning = true;
      
      consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const messageData = {
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: message.value?.toString(),
            timestamp: message.timestamp
          };
          
          console.log('📨 New message received:', {
            topic,
            partition,
            offset: message.offset,
            value: message.value?.toString()
          });
          
          // Store message in memory
          if (!messageStore.has(topic)) {
            messageStore.set(topic, []);
          }
          
          const topicMessages = messageStore.get(topic);
          topicMessages.push(messageData);
          
          // Keep only the latest messages
          if (topicMessages.length > MAX_MESSAGES_PER_TOPIC) {
            topicMessages.shift();
          }
        },
      }).catch(error => {
        console.error('❌ Consumer run error:', error.message);
        consumerRunning = false;
      });
    }

    // Get messages from store
    const topicMessages = messageStore.get(topic) || [];
    const sortedMessages = topicMessages
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      .slice(-Number(limit));

    console.log(`📊 Returning ${sortedMessages.length} messages for topic ${topic}`);

    res.json({
      success: true,
      messages: sortedMessages,
      count: sortedMessages.length
    });

  } catch (error) {
    console.error('❌ Error in consume endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to consume messages',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    consumerConnected: isConsumerConnected,
    consumerRunning: consumerRunning
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (isConsumerConnected) {
    await consumer.disconnect();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (isConsumerConnected) {
    await consumer.disconnect();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Kafka consumer group: chat-consumer-${Date.now()}`);
});