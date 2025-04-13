import { Entity, Column, BaseEntity } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ primary: true, generated: true })
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: false })
  isActive: boolean;
}