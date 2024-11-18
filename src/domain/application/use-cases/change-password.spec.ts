import { User } from 'src/domain/enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { ChangePasswordUseCase } from './change-password'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { UserStatus } from 'src/core/enums/user-status'
import { PasswordMissmatchError } from './errors/password-missmatch-error'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { UserUpdateError } from './errors/user-update-error'

describe('Alterar senha (change-password)', () => {
  let repository: jest.Mocked<UsersRepository>
  let sut: ChangePasswordUseCase

  beforeEach(() => {
    repository = {
      searchUsers: jest.fn(),
      countUsers: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      cryptography: jest.fn(),
    } as jest.Mocked<UsersRepository>

    sut = new ChangePasswordUseCase(repository)
  })

  it('Deve retornar erro quando não encontrar o usuário informado (change-password)', async () => {
    repository.findById.mockResolvedValue(null)

    const result = await sut.execute({
      userId: 1,
      password: 'currentPassword',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
    expect(repository.findById).toHaveBeenCalledWith(1)
  })

  it('Deve retornar erro quando a senha atual estiver incorreta (change-password)', async () => {
    const user = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: new Date(),
      password: 'hashedPassword',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('incorrectHashedPassword')

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar erro quando a nova e confirmação forem diferentes (change-password)', async () => {
    const user = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: new Date(),
      password: 'hashedPassword',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('hashedPassword')

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'newPassword',
      confirmPassword: 'IncorrectNewPassword',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordMissmatchError)
  })

  it('Deve retornar erro quando falhar a criptografia de senha (change-password)', async () => {
    const user = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: new Date(),
      password: 'hashedPassword',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue(null)

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordEncryptionError)
  })

  it('Deve retornar erro quando falha a atualização dos dados do usuário (change-password)', async () => {
    const user = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: new Date(),
      password: 'hashedPassword',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('hashedPassword')
    repository.update.mockResolvedValue(null)

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUpdateError)
  })

  it('Deve alterar a senha corretamente quando tudo estiver correto (change-password)', async () => {
    const now = new Date()
    const user = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: now,
      password: 'hashedPassword',
    })

    const updateUser = User.create({
      id: 1,
      email: 'jhon-doe@mail.com',
      name: 'Jhon Doe',
      username: 'jhon-doe',
      active: true,
      isBlocked: true,
      status: UserStatus.ACTIVE,
      temporaryPassword: false,
      createdAt: now,
      password: 'newPasswordHashed',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography
      .mockResolvedValueOnce('hashedPassword')
      .mockResolvedValueOnce('newPasswordHashed')
    repository.update.mockResolvedValue(updateUser)

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({ user: updateUser })
  })
})
