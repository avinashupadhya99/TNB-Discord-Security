import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Key {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public userid: string;

    @Column()
    public signingkey: string;
}