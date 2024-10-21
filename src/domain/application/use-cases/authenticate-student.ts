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

interface AuthenticateStudentUseCaseProps {
  username: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  | WrongCredentialsError
  | PasswordEncryptionError
  | MainGroupOfCompaniesNotExistsError,
  {
    student?: User
    registrations?: string[]
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private registrationsRepository: RegistrationsRepository,
    private companyGroupRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
  ) {}

  async execute({
    username,
    password,
  }: AuthenticateStudentUseCaseProps): Promise<AuthenticateStudentUseCaseResponse> {
    const companyGroup =
      await this.companyGroupRepository.searchMainGroupOfCompanies()

    if (!companyGroup) {
      return failure(new MainGroupOfCompaniesNotExistsError())
    }

    const companyDefinedAsMain =
      this.companyCompanyGroupsRepository.searchCompanyDefinedAsMain(
        companyGroup,
      )

    if (!companyDefinedAsMain) {
      return failure(new CompanyDefinedAsMainNotExistsError())
    }

    let studentFromRegistration =
      await this.usersRepository.findByUsername(username)

    if (!studentFromRegistration) {
      const registrationsFromDocument =
        await this.registrationsRepository.findByDocument(username)

      if (registrationsFromDocument.length === 0) {
        return failure(new WrongCredentialsError())
      }

      if (registrationsFromDocument.length > 1) {
        const registrationCodes = registrationsFromDocument.map(
          (registration) => registration.matriculacodigo,
        )

        return success({ registrations: registrationCodes })
      }

      studentFromRegistration = await this.usersRepository.findByUsername(
        registrationsFromDocument[0].matriculacodigo,
      )
    }

    if (!studentFromRegistration) {
      return failure(new WrongCredentialsError())
    }

    const dectyptedPassword = await this.usersRepository.cryptography(
      studentFromRegistration.password,
      studentFromRegistration.createdAt,
      OperationType.DESCRIPTOGRAFAR,
    )

    if (!dectyptedPassword) {
      return failure(new PasswordEncryptionError())
    }

    if (dectyptedPassword !== password) {
      return failure(new WrongCredentialsError())
    }

    return success({
      student: studentFromRegistration,
    })
  }
}
