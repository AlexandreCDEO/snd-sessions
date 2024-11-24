import { User } from 'src/domain/enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { WrongCredentialsError } from './errors/wrong-credentials-errors'
import { Either, failure, success } from 'src/core/either'
import { OperationType } from 'src/core/enums/operation-type'
import { PasswordEncryptionError } from './errors/password-encryption-error'
import { PasswordMissmatchError } from './errors/password-missmatch-error'
import { UserUpdateError } from './errors/user-update-error'
import { Injectable } from '@nestjs/common'
import { InvalidCurrentPasswordError } from './errors/invalid-current-password-error'
import { NewPasswordEqualError } from './errors/new-password-equal-error'
import { SecuryPoliciesRepository } from '../repositories/secury-policies-repository'
import { CompanyGroupsRepository } from '../repositories/company-groups-repository'
import { CompanyCompanyGroupsRepository } from '../repositories/company-company-groups-repository'
import { MainGroupOfCompaniesNotExistsError } from './errors/main-group-of-companies-not-exists-error'
import { CompanyDefinedAsMainNotExistsError } from './errors/company-defined-as-main-not-exists'
import { SecuryPolicyType } from 'src/core/enums/security-policy-type'
import { MinumunNumberDigitsForPasswordError } from './errors/minimun-number-digits-password-error'
import { PasswordOnlyNumbersError } from './errors/password-only-numbers-error'
import { PasswordComplexityError } from './errors/password-complexity-error'
import { PasswordNoSpecialCharactersError } from './errors/password-no-special-characters-error'
import { SecUserPassRepository } from '../repositories/secuser-pass-repository'
import { PasswordRecentlyUsedError } from './errors/password-recently-used-error'

interface ChangePasswordUseCaseProps {
  userId: number
  password: string
  newPassword: string
  confirmPassword: string
}

type ChangePasswordUseCaseResponse = Either<
  | WrongCredentialsError
  | PasswordEncryptionError
  | PasswordMissmatchError
  | InvalidCurrentPasswordError
  | NewPasswordEqualError
  | MainGroupOfCompaniesNotExistsError
  | CompanyDefinedAsMainNotExistsError
  | PasswordOnlyNumbersError
  | PasswordComplexityError
  | PasswordNoSpecialCharactersError
  | PasswordRecentlyUsedError,
  { isSuccess: boolean }
>

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private securyPoliciesRepository: SecuryPoliciesRepository,
    private companyGroupRepository: CompanyGroupsRepository,
    private companyCompanyGroupsRepository: CompanyCompanyGroupsRepository,
    private secUserPassRepository: SecUserPassRepository,
  ) {}

  async execute({
    userId,
    password,
    newPassword,
    confirmPassword,
  }: ChangePasswordUseCaseProps): Promise<ChangePasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return failure(new WrongCredentialsError())

    const passwordMatchesError = await this.passwordMatchesValidate(
      user,
      password,
      newPassword,
    )

    if (passwordMatchesError) return failure(passwordMatchesError)

    if (newPassword !== confirmPassword)
      return failure(new PasswordMissmatchError())

    const companyGroup = await this.findCompanyGroup()
    if (!companyGroup) return failure(new MainGroupOfCompaniesNotExistsError())

    const companyId = await this.findCompanyDefinedAsMain(companyGroup)
    if (!companyId) return failure(new CompanyDefinedAsMainNotExistsError())

    const MinimunNumberOfDigitsForPassword =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.TAMANHO,
      )

    if (
      MinimunNumberOfDigitsForPassword &&
      newPassword.length < MinimunNumberOfDigitsForPassword
    )
      return failure(
        new MinumunNumberDigitsForPasswordError(
          MinimunNumberOfDigitsForPassword,
        ),
      )

    const passwordCompositionCriteria =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.COMPOSICAO,
      )

    if (passwordCompositionCriteria) {
      switch (passwordCompositionCriteria) {
        case 1: // Apenas Números
          if (!/^\d+$/.test(newPassword)) {
            return failure(new PasswordOnlyNumbersError())
          }
          break

        case 2: // Apenas Números e caracteres alfanuméricos
          if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
            return failure(new PasswordNoSpecialCharactersError())
          }
          break

        case 3: // Números, alfanuméricos e caracteres especiais
          if (
            !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/.test(
              newPassword,
            )
          ) {
            return failure(new PasswordComplexityError())
          }
          break
      }
    }

    const numberOfDaysToRepeatPassword =
      await this.securyPoliciesRepository.searchSecuryPolicyByType(
        companyId,
        SecuryPolicyType.REPETICAO_DIAS_SENHA,
      )

    if (
      numberOfDaysToRepeatPassword &&
      !(await this.secUserPassRepository.isPasswordReusable(
        userId,
        newPassword,
        numberOfDaysToRepeatPassword,
      ))
    ) {
      return failure(
        new PasswordRecentlyUsedError(numberOfDaysToRepeatPassword),
      )
    }

    const hashedPassword = await this.usersRepository.cryptography(
      newPassword,
      user.createdAt,
      OperationType.CRIPTOGRAFAR,
    )

    if (!hashedPassword) return failure(new PasswordEncryptionError())

    const isSuccessfullyChanged =
      await this.usersRepository.changeUserPasswords(
        companyId,
        userId,
        newPassword,
      )

    if (!isSuccessfullyChanged) return failure(new UserUpdateError())

    return success({
      isSuccess: isSuccessfullyChanged,
    })
  }

  private async passwordMatchesValidate(
    student: User,
    password: string,
    newPassword: string,
  ): Promise<Error | null> {
    const decryptedPassword = await this.usersRepository.cryptography(
      student.password,
      student.createdAt,
      OperationType.DESCRIPTOGRAFAR,
    )

    if (!decryptedPassword) return new PasswordEncryptionError()

    if (decryptedPassword !== password) return new InvalidCurrentPasswordError()

    if (newPassword === decryptedPassword) return new NewPasswordEqualError()
    return null
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
}
