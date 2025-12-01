import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { User } from "../../../domain/user/user";
import { injectable } from "inversify";
import { UserMapper } from "../../persistence/mongoose/mappers/user.mapper";
import { UserModel } from "../../persistence/mongoose/models/user.model";

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find().lean();
    return docs.map(UserMapper.toDomain);
  }

  async save(entity: User): Promise<void> {
    const persistence = UserMapper.toPersistence(entity);
    await UserModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async update(entity: User): Promise<void> {
    const persistence = UserMapper.toPersistence(entity);
    await UserModel.findByIdAndUpdate(entity.id, persistence);
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}
