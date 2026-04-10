import Command from '../../Command';
import WhisperCommandValidator from './WhisperCommandValidator';

export default class WhisperCommand extends Command {
    constructor({ args }) {
        super({ args, validator: WhisperCommandValidator });
    }

    static getName() {
        return '/whisper';
    }
    static getDescription() {
        return 'send a private message to a player';
    }
    static getExample() {
        return '/whisper <playerName> <message>';
    }
}
