import CommandHandler from '../../CommandHandler';
import ImmortalCommand from './ImmortalCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class ImmortalCommandHandler extends CommandHandler<ImmortalCommand> {
    async execute(player: Player) {
        const newValue = !player.isInvincible();
        player.setInvincible(newValue);
        player.chat({
            message: `Invincibility ${newValue ? 'enabled' : 'disabled'}.`,
            messageType: ChatMessageTypeEnum.INFO,
        });
    }
}
