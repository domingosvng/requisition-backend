import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
// Represents a supplier in the system.
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  contactoPrincipal!: string;

  @Column()
  email!: string;

  @Column()
  telefone!: string;

  @Column()
  nif!: string;

  @Column()
  endereco!: string;

  @Column("simple-array")
  servicosFornecidos!: string[];

  @Column({ nullable: true })
  dataRegisto?: Date;

  @Column({ default: true })
  ativo!: boolean;
}
