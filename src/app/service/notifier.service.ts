import { Injectable } from '@angular/core'
import { NotifierService } from 'angular-notifier';
import { MessageType } from '../enum/message-type.enum';

@Injectable({ providedIn: 'root' })
export class MyNotifierService {

    private readonly notifierService: NotifierService;

    constructor(notifierService: NotifierService) {
        this.notifierService = notifierService;
    }

    onDefault(message: string): void {
        this.notifierService.notify(MessageType.DEFAULT, message)
    }

    onSuccess(message: string): void {
        this.notifierService.notify(MessageType.SUCCESS, message);
    }

    onInfo(message: string): void {
        this.notifierService.notify(MessageType.INFO, message);
    }

    onWarning(message: string): void {
        this.notifierService.notify(MessageType.WARNING, message);
    }

    onError(message: string): void {
        this.notifierService.notify(MessageType.ERROR, message);
    }
}
