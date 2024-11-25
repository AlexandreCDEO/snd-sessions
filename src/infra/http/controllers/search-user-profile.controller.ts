import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import { ResourceNotFoundError } from 'src/domain/application/use-cases/errors/resource-not-found'
import { SearchUserProfileUseCase } from 'src/domain/application/use-cases/search-user-Profile'
import { CurrentUser } from 'src/infra/auth/current-user-decorator'
import { JwtAuthGuard } from 'src/infra/auth/jwt-auth.guard'
import { TokenPayload } from 'src/infra/auth/jwt.strategy'

@Controller('/profile')
@UseGuards(JwtAuthGuard)
export class SearchUserProfileController {
  constructor(private service: SearchUserProfileUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() payload: TokenPayload) {
    const userId = payload.sub
    const result = await this.service.execute({ userId })
    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    const { user } = result.value

    return user
  }
}
