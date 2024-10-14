import { UsersRepository } from '../repositories/users-repository'
import { OperationType } from 'src/core/enums/operation-type'
import { User } from 'src/domain/enterprise/entities/user'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { AuthenticateUseCase } from './authenticate'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'

describe('Autenticar usuário(authenticate.spec.ts)', () => {
  let sut: AuthenticateUseCase
  let repository: jest.Mocked<UsersRepository>

  beforeEach(() => {
    repository = {
      findByUsername: jest.fn(),
      cryptography: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>

    sut = new AuthenticateUseCase(repository)
  })

  it('Deve autenticar com sucesso(authenticate.spec.ts)', async () => {
    const user = User.create({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: 'hashedPawword',
    })

    repository.findByUsername.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('123456')

    const result = await sut.execute({
      username: 'jhondoe',
      password: '123456',
    })

    expect(repository.findByUsername).toHaveBeenCalledWith('JHONDOE')
    expect(repository.cryptography).toHaveBeenCalledWith(
      'hashedPawword',
      expect.any(Date),
      OperationType.DESCRIPTOGRAFAR,
    )
    expect(result.isSuccess()).toBe(true)
  })

  it('Deve retornar erro caso não encontre usuário(authenticate.spec.ts)', async () => {
    repository.findByUsername.mockResolvedValue(null)

    const result = await sut.execute({
      username: 'jhondoe',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve lançar erro se ocorrer erro ao descriptografar senha(authenticate.spec.ts)', async () => {
    const user = User.create({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: 'hashedPawword',
    })

    repository.findByUsername.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue(null)

    const result = await sut.execute({
      username: 'jhondoe',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordEncryptionError)
  })

  it('Deve lançar erro se a senha estiver incorreta(authenticate.spec.ts)', async () => {
    const user = User.create({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: 'hashedPawword',
    })

    repository.findByUsername.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('123456')

    const result = await sut.execute({
      username: 'jhondoe',
      password: '1234567',
    })

    expect(repository.findByUsername).toHaveBeenCalledWith('JHONDOE')
    expect(repository.cryptography).toHaveBeenCalledWith(
      'hashedPawword',
      expect.any(Date),
      OperationType.DESCRIPTOGRAFAR,
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
