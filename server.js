const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Port configuration
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io events
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`Client joined room: ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`Client left room: ${roomId}`);
  });

  socket.on('task-update', (data) => {
    io.to(data.roomId).emit('task-updated', data);
    logger.info(`Task update in room ${data.roomId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});