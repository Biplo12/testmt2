import CommandHandler from '../../CommandHandler';
import NameColorCommand from './NameColorCommand';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';
import { NameColorEnum } from '@/core/enum/NameColorEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

const VALID_COLORS = Object.values(NameColorEnum);

export default class NameColorCommandHandler extends CommandHandler<NameColorCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, command: NameColorCommand) {
        if (!command.isValid()) {
            player.sendCommandErrors(command.errors());
            return;
        }

        const [colorName, targetName] = command.getArgs();
        const color = colorName?.toUpperCase() as NameColorEnum;

        if (!VALID_COLORS.includes(color)) {
            player.chat({
                message: `Invalid color. Available: ${VALID_COLORS.join(', ')}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const target = targetName ? this.world.getPlayerByName(targetName) : player;

        if (!target) {
            player.chat({
                message: `Target: ${targetName} not found.`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        target.setNameColor(color);
        target.updateName();

        player.chat({
            message: `Name color set to ${color} for ${targetName ?? 'yourself'}.`,
            messageType: ChatMessageTypeEnum.INFO,
        });
    }
}
