import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, failure, success } from 'src/core/either'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { User } from 'src/domain/enterprise/entities/user'

interface SearchUserUseCaseProps {
  userId: number
}

type SearchUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: User
  }
>

@Injectable()
export class SearchUserProfileUseCase {
  constructor(private repository: UsersRepository) {}

  async execute({
    userId,
  }: SearchUserUseCaseProps): Promise<SearchUserUseCaseResponse> {
    const user = await this.repository.findById(userId)

    if (!user) {
      return failure(new ResourceNotFoundError())
    }

    return success({
      user,
    })
  }
}
