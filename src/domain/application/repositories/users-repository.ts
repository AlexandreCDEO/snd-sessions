import { User } from 'src/domain/enterprise/entities/user'
import { OperationType } from 'src/core/enums/operation-type'

export abstract class UsersRepository {
  abstract searchUsers(page: number, perPage: number): Promise<User[]>
  abstract countUsers(): Promise<number>
  abstract create(user: User): Promise<User | null>
  abstract findByUsername(username: string): Promise<User | null>
  abstract findById(userId: number): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract cryptography(
    password: string,
    registrationDate: Date,
    operationType: OperationType,
  ): Promise<string | null>
}
