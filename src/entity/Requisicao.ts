import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum StatusRequisicao {
  PENDENTE = 'PENDENTE',
  APROVADA_GERENCIA = 'APROVADA_GERENCIA',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  EM_PROCESSAMENTO = 'EM_PROCESSAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

@Entity()
// Represents a requisition in the system.
export class Requisicao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numeroRequisicao!: string;

  @ManyToOne(() => User)
  solicitante!: User;

  @Column()
  areaSolicitante!: string;

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn({ nullable: true })
  dataUltimaAtualizacao?: Date;

  @Column({ type: "enum", enum: StatusRequisicao, default: StatusRequisicao.PENDENTE })
  status!: StatusRequisicao;

  @Column()
  urgencia!: string;

  @Column("jsonb")
  itens!: any[];

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ nullable: true })
  justificativaRejeicao?: string;

  @Column({ nullable: true })
  comentarioAprovacao?: string;

  @Column({ nullable: true })
  responsavelProcessamentoId?: string;

  @Column({ nullable: true })
  fornecedorSugestaoId?: string;
}
