import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import bcrypt from "bcrypt";

// Explicitly set table name to match PostgreSQL
@Entity({ name: "user" })
// Represents a user in the system.
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password_hash!: string;

    @Column({ default: "requester" })
    role!: string; // e.g., 'requester', 'dadm_manager', 'admin'

    // This decorator runs before a new user is inserted into the database
    @BeforeInsert()
    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }
}