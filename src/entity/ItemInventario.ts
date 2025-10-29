import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Fornecedor } from "./Fornecedor";

@Entity()
// Represents an inventory item in the system.
export class ItemInventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column()
  categoria!: string;

  @Column()
  quantidade!: number;

  @Column()
  unidadeMedida!: string;

  @Column()
  localizacao!: string;

  @Column({ nullable: true })
  dataEntrada?: Date;

  @Column({ nullable: true })
  dataUltimaSaida?: Date;

  @ManyToOne(() => Fornecedor, { nullable: true })
  fornecedor?: Fornecedor;

  @Column({ nullable: true })
  fornecedorNome?: string;

  @Column({ nullable: true })
  valorUnitario?: number;

  @Column()
  status!: string;
}
