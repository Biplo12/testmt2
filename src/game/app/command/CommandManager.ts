import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import Command from '@/game/domain/command/Command';
import { CommandMapValue } from '@/game/domain/command/Commands';

export default class CommandManager {
    private readonly logger: Logger;
    private readonly commands: Map<string, CommandMapValue<Command>>;
    private readonly container;

    constructor(container) {
        this.logger = container.logger;
        this.commands = container.commands;
        this.container = container;
    }

    async execute({ message, player }) {
        //TODO: validate player flood chat, validate ban words
        if (message.startsWith('/help')) {
            for (const { command, gmOnly } of this.commands.values()) {
                if (gmOnly && !player.hasStaffRole()) continue;
                player.chat({
                    message: `Command: ${command.getName()} - Description: ${command.getDescription()} ${command.getExample() ? `- Example: ${command.getExample()}` : ''} `,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            }
            return;
        }

        const [commandName, ...args] = message.split(' ');

        if (!this.commands.has(commandName)) {
            this.logger.info(`[CommandManager] Invalid command: ${commandName}`);
            player.chat({
                message: `Invalid command: ${commandName}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const { command: Command, createHandler, gmOnly } = this.commands.get(commandName);

        if (gmOnly && !player.hasStaffRole()) {
            player.chat({
                message: `You do not have permission to use this command.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const command = new Command({ args });
        const commandHandler = createHandler(this.container);
        await commandHandler.execute(player, command);
    }
}
