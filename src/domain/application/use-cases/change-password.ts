import { User } from 'src/domain/enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { Either, failure, success } from 'src/core/either'
import { OperationType } from 'src/core/enums/operation-type'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { PasswordMissmatchError } from './errors/password-missmatch-error'
import { UserUpdateError } from './errors/user-update-error'
import { Injectable } from '@nestjs/common'

interface ChangePasswordUseCaseProps {
  userId: number
  password: string
  newPassword: string
  confirmPassword: string
}

type ChangePasswordUseCaseResponse = Either<
  WrongCredentialsError | PasswordEncryptionError | PasswordMissmatchError,
  { user: User }
>

@Injectable()
export class ChangePasswordUseCase {
  constructor(private repository: UsersRepository) {}

  async execute({
    userId,
    password,
    newPassword,
    confirmPassword,
  }: ChangePasswordUseCaseProps): Promise<ChangePasswordUseCaseResponse> {
    /**
     * validar se existe usuario com este ID OK
     * validar se a senha informada é do userId OK
     * validar se a nova senha e confirmação são iguais OK
     * validar se atende as politicas de segurança caso existam
     * Se tudo for válido realizar a alteração de senha OK
     */

    const user = await this.repository.findById(userId)
    if (!user) return failure(new WrongCredentialsError())

    const passwordMatchesError = await this.passwordMatchesValidate(
      user,
      password,
    )

    if (passwordMatchesError) return failure(passwordMatchesError)

    if (newPassword !== confirmPassword)
      return failure(new PasswordMissmatchError())

    const hashedPassword = await this.repository.cryptography(
      newPassword,
      user.createdAt,
      OperationType.CRIPTOGRAFAR,
    )

    if (!hashedPassword) return failure(new PasswordEncryptionError())

    const updatedUser = await this.repository.update(
      userId,
      User.create({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        active: user.isActive,
        createdAt: user.createdAt,
        isBlocked: user.isBlocked,
        status: user.status,
        temporaryPassword: false,
        password: hashedPassword,
      }),
    )

    if (!updatedUser) return failure(new UserUpdateError())

    return success({
      user: updatedUser,
    })
  }

  private async passwordMatchesValidate(
    student: User,
    password: string,
  ): Promise<Error | null> {
    const decryptedPassword = await this.repository.cryptography(
      student.password,
      student.createdAt,
      OperationType.DESCRIPTOGRAFAR,
    )

    if (!decryptedPassword) return new PasswordEncryptionError()

    if (decryptedPassword !== password) return new WrongCredentialsError()

    return null
  }
}
