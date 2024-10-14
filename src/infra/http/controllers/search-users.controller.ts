import { Controller, Get, Query } from '@nestjs/common'
import { SearchUsersUseCase } from 'src/domain/application/use-cases/search-users'
import { User } from 'src/domain/enterprise/entities/user'

@Controller('users')
export class SearchUsersController {
  constructor(private searchUsersUseCase: SearchUsersUseCase) {}

  @Get('search')
  async searchUsers(
    @Query('page') page: string = '1', // Recebe como string
    @Query('perPage') perPage: string = '10',
  ): Promise<{
    users: User[]
    total: number
    currentPage: number
    perPage: number
  }> {
    const pageNumber = parseInt(page, 10) // Converte para número
    const perPageNumber = parseInt(perPage, 10)

    const result = await this.searchUsersUseCase.execute(
      pageNumber,
      perPageNumber,
    )

    if (result.isSuccess()) {
      return result.value
    }

    throw new Error('Unexpected error')
  }
}
