export class QuestUtil {
    private static nextId: number = 0;

    public static getNextId() {
        return this.nextId++;
    }
}
