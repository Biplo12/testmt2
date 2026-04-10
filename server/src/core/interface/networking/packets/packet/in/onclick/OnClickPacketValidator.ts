import PacketValidator from '../../../PacketValidator';
import OnClickPacket from './OnClickPacket';

export default class OnClickPacketValidator extends PacketValidator<OnClickPacket> {
    constructor(onClickPacket: OnClickPacket) {
        super(onClickPacket);
    }

    build() {
        this.createRule(this.packet.getTargetVirtualId(), 'targetVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
