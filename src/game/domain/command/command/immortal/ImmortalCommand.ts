import Command from '../../Command';

export default class ImmortalCommand extends Command {
    static getName() {
        return '/immortal';
    }
    static getDescription() {
        return 'toggle invincibility';
    }
}
