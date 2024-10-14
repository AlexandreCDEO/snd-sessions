import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { User } from 'src/domain/enterprise/entities/user'
import { Either, success } from 'src/core/either'

type SearchUsersUseCaseResponse = Either<
  never, // Não há erro, por isso usamos 'never'
  {
    users: User[]
    total: number // Total de usuários (para calcular número de páginas)
    currentPage: number
    perPage: number
  }
>

@Injectable()
export class SearchUsersUseCase {
  constructor(private repository: UsersRepository) {}

  async execute(
    page: number,
    perPage: number,
  ): Promise<SearchUsersUseCaseResponse> {
    const users = await this.repository.searchUsers(page, perPage)
    const total = await this.repository.countUsers()

    return success({
      users,
      total,
      currentPage: page,
      perPage,
    })
  }
}
