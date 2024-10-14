import { Injectable } from '@nestjs/common'
import { User } from 'src/domain/enterprise/entities/user'
import { UsersRepository } from 'src/domain/application/repositories/users-repository'
import { OperationType } from 'src/core/enums/operation-type'
import { Either, failure, success } from 'src/core/either'
import { UsernameExistsError } from './errors/username-exists-error'
import { EmailExistsError } from './errors/email-exists-error'
import { PasswordEncryptionError } from './errors/password-encryption-error'

interface CreateUserUseCaseProps {
  name: string
  email: string
  username: string
  password: string
}

type CreateUserUseCaseResponse = Either<
  UsernameExistsError | EmailExistsError | PasswordEncryptionError,
  {
    user: User
  }
>

@Injectable()
export class CreateUserUseCase {
  constructor(private repository: UsersRepository) {}

  async execute({
    name,
    email,
    username,
    password,
  }: CreateUserUseCaseProps): Promise<CreateUserUseCaseResponse> {
    const userWithSameUsername = await this.repository.findByUsername(
      username.toUpperCase(),
    )

    if (userWithSameUsername) return failure(new UsernameExistsError())

    const userWithSameEmail = await this.repository.findByEmail(email)

    if (userWithSameEmail) return failure(new EmailExistsError())

    const createdAt = new Date()

    const passwordHashed = await this.repository.cryptography(
      password,
      createdAt,
      OperationType.CRIPTOGRAFAR,
    )

    if (!passwordHashed) {
      return failure(new PasswordEncryptionError())
    }

    const newUser = User.create({
      name,
      email,
      username: username.toUpperCase(),
      password: passwordHashed,
      createdAt,
    })

    const user = await this.repository.create(newUser)

    if (!user) {
      return failure(new PasswordEncryptionError())
    }

    return success({
      user,
    })
  }
}
