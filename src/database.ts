import { DeleteResult, getRepository, InsertResult, Repository } from 'typeorm';
import { Key } from './data/entities/key.entity';

export class KeysRepository  {
    public async findByUserID(userID: string): Promise<Key[]> {
        const repository: Repository<Key> = getRepository(Key);
        return repository.find({userid: userID});
    }

    public async insert(key: Key): Promise<InsertResult> {
        const repository: Repository<Key> = getRepository(Key);
        return repository.insert(key);
    }

    public async deleteByUserID(userID: string): Promise<DeleteResult> {
        const repository: Repository<Key> = getRepository(Key);
        return repository.delete({userid: userID});
    }
}