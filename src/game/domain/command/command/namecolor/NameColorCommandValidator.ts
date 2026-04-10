import CommandValidator from '../../CommandValidator';

export default class NameColorCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'color').isRequired().isString().build();
        this.createRule(this.command.getArgs()[1], 'targetName').isOptional().isString().build();
    }
}
