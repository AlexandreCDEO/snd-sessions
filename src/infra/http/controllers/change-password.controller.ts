import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnauthorizedException,
  UnprocessableEntityException,
  UsePipes,
} from '@nestjs/common'
import { ChangePasswordUseCase } from 'src/domain/application/use-cases/change-password'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { WrongCredentialsError } from 'src/domain/application/use-cases/errors/wrong-credentials-errors'
import { PasswordEncryptionError } from 'src/domain/application/use-cases/errors/password-encryption-error'
import { PasswordMissmatchError } from 'src/domain/application/use-cases/errors/password-missmatch-error'
import { InvalidCurrentPasswordError } from 'src/domain/application/use-cases/errors/invalid-current-password-error'
import { NewPasswordEqualError } from 'src/domain/application/use-cases/errors/new-password-equal-error'
import { MainGroupOfCompaniesNotExistsError } from 'src/domain/application/use-cases/errors/main-group-of-companies-not-exists-error'
import { CompanyDefinedAsMainNotExistsError } from 'src/domain/application/use-cases/errors/company-defined-as-main-not-exists'
import { PasswordOnlyNumbersError } from 'src/domain/application/use-cases/errors/password-only-numbers-error'
import { PasswordComplexityError } from 'src/domain/application/use-cases/errors/password-complexity-error'
import { PasswordNoSpecialCharactersError } from 'src/domain/application/use-cases/errors/password-no-special-characters-error'
import { PasswordRecentlyUsedError } from 'src/domain/application/use-cases/errors/password-recently-used-error'

const changePasswordBodySchema = z.object({
  id: z.number().min(1, { message: 'O id é obrigatório' }),
  password: z.string().min(1, { message: 'A senha é obrigatória. Verifique!' }),
  newPassword: z
    .string()
    .min(1, { message: 'A senha é obrigatória. Verifique!' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'A senha é obrigatória. Verifique!' }),
})

type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>

@Controller('/change-password')
export class ChangePasswordController {
  constructor(private service: ChangePasswordUseCase) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(changePasswordBodySchema))
  async handle(@Body() body: ChangePasswordBodySchema) {
    const { id, password, newPassword, confirmPassword } = body
    const result = await this.service.execute({
      userId: id,
      password,
      newPassword,
      confirmPassword,
    })

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError || InvalidCurrentPasswordError:
          throw new UnauthorizedException(error.message)

        case PasswordEncryptionError:
          throw new InternalServerErrorException(error.message)

        case PasswordMissmatchError ||
          NewPasswordEqualError ||
          PasswordOnlyNumbersError ||
          PasswordComplexityError ||
          PasswordNoSpecialCharactersError ||
          PasswordRecentlyUsedError:
          throw new UnprocessableEntityException(error.message)

        case MainGroupOfCompaniesNotExistsError ||
          CompanyDefinedAsMainNotExistsError:
          throw new NotFoundException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      message: 'Senha alterada com sucesso.',
    }
  }
}
