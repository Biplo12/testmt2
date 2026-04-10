import CommandValidator from '@/game/domain/command/CommandValidator';

export default class WhisperCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'targetName').isRequired().isString().build();
        this.createRule(this.command.getArgs()[1], 'message').isRequired().isString().build();
    }
}
