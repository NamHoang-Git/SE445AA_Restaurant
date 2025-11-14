import amqp from 'amqplib';

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    console.log('Đã kết nối RabbitMQ thành công!');
    const channel = await connection.createChannel();
    return channel;
  } catch (error) {
    console.error('Lỗi kết nối RabbitMQ:', error);
    throw error;
  }
}
