import { CreateUserUseCase } from './create-user'
import { UsersRepository } from '../repositories/users-repository'
import { OperationType } from 'src/core/enums/operation-type'
import { User } from 'src/domain/enterprise/entities/user'
import { UsernameExistsError } from './errors/username-exists-error'
import { EmailExistsError } from './errors/email-exists-error'
import { PasswordEncryptionError } from './errors/password-encryption-error'

describe('Cadastro de usuário(create-user.spec.ts)', () => {
  let sut: CreateUserUseCase
  let repository: jest.Mocked<UsersRepository>

  beforeEach(() => {
    repository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      cryptography: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>

    sut = new CreateUserUseCase(repository)
  })

  it('Deve criar um novo usuário com sucesso(create-user.spec.ts)', async () => {
    const user = User.create({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: '123456',
    })

    repository.findByUsername.mockResolvedValue(null)
    repository.findByEmail.mockResolvedValue(null)
    repository.cryptography.mockResolvedValue('hashedPawword')
    repository.create.mockResolvedValue(user)

    const result = await sut.execute(user)

    expect(repository.findByUsername).toHaveBeenCalledWith('JHONDOE')
    expect(repository.findByEmail).toHaveBeenCalledWith('jhon-doe@example.com')
    expect(repository.cryptography).toHaveBeenCalledWith(
      '123456',
      expect.any(Date),
      OperationType.CRIPTOGRAFAR,
    )
    expect(repository.create).toHaveBeenCalledWith(expect.any(User))
    expect(result.isSuccess()).toBe(true)
  })

  it('Deve lançar erro se existir usuário com mesmo username(create-user.spec.ts)', async () => {
    repository.findByUsername.mockResolvedValue({} as User)

    const result = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UsernameExistsError)
  })

  it('Deve lançar erro se existir usuario com mesmo e-mail(create-user.spec.ts)', async () => {
    repository.findByEmail.mockResolvedValue({} as User)

    const result = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(EmailExistsError)
  })

  it('Deve lançar erro se ocorrer erro ao criptografar senha(create-user.spec.ts)', async () => {
    repository.cryptography.mockResolvedValue(null)

    const result = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhon-doe@example.com',
      username: 'jhondoe',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordEncryptionError)
  })
})
