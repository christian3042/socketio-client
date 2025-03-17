import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Subscription, Subject } from 'rxjs';

import { ChatResponse } from './model/chat-response';
import { ChatRequest} from './model/chat-request';
import { WebsocketService } from './services/websocket.service';
import { ChatEvents } from './model/chat-events';
import { EventToRegister } from './model/event-to-register';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
    messageInput = new FormControl("");
    messages: ChatResponse[] = [];
    private chatSub: Subscription | undefined;
    public chatSubject: Subject<ChatResponse> = new Subject<ChatResponse>();

    private eventToRegister: EventToRegister = new EventToRegister(ChatEvents.MESSAGE_RESPONSE, this.chatSubject);

    constructor(
    private websocketService: WebsocketService) {
    }
  
    ngOnInit() {
        this.websocketService.registerEvent(this.eventToRegister);
      this.chatSub = this.chatSubject.subscribe((response: ChatResponse) => {
        const now: Date = new Date();
        const ms = now.getTime() - this.websocketService.sendingTime.getTime();
        console.log('Time (ms) between last send and last receival: ', ms);
        if (ms < 100) {
            // TODO: Reset connection
            this.websocketService.disconnectSocket();
            this.websocketService.connectSocket();
            this.messageInput.setValue("TEST");
            this.onSendMessage();
            
        } else {
            console.error("The application got stuck!!!");
        }
        this.messages.push(response);
      });
    }
  
    ngOnDestroy(): void {
      this.chatSub?.unsubscribe();
    }
  
    onSendMessage(): void {
      const msg = <string>this.messageInput.value;
      this.messageInput.setValue("");
      const cr = {} as ChatRequest;
      cr.message = msg;
      this.websocketService.sendMessage(ChatEvents.SEND_MESSAGE, cr);
    }
}
