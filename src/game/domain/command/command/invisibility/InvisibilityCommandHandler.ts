import CommandHandler from '../../CommandHandler';
import InvisibilityCommand from './InvisibilityCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class InvisibilityCommandHandler extends CommandHandler<InvisibilityCommand> {
    async execute(player: Player) {
        const isInvisible = player.isAffectByFlag(AffectBitsTypeEnum.INVISIBILITY);

        if (isInvisible) {
            player.removeAffectFlag(AffectBitsTypeEnum.INVISIBILITY);
        } else {
            player.setAffectFlag(AffectBitsTypeEnum.INVISIBILITY);
        }

        player.updateView();

        player.chat({
            message: `Invisibility ${!isInvisible ? 'enabled' : 'disabled'}.`,
            messageType: ChatMessageTypeEnum.INFO,
        });
    }
}
