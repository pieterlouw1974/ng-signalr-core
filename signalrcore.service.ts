import { Injectable, EventEmitter, Inject, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Subscription } from 'rxjs/Subscription';
// rx
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class SignalRCoreService {
  private _hubConnection: HubConnection;
  public conState = ConnectionState.Disconnected;
  connectionState$: Observable<ConnectionState>;
  private connectionStateSubject = new Subject<ConnectionState>();
  public connectionExists: Boolean;
  private subscription: Subscription;

  constructor(

  ) {

  }

  startSignalRCore() {
    this.connectionExists = false;
    this.connectionState$ = this.connectionStateSubject.asObservable();

        this.conState = ConnectionState.Connecting;
        this.connectionStateSubject.next(this.conState);

        this._hubConnection = new HubConnection('http://localhost:5000/hubname');

        this.register_receiveData();

        this._hubConnection.start()
          .then(() => {
            this.startSignalRConnection();
          })
          .catch(err => {
            console.log('Error while establishing connection');
            this.reconnect();
          });

        this._hubConnection.onClosed = e => {
          console.log('Hub connection closed ' + e);

          this.connectionExists = false;
          this.conState = ConnectionState.Disconnected;

          if (this.connectionStateSubject) {
            this.connectionStateSubject.next(this.conState);
          }
          this.reconnectTimer();
        }
     }
  }

  reconnectTimer() {
    const timer = TimerObservable.create(10000, 10000);
    this.subscription = timer.subscribe(t => {
      this.reconnect();
    });
  }

  reconnect() {
     if (this.conState !== ConnectionState.Connected) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.conState = ConnectionState.Connecting;

      if (this.connectionStateSubject) {
        this.connectionStateSubject.next(this.conState);
      }

      this._hubConnection = new HubConnection('http://localhost:5000/hubname');
      this._hubConnection.start()
        .then(() => {
          console.log('Hub connection started')
          this.startSignalRConnection();
        })
        .catch(err => {
          console.log('Error while establishing connection');
          this.reconnectTimer();
        });
    }
  }

  startSignalRConnection() {
    console.log('Hub connection started')
    this.conState = ConnectionState.Connected;
    this.connectionStateSubject.next(this.conState);
    this.resetDeviceData();
  }

  stopConnection() {
    this._hubConnection.stop();
  }

  private startConnection(): void {

    this.conState = ConnectionState.Connecting;
    this.connectionStateSubject.next(this.conState);

    this._hubConnection = new HubConnection('http://localhost:5000/hubname');

    this._hubConnection.start()
      .then(() => {
        console.log('Hub connection started')

        this.connectionExists = true;

        this.conState = ConnectionState.Connected;
        this.connectionStateSubject.next(this.conState);
      })
      .catch(err => {
        console.log('Error while establishing connection')
      });
  }

  // receive data


  register_receiveData() {

    this._hubConnection.on('Notify', (data: any) => {
      console.log('Notify received');

    });
  }

  // send data

  public sendSomeData(some: string) {
    if (this.conState === ConnectionState.Connected) {
      this._hubConnection.invoke('somehubevent', user);
    } else {
      console.log('sendSomeData Service not running');
    }
  }
}
