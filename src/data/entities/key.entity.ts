import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
class Key {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userid: string;

    @Column()
    signingkey: string;
}

export {Key}
