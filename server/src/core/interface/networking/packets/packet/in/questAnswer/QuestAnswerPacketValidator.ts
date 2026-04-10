import PacketValidator from '../../../PacketValidator';
import QuestAnswerPacket from './QuestAnswerPacket';

export default class QuestAnswerPacketValidator extends PacketValidator<QuestAnswerPacket> {
    constructor(QuestAnswerPacket: QuestAnswerPacket) {
        super(QuestAnswerPacket);
    }

    build() {
        this.createRule(this.packet.getAnswer(), 'answer').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
