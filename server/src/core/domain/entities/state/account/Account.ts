import StateEntity from '@/core/domain/entities/state/StateEntity';
import AccountStatus from '@/core/domain/entities/state/account/AccountStatus';
import { AccountRoleEnum } from '@/core/enum/AccountRoleEnum';

export default class Account extends StateEntity {
    private readonly username: string;
    private readonly password: string;
    private readonly email: string;
    private readonly lastLogin: Date;
    private readonly deleteCode: string;
    private readonly role: AccountRoleEnum;
    private readonly accountStatus: AccountStatus;

    constructor({ id, username, password, email, lastLogin, deleteCode, role, accountStatus, createdAt, updatedAt }) {
        super(id, createdAt, updatedAt);
        this.username = username;
        this.password = password;
        this.email = email;
        this.lastLogin = lastLogin;
        this.deleteCode = deleteCode;
        this.role = role ?? AccountRoleEnum.PLAYER;
        this.accountStatus = accountStatus;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getEmail() {
        return this.email;
    }

    getLastLogin() {
        return this.lastLogin;
    }

    getDeleteCode() {
        return this.deleteCode;
    }

    getRole() {
        return this.role;
    }

    getAccountStatus() {
        return this.accountStatus;
    }

    static create({ id, username, password, email, lastLogin, deleteCode, role, createdAt, updatedAt, accountStatus }) {
        return new Account({
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            role,
            createdAt,
            updatedAt,
            accountStatus,
        });
    }
}
