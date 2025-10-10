import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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

    @Column({ default: "SOLICITANTE" })
    role!: string; // e.g., 'SOLICITANTE', 'GESTOR_DADM', 'ADMIN_TEC'
}