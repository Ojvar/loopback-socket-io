import {
  Application,
  /*inject, */ BindingScope,
  CoreBindings,
  inject,
  injectable,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import {HttpErrors, RestServer} from '@loopback/rest';

import IO from 'socket.io';

@injectable({scope: BindingScope.SINGLETON})
@lifeCycleObserver('socket-io')
export class WebSocketService implements LifeCycleObserver {
  private _io: IO.Server | undefined;
  get io(): IO.Server {
    return this._io as IO.Server;
  }

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  emit(ev: string, ...data: unknown[]): boolean {
    return this.io.emit(ev, data);
  }

  start() {
    const restServer: RestServer = this.app.getSync('rest-server');
    if (!restServer.httpServer) {
      throw new HttpErrors.InternalServerError('Invalid RestServer');
    }

    console.log(restServer.httpServer.server);
    this._io = new IO.Server(restServer.httpServer.server);
    this.io.on('connection', socket => {
      console.log('a user connected');

      socket.emit('message', 'Hello to you');
    });

    console.log('Server started');
  }

  stop() {
    console.log('Server stopped');
  }

  /*
   * Add service methods here
   */
}
