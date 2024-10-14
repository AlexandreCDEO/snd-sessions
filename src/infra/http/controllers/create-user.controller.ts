import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UsePipes,
} from '@nestjs/common'
import { CreateUserUseCase } from 'src/domain/application/use-cases/create-user'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { UsernameExistsError } from 'src/domain/application/use-cases/errors/username-exists-error'
import { EmailExistsError } from 'src/domain/application/use-cases/errors/email-exists-error'
import { PasswordEncryptionError } from 'src/domain/application/use-cases/errors/password-encryption-error'

const createUserBodySchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório. Verifique!' }),
  email: z.string().email({ message: 'Informe um email válido.' }),
  username: z
    .string()
    .min(1, { message: 'O usuário é obrigatório. Verifique!' }),
  password: z.string().min(1, { message: 'A senha é obrigatória. Verifique!' }),
})

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>

@Controller('/users')
export class CreateUserController {
  constructor(private service: CreateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  @HttpCode(201)
  async handle(@Body() props: CreateUserBodySchema) {
    const { email, name, password, username } = props

    const result = await this.service.execute({
      email,
      name,
      password,
      username,
    })

    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UsernameExistsError:
          throw new ConflictException(error.message)

        case EmailExistsError:
          throw new ConflictException(error.message)

        case PasswordEncryptionError:
          throw new InternalServerErrorException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
