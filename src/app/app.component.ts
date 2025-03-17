import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { ChatResponse } from './model/chat-response';
import { ChatRequest} from './model/chat-request';
import { WebsocketService } from './services/websocket.service';
import { ChatEvents } from './model/chat-events';

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

    constructor(
    private websocketService: WebsocketService) {
    }
  
    ngOnInit() {
        this.chatSub = this.websocketService.chatSubject.subscribe((response: ChatResponse) => {
        const now: Date = new Date();
        const ms = now.getTime() - this.websocketService.sendingTime.getTime();
        console.log('Time (ms) between last send and last receival: ', ms);
        // if (ms < 100) {
        //     this.websocketService.disconnectSocket();
        //     this.websocketService.connectSocket();
        //     console.log('sending test message');
        //     this.messageInput.setValue("TEST");
        //     this.onSendMessage();
            
        // } else {
        //     console.error("The application got stuck!!!");
        // }
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
