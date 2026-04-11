import Logger from '@/core/infra/logger/Logger';
import BigNoticeCommand from './BigNoticeCommand';
import World from '@/core/domain/World';
import CommandHandler from '../../CommandHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class BigNoticeCommandHandler extends CommandHandler<BigNoticeCommand> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player, bigNoticeCommand: BigNoticeCommand) {
        if (!bigNoticeCommand.isValid()) {
            const errors = bigNoticeCommand.errors();
            this.logger.error(bigNoticeCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const message = bigNoticeCommand.getArgs().join(' ');

        for (const target of this.world.getPlayers().values()) {
            target.sendChat({
                messageType: ChatMessageTypeEnum.BIG_NOTICE,
                message,
                vid: 0,
                empireId: 0,
            });
        }

        this.logger.info(`[BigNoticeCommandHandler] ${player.getRawName()} sent big notice: ${message}`);
    }
}
