import Command from '../../Command';
import BigNoticeCommandValidator from './BigNoticeCommandValidator';

export default class BigNoticeCommand extends Command {
    constructor({ args }) {
        super({ args, validator: BigNoticeCommandValidator });
    }

    static getName() {
        return '/bignotice';
    }
    static getDescription() {
        return 'broadcast a big centered notice to all players (GM only)';
    }
    static getExample() {
        return '/bignotice <message>';
    }
}
