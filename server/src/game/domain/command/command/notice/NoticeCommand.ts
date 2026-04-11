import Command from '../../Command';
import NoticeCommandValidator from './NoticeCommandValidator';

export default class NoticeCommand extends Command {
    constructor({ args }) {
        super({ args, validator: NoticeCommandValidator });
    }

    static getName() {
        return '/notice';
    }
    static getDescription() {
        return 'broadcast a server-wide notice to all players (GM only)';
    }
    static getExample() {
        return '/notice <message>';
    }
}
