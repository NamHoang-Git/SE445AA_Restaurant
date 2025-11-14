// 📄 test_rabbit.js
import { connect } from 'amqplib';

(async () => {
  try {
    const connection = await connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Đảm bảo queue tồn tại
    await channel.assertQueue('test_queue', { durable: true });

    // Gửi thử một message
    const msg = 'Hello RabbitMQ 🐇';
    await channel.sendToQueue('test_queue', Buffer.from(msg), { persistent: true });

    console.log('📤 Đã gửi message:', msg);
    await connection.close();
  } catch (err) {
    console.error('❌ Lỗi khi test kết nối:', err);
  }
})();
