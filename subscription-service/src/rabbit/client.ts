import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import waitPort from 'wait-port';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    await waitPort({ host: 'rabbitmq', port: 5672, timeout: 30000 });

    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://waycooler:12345678@rabbitmq:5672");
    channel = await connection.createChannel();

    await channel.assertQueue('auth_queue');

    console.log('Subscription service RabbitMQ client connected');
}

// Получение пользователя через RPC
export async function getUser(id: number, timeout = 5000): Promise<any> {
    if (!channel) throw new Error('RabbitMQ not connected');

    const corrId = uuidv4();
    const assertReply = await channel.assertQueue('', { exclusive: true });
    const replyQueue = assertReply.queue;

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('RPC timeout')), timeout);

        channel.consume(
            replyQueue,
            (msg) => {
                if (msg && msg.properties.correlationId === corrId) {
                    clearTimeout(timer);
                    resolve(JSON.parse(msg.content.toString()));
                    channel.deleteQueue(replyQueue); // удаляем временную очередь
                }
            },
            { noAck: true }
        );

        channel.sendToQueue(
            'auth_queue',
            Buffer.from(JSON.stringify({ type: 'getUser', id })),
            { correlationId: corrId, replyTo: replyQueue }
        );
    });
}
