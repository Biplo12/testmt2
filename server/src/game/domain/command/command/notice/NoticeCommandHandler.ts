import Logger from '@/core/infra/logger/Logger';
import NoticeCommand from './NoticeCommand';
import World from '@/core/domain/World';
import CommandHandler from '../../CommandHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class NoticeCommandHandler extends CommandHandler<NoticeCommand> {
    private logger: Logger;
    private world: World;

    constructor({ logger, world }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player, noticeCommand: NoticeCommand) {
        if (!noticeCommand.isValid()) {
            const errors = noticeCommand.errors();
            this.logger.error(noticeCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const message = noticeCommand.getArgs().join(' ');

        for (const target of this.world.getPlayers().values()) {
            target.sendChat({
                messageType: ChatMessageTypeEnum.NOTICE,
                message,
                vid: 0,
                empireId: 0,
            });
        }

        this.logger.info(`[NoticeCommandHandler] ${player.getRawName()} sent notice: ${message}`);
    }
}
