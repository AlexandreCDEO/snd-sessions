import { User } from 'src/domain/enterprise/entities/user'
import { CompanyCompanyGroupsRepository } from '../repositories/company-company-groups-repository'
import { CompanyGroupsRepository } from '../repositories/company-groups-repository'
import { RegistrationsRepository } from '../repositories/registrations-repository'
import { SecuryPoliciesRepository } from '../repositories/secury-policies-repository'
import { SecUserPassRepository } from '../repositories/secuser-pass-repository'
import { UserOccurrenciesRepository } from '../repositories/user-occurrencies-repository'
import { UsersRepository } from '../repositories/users-repository'
import { AuthenticateStudentUseCase } from './authenticate-student'
import { MainGroupOfCompaniesNotExistsError } from './errors/main-group-of-companies-not-exists-error'
import { StudentBlockedError } from './errors/student-blocked-error'
import { PasswordIsEmptyError } from './errors/password-is-empty-error'
import { UserOccurrency } from 'src/domain/enterprise/entities/user-occurrency'
import { TypeOccurrency } from 'src/core/enums/type-occurrency'
import { subDays } from 'date-fns'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { CompanyDefinedAsMainNotExistsError } from './errors/company-defined-as-main-not-exists'
import { Registration } from 'src/domain/enterprise/entities/Registration'
import { UserOccurrencyError } from './errors/user-occurrenct-error'

describe('Autenticar estudante(authenticate-student.ts)', () => {
  let usersRepository: jest.Mocked<UsersRepository>
  let registrationsRepository: jest.Mocked<RegistrationsRepository>
  let companyGroupRepository: jest.Mocked<CompanyGroupsRepository>
  let companyCompanyGroupsRepository: jest.Mocked<CompanyCompanyGroupsRepository>
  let securyPoliciesRepository: jest.Mocked<SecuryPoliciesRepository>
  let secUserPassRepository: jest.Mocked<SecUserPassRepository>
  let userOccurrenciesRepository: jest.Mocked<UserOccurrenciesRepository>

  let sut: AuthenticateStudentUseCase

  beforeEach(() => {
    usersRepository = {
      findByUsername: jest.fn(),
      cryptography: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>

    registrationsRepository = {
      findByDocument: jest.fn(),
    } as unknown as jest.Mocked<RegistrationsRepository>

    companyGroupRepository = {
      searchMainGroupOfCompanies: jest.fn(),
    } as unknown as jest.Mocked<CompanyGroupsRepository>

    companyCompanyGroupsRepository = {
      searchCompanyDefinedAsMain: jest.fn(),
    } as unknown as jest.Mocked<CompanyCompanyGroupsRepository>

    securyPoliciesRepository = {
      searchSecuryPolicyByType: jest.fn(),
    } as unknown as jest.Mocked<SecuryPoliciesRepository>

    secUserPassRepository = {
      searchByUserId: jest.fn(),
    } as unknown as jest.Mocked<SecUserPassRepository>

    userOccurrenciesRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UserOccurrenciesRepository>

    sut = new AuthenticateStudentUseCase(
      usersRepository,
      registrationsRepository,
      companyGroupRepository,
      companyCompanyGroupsRepository,
      securyPoliciesRepository,
      secUserPassRepository,
      userOccurrenciesRepository,
    )
  })

  it('Deve retornar erro quando não encontrar o grupo de empresas(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(null)
    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(MainGroupOfCompaniesNotExistsError)
  })

  it('Deve retornar erro quando não encontrar empresa definida como principal(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      null,
    )

    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CompanyDefinedAsMainNotExistsError)
  })

  it('Deve retornar erro quando estudante estiver bloqueado(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'password',
      isBlocked: true,
    })

    usersRepository.findByUsername.mockResolvedValue(student)

    const result = await sut.execute({
      username: 'student',
      password: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(StudentBlockedError)
  })

  it('Deve retornar erro quando a senha do estudante estiver vazia(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: '',
    })

    usersRepository.findByUsername.mockResolvedValue(student)

    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordIsEmptyError)
  })

  it('Deve retornar sucesso quando as credenciais forem válidas(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'encrypted-password',
    })

    const userOcurrency = UserOccurrency.create({
      usuCod: 'student',
      usuDtaOco: new Date(),
      usuTipOco: TypeOccurrency.LOGIN,
      usuMenOco: 'SIS',
    })

    usersRepository.findByUsername.mockResolvedValue(student)
    usersRepository.cryptography.mockResolvedValue('123456')
    userOccurrenciesRepository.create.mockResolvedValue(userOcurrency)

    const result = await sut.execute({
      username: 'student',
      password: '123456',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toHaveProperty('student', student)
  })

  it('Deve solicitar a troca de senha quando a senha for temporária(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'encrypted-password',
      temporaryPassword: true,
    })

    usersRepository.findByUsername.mockResolvedValue(student)
    usersRepository.cryptography.mockResolvedValue('123456')

    const result = await sut.execute({
      username: 'student',
      password: '123456',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toHaveProperty('shouldChangePassword', true)
  })

  it('Deve solicitar a troca de senha quando a senha estiver expirada(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'encrypted-password',
    })

    const fiveDaysAgo = subDays(new Date(), 5)

    usersRepository.findByUsername.mockResolvedValue(student)
    usersRepository.cryptography.mockResolvedValue('123456')
    securyPoliciesRepository.searchSecuryPolicyByType.mockResolvedValue(1)
    secUserPassRepository.searchByUserId.mockResolvedValue(fiveDaysAgo)

    const result = await sut.execute({
      username: 'student',
      password: '123456',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toHaveProperty('shouldChangePassword', true)
  })

  it('Deve retornar erro quando o usuário não for encontrado(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    usersRepository.findByUsername.mockResolvedValue(null)

    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar erro se a senha estiver incorreta(authenticate-student.ts)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'encrypted-password',
    })

    usersRepository.findByUsername.mockResolvedValue(student)
    usersRepository.cryptography.mockResolvedValue('123456')

    const result = await sut.execute({
      username: 'student',
      password: '123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('Deve retornar array de matriculas quando o username ou documento corresponda a várias matriculas(authenticate-student)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const registrations: Registration[] = [
      Registration.create({
        empresaid: 1,
        matriculacodigo: 'MAT2024001',
        alunoparticipantecod: BigInt(1001),
        alunoparticipantefilialcod: 10,
        matriculasituacaoacademica: 'Ativo',
        matriculaidpf: '123.456.789-00',
        matriculaidmoodle: 'moodle_001',
        matriculasituacaoaluno: true,
        periodoescolarid: 1,
        periodoescolaratualid: 1,
        cursocodigo: BigInt(101),
        turmacodigo: 1001,
      }),
      Registration.create({
        empresaid: 1,
        matriculacodigo: 'MAT2024002',
        alunoparticipantecod: BigInt(1002),
        matriculasituacaoacademica: 'Inativo',
        matriculaidpf: '987.654.321-00',
        matriculaidmoodle: 'moodle_002',
        matriculasituacaoaluno: false,
        periodoescolarid: 2,
        periodoescolaratualid: 2,
        cursocodigo: BigInt(102),
        turmacodigo: 1002,
      }),
      Registration.create({
        empresaid: 1,
        matriculacodigo: 'MAT2024003',
        alunoparticipantecod: BigInt(1003),
        alunoparticipantefilialcod: 12,
        matriculasituacaoacademica: 'Ativo',
        matriculaidpf: '111.222.333-44',
        matriculaidmoodle: 'moodle_003',
        matriculasituacaoaluno: true,
        periodoescolarid: 3,
        periodoescolaratualid: 3,
        cursocodigo: BigInt(103),
        turmacodigo: 1003,
      }),
    ]

    const registrationCodes: string[] = [
      'MAT2024001',
      'MAT2024002',
      'MAT2024003',
    ]

    registrationsRepository.findByDocument.mockResolvedValue(registrations)

    const result = await sut.execute({
      username: 'username',
      password: 'password',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toHaveProperty('registrations', registrationCodes)
  })

  it('Deve retornar erro se ocorrer erro ao gerar ocorrência de login(authenticate-student)', async () => {
    companyGroupRepository.searchMainGroupOfCompanies.mockResolvedValue(1)
    companyCompanyGroupsRepository.searchCompanyDefinedAsMain.mockResolvedValue(
      1,
    )

    const student = User.create({
      username: 'student',
      email: 'student@example.com',
      name: 'name',
      password: 'encrypted-password',
    })

    usersRepository.findByUsername.mockResolvedValue(student)
    usersRepository.cryptography.mockResolvedValue('123456')
    userOccurrenciesRepository.create.mockResolvedValue(null)

    const result = await sut.execute({
      username: 'student',
      password: '123456',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserOccurrencyError)
  })
})
