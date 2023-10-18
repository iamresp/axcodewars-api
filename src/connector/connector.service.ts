import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Connection } from './models';

@Injectable()
export class ConnectorService {
  private readonly queue: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private readonly pairs: Map<string, BehaviorSubject<Connection>> = new Map();
  private readonly destructors: WeakMap<
    BehaviorSubject<Connection>,
    () => void
  > = new WeakMap();

  getPeer(
    connId: string,
    connection: BehaviorSubject<Connection>,
  ): string | undefined {
    return Object.values(connection.getValue()).find((id) => id !== connId);
  }

  getConnection(connId: string): BehaviorSubject<Connection> | undefined {
    return this.pairs.get(connId);
  }

  addToQueue(...connIds: string[]): void {
    this.queue.next([...this.queue.getValue(), ...connIds]);
  }

  removeFromQueue(...connIds: string[]): void {
    const queue = this.queue.getValue();
    connIds.forEach((connId) => queue.splice(queue.indexOf(connId), 1));
    this.queue.next([...queue]);
  }

  connect(): BehaviorSubject<Connection> {
    const connId = uuid(); // идентификатор нового подключения

    // эдж кейс: только что созданный uuid уже обработан
    if (this.pairs.get(connId) || this.queue.getValue().includes(connId)) {
      this.connect();
      return;
    }

    const connection = new BehaviorSubject<Connection>({ peer1: connId });

    this.pairs.set(connId, connection);
    this.addToQueue(connId);

    const subscription = this.queue.subscribe({
      next: (queue) => {
        if (
          queue.length &&
          queue.includes(connId) &&
          queue[0] !== connId &&
          !connection.getValue().peer2
        ) {
          const peerId = queue[0]; // берем самое старое подключение из ожидающих
          const peerConnection = this.pairs.get(peerId);

          connection.next({ peer1: connId, peer2: peerId });
          peerConnection.next({ peer1: peerId, peer2: connId });

          this.removeFromQueue(connId, peerId);
        }
      },
    });
    this.destructors.set(connection, () => subscription.unsubscribe());

    return connection;
  }

  retry(connId: string): void {
    if (!this.queue.getValue().includes(connId)) {
      this.addToQueue(connId);
    }
  }

  decline(connId: string): void {
    const connection = this.pairs.get(connId);
    const peerId = this.getPeer(connId, connection);

    connection.next({ peer1: connId });

    if (peerId) {
      const peerConnection = this.pairs.get(peerId);
      peerConnection.next({ peer1: peerId, wasClosed: true });
      this.addToQueue(peerId);
    }
  }

  disconnect(connId: string): void {
    const connection = this.pairs.get(connId);
    const peerId = this.getPeer(connId, connection);
    const queue = this.queue.getValue();

    this.pairs.delete(connId);
    this.destructors.get(connection)?.();

    if (queue.includes(connId)) {
      this.removeFromQueue(connId);
    }

    if (peerId) {
      const peerConnection = this.pairs.get(peerId);
      peerConnection.next({ peer1: peerId, wasClosed: true });
      this.addToQueue(peerId);
    }
  }
}
