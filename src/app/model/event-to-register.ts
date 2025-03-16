import { Subject } from "rxjs";

export class EventToRegister {
  constructor(
    private eventName: string,
    private subject: Subject<any>,
  ) {}

  public getEventName() {
    return this.eventName;
  }

  public getSubject() {
    return this.subject;
  }
}
