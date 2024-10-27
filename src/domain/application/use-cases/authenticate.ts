import { Injectable } from '@nestjs/common'
import { UsersRepository } from 'src/domain/application/repositories/users-repository'
import { Either, failure, success } from 'src/core/either'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { OperationType } from 'src/core/enums/operation-type'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { User } from 'src/domain/enterprise/entities/user'

interface AuthenticaUseCaseProps {
  username: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  {
    user: User
  }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(private repository: UsersRepository) {}

  async execute({
    username,
    password,
  }: AuthenticaUseCaseProps): Promise<AuthenticateUseCaseResponse> {
    const user = await this.repository.findByUsername(username.toUpperCase())

    if (!user) {
      return failure(new WrongCredentialsError())
    }

    const dectyptedPassword = await this.repository.cryptography(
      user.password,
      user.createdAt,
      OperationType.DESCRIPTOGRAFAR,
    )

    if (!dectyptedPassword) {
      return failure(new PasswordEncryptionError())
    }

    if (dectyptedPassword !== password) {
      return failure(new WrongCredentialsError())
    }

    return success({
      user,
    })
  }
}
