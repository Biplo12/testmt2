import Command from '../../Command';
import WhisperAllCommandValidator from './WhisperAllCommandValidator';

export default class WhisperAllCommand extends Command {
    constructor({ args }) {
        super({ args, validator: WhisperAllCommandValidator });
    }

    static getName() {
        return '/whisperall';
    }
    static getDescription() {
        return 'send a whisper to all online players (GM only)';
    }
    static getExample() {
        return '/whisperall <message>';
    }
}
