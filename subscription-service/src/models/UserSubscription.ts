import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followedId: number;
}
