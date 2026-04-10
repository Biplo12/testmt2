import Command from '../../Command';

export default class InvisibilityCommand extends Command {
    static getName() {
        return '/invisibility';
    }
    static getDescription() {
        return 'toggle invisibility';
    }
}
