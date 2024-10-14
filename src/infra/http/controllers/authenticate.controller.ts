import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { AuthenticateUseCase } from 'src/domain/application/use-cases/authenticate'
import { WrongCredentialsError } from 'src/domain/application/use-cases/errors/wrong-credentials-errors'
import { PasswordEncryptionError } from 'src/domain/application/use-cases/errors/password-encryption-error'

const authenticateBodySchema = z.object({
  username: z.string().min(1, { message: 'O usuário é obrigatório' }),
  password: z.string().min(1, { message: 'A senha é obrigatória' }),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private service: AuthenticateUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { username, password } = body
    console.log('controller', username, password)
    const result = await this.service.execute({
      username,
      password,
    })

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)

        case PasswordEncryptionError:
          throw new InternalServerErrorException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    const { user } = result.value
    console.log('user: user')
    const token = this.jwt.sign({
      sub: user.id,
    })

    return token
  }
}
