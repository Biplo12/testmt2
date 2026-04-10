import PacketValidator from '../../../PacketValidator';
import QuestButtonPacket from './QuestButtonPacket';

export default class QuestButtonPacketValidator extends PacketValidator<QuestButtonPacket> {
    constructor(questButtonPacket: QuestButtonPacket) {
        super(questButtonPacket);
    }

    build() {
        this.createRule(this.packet.getQuestId(), 'questId').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
