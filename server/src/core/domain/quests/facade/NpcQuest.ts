import NPC from '../../entities/game/mob/NPC';

export class NpcQuest {
    private readonly npc: NPC;

    constructor({ npc }) {
        this.npc = npc;
    }

    getLevel() {
        return this.npc.getLevel();
    }

    getId() {
        return this.npc.getId();
    }
}
