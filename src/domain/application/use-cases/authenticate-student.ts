import { User } from 'src/domain/enterprise/entities/user'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { Either, failure, success } from 'src/core/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { RegistrationsRepository } from '../repositories/registrations-repository'
import { OperationType } from 'src/core/enums/operation-type'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { CompanyGroupsRepository } from '../repositories/company-groups-repository'
import { CompanyCompanyGroupsRepository } from '../repositories/company-company-groups-repository'
import { MainGroupOfCompaniesNotExistsError } from './errors/main-group-of-companies-not-exists-error'
import { CompanyDefinedAsMainNotExistsError } from './errors/company-defined-as-main-not-exists'
import { SecuryPoliciesRepository } from '../repositories/secury-policies-repository'
import { SecuryPolicyType } from 'src/core/enums/security-policy-type'
import { StudentBlockedError } from './errors/student-blocked-error'
import { PasswordIsEmptyError } from './errors/password-is-empty-error'
import { SecUserPassRepository } from '../repositories/secuser-pass-repository'
import { addDays } from 'date-fns'
import { UserOccurrenciesRepository } from '../repositories/user-occurrencies-repository'
import { TypeOccurrency } from 'src/core/enums/type-occurrency'
import { UserOccurrencyError } from './errors/user-occurrenct-error'
import { Registration } from 'src/domain/enterprise/entities/Registration'

interface AuthenticateStudentUseCaseProps {
  username: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  | WrongCredentialsError
  | PasswordEncryptionError
  | MainGroupOfCompaniesNotExistsError
  | StudentBlockedError
  | PasswordIsEmptyError
  | UserOccurrencyError,
  {
    student?: User
    registrations?: string[]
    shouldChangePassword?: boolean
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private registrationsRepository: RegistrationsRepository,
    private companyGroupRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private securyPoliciesRepository: SecuryPoliciesRepository,
    private secUserPassRepository: SecUserPassRepository,
    private userOccurrenciesRepository: UserOccurrenciesRepository,
  ) {}

  async execute({
    username,
    password,
  }: AuthenticateStudentUseCaseProps): Promise<AuthenticateStudentUseCaseResponse> {
    const companyGroup = await this.findCompanyGroup()
    if (!companyGroup) return failure(new MainGroupOfCompaniesNotExistsError())

    const companyId = await this.findCompanyDefinedAsMain(companyGroup)
    if (!companyId) return failure(new CompanyDefinedAsMainNotExistsError())

    const result = await this.findStudentByUsernameOrDocument(username)
    if (!result) return failure(new WrongCredentialsError())
    if (Array.isArray(result)) {
      const registrationCodes = result.map((registration) =>
        registration.matriculacodigo.trim(),
      )

      return success({ registrations: registrationCodes })
    }
    const studentFromRegistration = result

    const studentValidationError = this.validateStudent(studentFromRegistration)
    if (studentValidationError) return failure(studentValidationError)

    const passwordMatchesError = await this.passwordMatchesValidate(
      studentFromRegistration,
      password,
    )
    if (passwordMatchesError) return failure(passwordMatchesError)

    const passwordExpired = await this.isPasswordExpired(
      studentFromRegistration.id,
      companyId,
    )
    if (passwordExpired || studentFromRegistration.temporaryPassword)
      return success({
        shouldChangePassword: true,
      })

    const userOccurrencyCreated = await this.createUserOccurrency(username)
    if (!userOccurrencyCreated) return failure(new UserOccurrencyError())

    return success({
      student: studentFromRegistration,
    })
  }

  private async findCompanyGroup(): Promise<number | null> {
    return this.companyGroupRepository.searchMainGroupOfCompanies()
  }

  private async findCompanyDefinedAsMain(
    companyGroup: number,
  ): Promise<number | null> {
    return this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
      companyGroup,
    )
  }

  private async createUserOccurrency(username: string): Promise<boolean> {
    const occurrency = await this.userOccurrenciesRepository.create(
      username,
      new Date(),
      TypeOccurrency.LOGIN,
      'ACESSO SIS',
      '',
    )
    return !!occurrency
  }

  private async isPasswordExpired(
    studentId: number,
    companyId: number,
  ): Promise<boolean> {
    const expirationDays =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.EXPIRACAO,
      )

    const lastPasswordChange =
      await this.secUserPassRepository.searchByUserId(studentId)

    if (!expirationDays || expirationDays === 999 || !lastPasswordChange)
      return false

    return addDays(lastPasswordChange, expirationDays) < new Date()
  }

  private validateStudent(student: User): Error | null {
    if (student.isBlocked) return new StudentBlockedError()
    if (!student.password) return new PasswordIsEmptyError()
    return null
  }

  private async findStudentByUsernameOrDocument(
    username: string,
  ): Promise<User | null | Registration[]> {
    const student = await this.usersRepository.findByUsername(username)
    if (student) return student

    const registrations =
      await this.registrationsRepository.findByDocument(username)

    if (registrations) {
      if (registrations.length > 1) {
        return registrations
      }

      if (registrations.length === 1) {
        return this.usersRepository.findByUsername(
          registrations[0].matriculacodigo,
        )
      }
    }

    return null
  }

  private async passwordMatchesValidate(
    student: User,
    password: string,
  ): Promise<Error | null> {
    const decryptedPassword = await this.usersRepository.cryptography(
      student.password,
      student.createdAt,
      OperationType.DESCRIPTOGRAFAR,
    )

    if (!decryptedPassword) return new PasswordEncryptionError()

    if (decryptedPassword !== password) return new WrongCredentialsError()

    return null
  }
}
