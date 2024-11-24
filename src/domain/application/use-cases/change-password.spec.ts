import { User } from 'src/domain/enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { ChangePasswordUseCase } from './change-password'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { UserStatus } from 'src/core/enums/user-status'
import { PasswordMissmatchError } from './errors/password-missmatch-error'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { NewPasswordEqualError } from './errors/new-password-equal-error'
import { InvalidCurrentPasswordError } from './errors/invalid-current-password-error'
import { SecuryPoliciesRepository } from '../repositories/secury-policies-repository'
import { CompanyGroupsRepository } from '../repositories/company-groups-repository'
import { CompanyCompanyGroupsRepository } from '../repositories/company-company-groups-repository'
import { SecUserPassRepository } from '../repositories/secuser-pass-repository'
import { MinumunNumberDigitsForPasswordError } from './errors/minimun-number-digits-password-error'
import { PasswordOnlyNumbersError } from './errors/password-only-numbers-error'
import { PasswordNoSpecialCharactersError } from './errors/password-no-special-characters-error'
import { PasswordComplexityError } from './errors/password-complexity-error'
import { PasswordRecentlyUsedError } from './errors/password-recently-used-error'
import { MainGroupOfCompaniesNotExistsError } from './errors/main-group-of-companies-not-exists-error'
import { CompanyDefinedAsMainNotExistsError } from './errors/company-defined-as-main-not-exists'
import { UserUpdateError } from './errors/user-update-error'

describe('Alterar senha (change-password)', () => {
  let repository: jest.Mocked<UsersRepository>
  let securyPoliciesRepository: jest.Mocked<SecuryPoliciesRepository>
  let companyGroupRepository: jest.Mocked<CompanyGroupsRepository>
  let companyCompanyGroupsRepository: jest.Mocked<CompanyCompanyGroupsRepository>
  let secUserPassRepository: jest.Mocked<SecUserPassRepository>
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
      changeUserPasswords: jest.fn(),
      cryptography: jest.fn(),
    } as jest.Mocked<UsersRepository>

    securyPoliciesRepository = {
      searchSecuryPolicyByType: jest.fn(),
    } as jest.Mocked<SecuryPoliciesRepository>

    companyGroupRepository = {
      searchMainGroupOfCompanies: jest.fn(),
    } as jest.Mocked<CompanyGroupsRepository>

    companyCompanyGroupsRepository = {
      searchCompanyDefinedAsMain: jest.fn(),
    } as jest.Mocked<CompanyCompanyGroupsRepository>

    secUserPassRepository = {
      searchByUserId: jest.fn(),
      isPasswordReusable: jest.fn(),
    } as jest.Mocked<SecUserPassRepository>

    sut = new ChangePasswordUseCase(
      repository,
      securyPoliciesRepository,
      companyGroupRepository,
      companyCompanyGroupsRepository,
      secUserPassRepository,
    )
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
    expect(result.value).toBeInstanceOf(InvalidCurrentPasswordError)
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

  it('Deve retornar erro caso seja enviado nova senha e senha atual iguais(change-password)', async () => {
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
      password: 'password',
    })

    repository.findById.mockResolvedValue(user)
    repository.cryptography.mockResolvedValue('password')

    const result = await sut.execute({
      userId: user.id,
      password: user.password,
      newPassword: 'password',
      confirmPassword: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NewPasswordEqualError)
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

  it('Deve retornar erro quando o grupo principal da empresa não existe (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('teste@123')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(null)

    const result = await sut.execute({
      userId: 1,
      password: 'teste@123',
      newPassword: 'teste@1234',
      confirmPassword: 'teste@1234',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(MainGroupOfCompaniesNotExistsError)
  })

  it('Deve retornar erro quando a empresa principal não existe (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('teste@123')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      null,
    )

    const result = await sut.execute({
      userId: 1,
      password: 'teste@123',
      newPassword: 'teste@1234',
      confirmPassword: 'teste@1234',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CompanyDefinedAsMainNotExistsError)
  })

  it('Deve retornar erro quando a nova senha não atende ao tamanho mínimo (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType.mockResolvedValueOnce(8) // Tamanho mínimo da senha

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'short',
      confirmPassword: 'short',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(MinumunNumberDigitsForPasswordError)
  })

  it('Deve retornar erro quando a nova senha contém caracteres não permitidos (apenas números) (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(1) // Critério: Apenas números

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordOnlyNumbersError)
  })

  it('Deve retornar erro quando a nova senha contém caracteres especiais não permitidos (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2) // Critério: Apenas números e letras

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'password@123',
      confirmPassword: 'password@123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordNoSpecialCharactersError)
  })

  it('Deve retornar erro quando a nova senha não contém a complexidade exigida (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'simplepassword',
      confirmPassword: 'simplepassword',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordComplexityError)
  })

  it('Deve retornar erro quando a nova senha já foi utilizada recentemente (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('recentPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(30) // 30 dias de repetição
    secUserPassRepository.isPasswordReusable.mockResolvedValue(false) // Não reutilizável

    const result = await sut.execute({
      userId: user.id,
      password: 'recentPassword',
      newPassword: 'recent@Password1',
      confirmPassword: 'recent@Password1',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordRecentlyUsedError)
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade
    repository.changeUserPasswords.mockResolvedValue(false)

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'simple@password123',
      confirmPassword: 'simple@password123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserUpdateError)
  })

  it('Deve alterar a senha corretamente quando tudo estiver correto (change-password)', async () => {
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
    repository.cryptography.mockResolvedValue('decryptedPassword')
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )
    securyPoliciesRepository.searchSecuryPolicyByType
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3) // Critério: Complexidade
    repository.changeUserPasswords.mockResolvedValue(true)

    const result = await sut.execute({
      userId: user.id,
      password: 'decryptedPassword',
      newPassword: 'simple@password123',
      confirmPassword: 'simple@password123',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({ isSuccess: true })
  })
})
