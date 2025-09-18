import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import amqp from 'amqplib';
import waitPort from 'wait-port';
import { removePassword } from '../controllers/userController'

let channel: amqp.Channel;

const userRepository = AppDataSource.getRepository(User);

export async function connectRabbitMQ() {
    await waitPort({ host: 'rabbitmq', port: 5672, timeout: 30000 });

    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://waycooler:12345678@rabbitmq:5672");
    channel = await connection.createChannel();

    const queue = 'auth_queue';
    await channel.assertQueue(queue);

    console.log('Auth service RabbitMQ listening...');

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());

        if (data.type === 'getUser') {
            const user = await userRepository.findOneBy({ id: parseInt(data.id) });
            var userWithoutPassword;
            if (user) {
                userWithoutPassword = removePassword(user)
            }
            else {
                userWithoutPassword = { id: data.id, name: `Unknown` };
            }

            if (msg.properties.replyTo && msg.properties.correlationId) {
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(userWithoutPassword)),
                    { correlationId: msg.properties.correlationId }
                );
            }
        }

        channel.ack(msg);
    });
}

export function getChannel() {
    if (!channel) throw new Error('RabbitMQ not connected');
    return channel;
}


// import amqp from 'amqplib';
// import waitPort from 'wait-port';

// let connection: any;
// let channel: any;

// export async function connectRabbitMQ() {
//     await waitPort({ host: 'rabbitmq', port: 5672, timeout: 30000 });
//     connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://login:password@rabbitmq:5672");
//     channel = await connection.createChannel();
//     const queue = 'auth_queue';
//     await channel.assertQueue(queue);

//     console.log('Auth service RabbitMQ listening...');

//     channel.consume(queue, async (msg: { content: { toString: () => string; }; properties: { replyTo: any; correlationId: any; }; }) => {
//         if (!msg) return;

//         const data = JSON.parse(msg.content.toString());
//         if (data.type === 'getUser') {
//             const user = { id: data.id, name: `User ${data.id}` };
//             channel.sendToQueue(
//                 msg.properties.replyTo,
//                 Buffer.from(JSON.stringify(user)),
//                 { correlationId: msg.properties.correlationId }
//             );
//         }

//         channel.ack(msg);
//     });
// }

// export function getChannel() {
//     if (!channel) throw new Error('RabbitMQ not connected');
//     return channel;
// }
