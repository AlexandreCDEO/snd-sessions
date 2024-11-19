import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthenticateStudentUseCase } from 'src/domain/application/use-cases/authenticate-student'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { z } from 'zod'
import { WrongCredentialsError } from 'src/domain/application/use-cases/errors/wrong-credentials-errors'
import { PasswordEncryptionError } from 'src/domain/application/use-cases/errors/password-encryption-error'
import { MainGroupOfCompaniesNotExistsError } from 'src/domain/application/use-cases/errors/main-group-of-companies-not-exists-error'
import { UserOccurrencyError } from 'src/domain/application/use-cases/errors/user-occurrenct-error'
import { StudentBlockedError } from 'src/domain/application/use-cases/errors/student-blocked-error'
import { PasswordIsEmptyError } from 'src/domain/application/use-cases/errors/password-is-empty-error'

const authenticateBodySchema = z.object({
  username: z.string().min(1, { message: 'O usuário é obrigatório' }),
  password: z.string().min(1, { message: 'A senha é obrigatória' }),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/student-sessions')
export class AuthenticateStudentController {
  constructor(
    private jwt: JwtService,
    private service: AuthenticateStudentUseCase,
  ) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { username, password } = body

    const result = await this.service.execute({
      username: username.trim().toUpperCase(),
      password: password.trim(),
    })

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)

        case PasswordEncryptionError:
          throw new InternalServerErrorException(error.message)

        case MainGroupOfCompaniesNotExistsError:
          throw new NotFoundException(error.message)

        case UserOccurrencyError:
          throw new InternalServerErrorException(error.message)

        case StudentBlockedError:
          throw new ForbiddenException(error.message)

        case PasswordIsEmptyError:
          throw new UnauthorizedException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    const data = result.value

    let token: string | undefined

    if (data.student && !data.shouldChangePassword) {
      token = this.jwt.sign({ sub: data.student.id })
    }

    return {
      token: token ?? null,
      registrations: data.registrations ?? [],
      userIdToChangePassword: data.shouldChangePassword
        ? data.student?.id
        : null,
    }
  }
}
