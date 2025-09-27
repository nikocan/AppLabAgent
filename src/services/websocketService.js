// App Lab Agent - WebSocket Service
// Real-time iletişim ve bildirim servisi

const WebSocket = require('ws');
const EventEmitter = require('events');
const http = require('http');

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.wss = null;
    this.clients = new Map();
    this.rooms = new Map();
    this.heartbeatInterval = 30000; // 30 saniye
    this.heartbeatTimer = null;
  }

  // WebSocket sunucusunu başlat
  initialize(server, options = {}) {
    this.wss = new WebSocket.Server({
      server,
      path: options.path || '/ws',
      clientTracking: true
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.startHeartbeat();
    console.log('WebSocket sunucusu başlatıldı');
  }

  // HTTP sunucusu olmadan standalone başlat
  startStandalone(port = 8080, options = {}) {
    const server = http.createServer();
    this.initialize(server, options);
    
    server.listen(port, () => {
      console.log(`WebSocket sunucusu ${port} portunda çalışıyor`);
    });
  }

  // Yeni bağlantıyı işle
  handleConnection(ws, request) {
    const clientId = this.generateClientId();
    const client = {
      id: clientId,
      ws,
      userId: null,
      rooms: new Set(),
      lastPing: Date.now(),
      connectedAt: new Date().toISOString(),
      metadata: {}
    };

    this.clients.set(clientId, client);
    
    // Event listener'ları ekle
    ws.on('message', (message) => {
      this.handleMessage(clientId, message);
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    ws.on('pong', () => {
      if (this.clients.has(clientId)) {
        this.clients.get(clientId).lastPing = Date.now();
      }
    });

    // Bağlantı onay mesajı gönder
    this.sendToClient(clientId, {
      type: 'connection_established',
      clientId,
      timestamp: new Date().toISOString()
    });

    this.emit('client_connected', client);
  }

  // Mesajları işle
  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message.toString());
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (data.type) {
        case 'authenticate':
          this.authenticateClient(clientId, data);
          break;
        case 'join_room':
          this.joinRoom(clientId, data.room);
          break;
        case 'leave_room':
          this.leaveRoom(clientId, data.room);
          break;
        case 'send_message':
          this.handleClientMessage(clientId, data);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          console.log(`Bilinmeyen mesaj türü: ${data.type}`);
      }

      this.emit('message_received', { clientId, data });
    } catch (error) {
      console.error('Mesaj parse hatası:', error);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Geçersiz mesaj formatı'
      });
    }
  }

  // İstemci kimlik doğrulama
  authenticateClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Basit token kontrolü (gerçek uygulamada JWT kullanılmalı)
    if (data.token && data.userId) {
      client.userId = data.userId;
      client.metadata = data.metadata || {};
      
      this.sendToClient(clientId, {
        type: 'authenticated',
        userId: data.userId,
        clientId
      });

      this.emit('client_authenticated', client);
    } else {
      this.sendToClient(clientId, {
        type: 'authentication_failed',
        message: 'Geçersiz kimlik bilgileri'
      });
    }
  }

  // Odaya katıl
  joinRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Oda yoksa oluştur
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    // İstemciyi odaya ekle
    this.rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);

    this.sendToClient(clientId, {
      type: 'joined_room',
      room: roomName,
      memberCount: this.rooms.get(roomName).size
    });

    // Odadaki diğer kullanıcılara bildir
    this.broadcastToRoom(roomName, {
      type: 'user_joined',
      userId: client.userId,
      clientId,
      room: roomName
    }, [clientId]);

    this.emit('client_joined_room', { client, roomName });
  }

  // Odadan ayrıl
  leaveRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(clientId);
      client.rooms.delete(roomName);

      // Oda boşsa sil
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      } else {
        // Odadaki diğer kullanıcılara bildir
        this.broadcastToRoom(roomName, {
          type: 'user_left',
          userId: client.userId,
          clientId,
          room: roomName
        });
      }

      this.sendToClient(clientId, {
        type: 'left_room',
        room: roomName
      });

      this.emit('client_left_room', { client, roomName });
    }
  }

  // İstemci mesajını işle
  handleClientMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const message = {
      id: this.generateMessageId(),
      type: 'message',
      content: data.content,
      userId: client.userId,
      clientId,
      room: data.room,
      timestamp: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    if (data.room) {
      // Oda mesajı
      this.broadcastToRoom(data.room, message, [clientId]);
    } else if (data.targetUserId) {
      // Özel mesaj
      this.sendToUser(data.targetUserId, message);
    }

    this.emit('message_sent', message);
  }

  // Bağlantı kopmasını işle
  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Tüm odalardan çıkar
    client.rooms.forEach(roomName => {
      this.leaveRoom(clientId, roomName);
    });

    this.clients.delete(clientId);
    this.emit('client_disconnected', client);
  }

  // Belirli istemciye mesaj gönder
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Mesaj gönderme hatası (${clientId}):`, error);
      return false;
    }
  }

  // Kullanıcıya mesaj gönder
  sendToUser(userId, message) {
    const userClients = Array.from(this.clients.values())
      .filter(client => client.userId === userId);

    let sent = 0;
    userClients.forEach(client => {
      if (this.sendToClient(client.id, message)) {
        sent++;
      }
    });

    return sent;
  }

  // Odaya broadcast
  broadcastToRoom(roomName, message, excludeClients = []) {
    const room = this.rooms.get(roomName);
    if (!room) return 0;

    let sent = 0;
    room.forEach(clientId => {
      if (!excludeClients.includes(clientId)) {
        if (this.sendToClient(clientId, message)) {
          sent++;
        }
      }
    });

    return sent;
  }

  // Tüm istemcilere broadcast
  broadcast(message, excludeClients = []) {
    let sent = 0;
    this.clients.forEach((client, clientId) => {
      if (!excludeClients.includes(clientId)) {
        if (this.sendToClient(clientId, message)) {
          sent++;
        }
      }
    });

    return sent;
  }

  // Heartbeat başlat
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // 60 saniyeden fazla ping gelmemişse bağlantıyı kapat
          if (Date.now() - client.lastPing > 60000) {
            client.ws.terminate();
            this.handleDisconnection(clientId);
          } else {
            client.ws.ping();
          }
        } else {
          this.handleDisconnection(clientId);
        }
      });
    }, this.heartbeatInterval);
  }

  // Heartbeat durdur
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // İstatistikler
  getStats() {
    const activeClients = Array.from(this.clients.values())
      .filter(client => client.ws.readyState === WebSocket.OPEN);

    return {
      totalClients: this.clients.size,
      activeClients: activeClients.length,
      totalRooms: this.rooms.size,
      authenticatedClients: activeClients.filter(c => c.userId).length,
      roomsWithMembers: Array.from(this.rooms.entries()).map(([name, members]) => ({
        name,
        memberCount: members.size
      }))
    };
  }

  // Oda listesi
  getRooms() {
    return Array.from(this.rooms.entries()).map(([name, members]) => ({
      name,
      memberCount: members.size,
      members: Array.from(members).map(clientId => {
        const client = this.clients.get(clientId);
        return client ? {
          clientId,
          userId: client.userId,
          connectedAt: client.connectedAt
        } : null;
      }).filter(Boolean)
    }));
  }

  // Kullanıcı listesi
  getConnectedUsers() {
    const users = new Map();
    
    this.clients.forEach(client => {
      if (client.userId) {
        if (!users.has(client.userId)) {
          users.set(client.userId, {
            userId: client.userId,
            connections: [],
            rooms: new Set()
          });
        }
        
        const user = users.get(client.userId);
        user.connections.push({
          clientId: client.id,
          connectedAt: client.connectedAt,
          active: client.ws.readyState === WebSocket.OPEN
        });
        
        client.rooms.forEach(room => user.rooms.add(room));
      }
    });

    return Array.from(users.values()).map(user => ({
      ...user,
      rooms: Array.from(user.rooms),
      connectionCount: user.connections.length,
      activeConnections: user.connections.filter(c => c.active).length
    }));
  }

  // Sunucuyu kapat
  shutdown() {
    this.stopHeartbeat();
    
    if (this.wss) {
      this.wss.clients.forEach(ws => {
        ws.close(1001, 'Sunucu kapatılıyor');
      });
      this.wss.close();
    }

    this.clients.clear();
    this.rooms.clear();
    
    console.log('WebSocket sunucusu kapatıldı');
  }

  // Yardımcı metodlar
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Notification servisi entegrasyonu
  async sendNotificationToUser(userId, notification) {
    const message = {
      type: 'notification',
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.createdAt
      }
    };

    const sent = this.sendToUser(userId, message);
    return sent > 0;
  }

  // Proje güncellemelerini broadcast et
  broadcastProjectUpdate(projectId, update) {
    const message = {
      type: 'project_update',
      projectId,
      update,
      timestamp: new Date().toISOString()
    };

    // Proje odasına gönder
    return this.broadcastToRoom(`project_${projectId}`, message);
  }

  // Build durumunu broadcast et
  broadcastBuildStatus(buildId, projectId, status) {
    const message = {
      type: 'build_status',
      buildId,
      projectId,
      status,
      timestamp: new Date().toISOString()
    };

    return this.broadcastToRoom(`project_${projectId}`, message);
  }
}

module.exports = new WebSocketService();