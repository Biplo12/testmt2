import Command from '../../Command';
import NameColorCommandValidator from './NameColorCommandValidator';

export default class NameColorCommand extends Command {
    constructor({ args }) {
        super({ args, validator: NameColorCommandValidator });
    }

    static getName() {
        return '/namecolor';
    }
    static getDescription() {
        return 'change name color of yourself or a target player';
    }
    static getExample() {
        return '/namecolor <color> [targetName]';
    }
}
