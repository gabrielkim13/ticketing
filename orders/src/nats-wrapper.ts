import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) throw new Error('Client is not connected to NATS server');

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(`${clientId}@${clusterId} connected to ${url}`);

        resolve();
      });

      this.client.on('error', (error) => {
        reject(error);
      });
    });

  }
}

export const natsWrapper = new NatsWrapper();
