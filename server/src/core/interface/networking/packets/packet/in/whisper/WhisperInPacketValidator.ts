import PacketValidator from '../../../PacketValidator';
import WhisperInPacket from './WhisperInPacket';

export default class WhisperInPacketValidator extends PacketValidator<WhisperInPacket> {
    build() {
        this.createRule(this.packet.getTargetName(), 'targetName').isRequired().isString().build();
        this.createRule(this.packet.getMessage(), 'message').isRequired().isString().build();
    }
}
