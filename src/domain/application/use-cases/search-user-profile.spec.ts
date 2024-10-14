import { Test, TestingModule } from '@nestjs/testing'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { User } from 'src/domain/enterprise/entities/user'
import { failure, success } from 'src/core/either'
import { SearchUserProfileUseCase } from './search-user-Profile'

describe('Buscar perfil do usuário(search-user-profile.spec.ts)', () => {
  let searchUserProfileUseCase: SearchUserProfileUseCase
  let usersRepository: UsersRepository

  const mockUser = User.create({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '123456',
    username: 'JhonDoe',
  })

  const mockUsersRepository = {
    findById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchUserProfileUseCase,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile()

    searchUserProfileUseCase = module.get<SearchUserProfileUseCase>(
      SearchUserProfileUseCase,
    )
    usersRepository = module.get<UsersRepository>(UsersRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Deve retornar um usuário quando encontrado(search-user-profile.spec.ts)', async () => {
    mockUsersRepository.findById.mockResolvedValue(mockUser)

    const result = await searchUserProfileUseCase.execute({ userId: 1 })

    expect(result).toEqual(success({ user: mockUser }))
    expect(usersRepository.findById).toHaveBeenCalledWith(1)
  })

  it('deve retornar ResourceNotFoundError quando o usuário não for encontrado(search-user-profile.spec.ts)', async () => {
    mockUsersRepository.findById.mockResolvedValue(null)

    const result = await searchUserProfileUseCase.execute({ userId: 2 })

    expect(result).toEqual(failure(new ResourceNotFoundError()))
    expect(usersRepository.findById).toHaveBeenCalledWith(2)
  })
})
