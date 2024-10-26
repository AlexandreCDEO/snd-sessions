import { CompanyCompanyGroupsRepository } from '../repositories/company-company-groups-repository'
import { CompanyGroupsRepository } from '../repositories/company-groups-repository'
import { RegistrationsRepository } from '../repositories/registrations-repository'
import { SecuryPoliciesRepository } from '../repositories/secury-policies-repository'
import { SecUserPassRepository } from '../repositories/secuser-pass-repository'
import { UserOccurrenciesRepository } from '../repositories/user-occurrencies-repository'
import { UsersRepository } from '../repositories/users-repository'
import { AuthenticateStudentUseCase } from './authenticate-student'
import { MainGroupOfCompaniesNotExistsError } from './errors/main-group-of-companies-not-exists-error'

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
})
