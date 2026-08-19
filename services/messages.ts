import { getDatabase } from './database';

export type Message = {
  id: string;
  sender: string;
  body: string;
  receivedAt: number;
};

type MessageRow = {
  id: string;
  sender: string;
  body: string;
  received_at: number;
};

function fromRow(row: MessageRow): Message {
  return { id: row.id, sender: row.sender, body: row.body, receivedAt: row.received_at };
}

export async function listMessages(): Promise<Message[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MessageRow>(
    'SELECT id, sender, body, received_at FROM messages ORDER BY received_at DESC'
  );
  return rows.map(fromRow);
}

export async function insertMessages(messages: Message[]): Promise<void> {
  if (messages.length === 0) return;
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const message of messages) {
      await db.runAsync(
        'INSERT OR IGNORE INTO messages (id, sender, body, received_at, created_at) VALUES (?, ?, ?, ?, ?)',
        [message.id, message.sender, message.body, message.receivedAt, Date.now()]
      );
    }
  });
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM messages WHERE id = ?', [id]);
}

export async function deleteAllMessages(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM messages');
}
