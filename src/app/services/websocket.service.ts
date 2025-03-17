import { Injectable, WritableSignal, effect, signal } from "@angular/core";

import { Subscription, Observable, Subject } from "rxjs";

import { Socket } from "ngx-socket-io";

import { EventMsgWrapper } from "../model/event-msg-wrapper";
import { EventToRegister } from "../model/event-to-register";
import { ChatEvents } from "../model/chat-events";
import { ChatResponse } from "../model/chat-response";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {

  sendingTime: Date = new Date();
  public chatSubject: Subject<ChatResponse> = new Subject<ChatResponse>();
  private eventToRegister: EventToRegister = new EventToRegister(ChatEvents.MESSAGE_RESPONSE, this.chatSubject);

  constructor() {
    this.emitAfterConnect();
    this.connectSocket();
    effect(() => {
        if (this.isWebsocketConnectedSignal()) {
          this.eventsToRegister.forEach((event) => {
            this.subscribeWebsocketEvents(event);
          });
          this.eventsToRegister = [];
        }
      });
  }

  public isWebsocketConnectedSignal: WritableSignal<boolean> = signal(false);
  private webSocket: Socket | undefined;

  private eventsToSend: EventMsgWrapper[] = [];
  private eventsToRegister: EventToRegister[] = [];
  private activeSubscriptions: Subscription[] = [];

  public connectSocket() {
    this.registerEvent(this.eventToRegister);
    
    this.webSocket = new Socket({
      url: "http://127.0.0.1:8088",
    });
    this.webSocket.on("connect", () => {
      this.isWebsocketConnectedSignal.update(() => true);
    });
    this.webSocket.on("connect_error", (err: any) => {
      console.error(`connect_error due to ${err.message}`);
    });
  }

  public sendMessage(eventName: string, message: unknown): void {
    if (this.webSocket !== undefined) {
      if (this.isWebsocketConnectedSignal()) {
        this.sendingTime = new Date();
        this.webSocket.emit(eventName, message);
      } else {
        const eventToSend = {} as EventMsgWrapper;
        eventToSend.eventName = eventName;
        eventToSend.message = message;
        this.eventsToSend.push(eventToSend);
      }
    } else {
      console.error("Websocket is undefined!");
    }
  }

  public registerEvent(e: EventToRegister) {
    if (!this.isWebsocketConnectedSignal()) {
      this.eventsToRegister.push(e);
    } else {
      this.subscribeWebsocketEvents(e);
    }
  }

  private subscribeWebsocketEvents(event: EventToRegister) {
    console.log('subscribe event ', event);
    const observable: Observable<unknown> | undefined = this.subscribeEvent(event.getEventName());
    if (observable !== undefined) {
      const subscription: Subscription = observable.subscribe((data) => {
        event.getSubject().next(data);
      });
      this.activeSubscriptions.push(subscription);
    } else {
      console.error("Observable is undefined!");
    }
  }

  public subscribeEvent(eventName: string) {
    if (this.webSocket !== undefined) {
        console.log('register event', eventName);
      return this.webSocket.fromEvent(eventName);
    } else {
      console.error("Websocket is undefined!");
      return undefined;
    }
  }

  public unsubscribeEvent(eventName: string): void {
    this.webSocket?.removeAllListeners(eventName);
  }

  public disconnectSocket() {
    if (this.webSocket !== undefined) {
      this.unsubscribeEvent(ChatEvents.MESSAGE_RESPONSE);
      this.activeSubscriptions.forEach(subscription => {
        subscription.unsubscribe();        
      });
      this.isWebsocketConnectedSignal.update(() => false);
      this.webSocket.disconnect();
    } else {
      console.error("websocket is undefined!");
    }
  }

  private emitAfterConnect() {
    effect(() => {
      if (this.isWebsocketConnectedSignal()) {
        console.log('Connected: ', this.isWebsocketConnectedSignal());
        this.eventsToSend.forEach((event) => {
          if (this.webSocket !== undefined) {
            this.sendingTime = new Date();
            this.webSocket.emit(event.eventName, event.message);
          } else {
            console.error("Websocket is undefined!");
          }
        });
        this.eventsToSend = [];
      }
    });
  }

}
