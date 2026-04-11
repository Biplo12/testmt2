import CommandValidator from '@/game/domain/command/CommandValidator';

export default class BigNoticeCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'message').isRequired().isString().build();
    }
}
