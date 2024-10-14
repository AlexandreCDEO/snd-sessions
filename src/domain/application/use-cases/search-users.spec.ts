import { UsersRepository } from '../repositories/users-repository'
import { User } from 'src/domain/enterprise/entities/user'
import { SearchUsersUseCase } from './search-users'
import { UserStatus } from 'src/core/enums/user-status'

describe('SearchUsersUseCase', () => {
  let searchUsersUseCase: SearchUsersUseCase
  let usersRepository: UsersRepository

  beforeEach(() => {
    // Mock do repositório
    usersRepository = {
      searchUsers: jest.fn(),
      countUsers: jest.fn(),
    } as unknown as UsersRepository

    // Instância do caso de uso com o mock
    searchUsersUseCase = new SearchUsersUseCase(usersRepository)
  })

  it('deve buscar usuários com paginação corretamente', async () => {
    const mockUsers: User[] = [
      User.create({
        id: 1,
        email: 'test1@example.com',
        name: 'Test User 1',
        password: 'hashedpassword',
        username: 'testuser1',
        createdAt: new Date(),
        isBlocked: false,
        temporaryPassword: false,
        status: UserStatus.ACTIVE,
        active: true,
      }),

      User.create({
        id: 2,
        email: 'test2@example.com',
        name: 'Test User 2',
        password: 'hashedpassword',
        username: 'testuser2',
        createdAt: new Date(),
        active: true,
        isBlocked: false,
        temporaryPassword: false,
        status: UserStatus.ACTIVE,
      }),
    ]

    // Mock do método searchUsers
    ;(usersRepository.searchUsers as jest.Mock).mockResolvedValue(mockUsers)

    // Mock do método countUsers
    ;(usersRepository.countUsers as jest.Mock).mockResolvedValue(20)

    const result = await searchUsersUseCase.execute(1, 10)

    expect(usersRepository.searchUsers).toHaveBeenCalledWith(1, 10)
    expect(usersRepository.countUsers).toHaveBeenCalled()

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      users: mockUsers,
      total: 20,
      currentPage: 1,
      perPage: 10,
    })
  })

  it('deve retornar uma lista vazia se não houver usuários', async () => {
    // Mock para retornar lista vazia
    ;(usersRepository.searchUsers as jest.Mock).mockResolvedValue([])
    ;(usersRepository.countUsers as jest.Mock).mockResolvedValue(0)

    const result = await searchUsersUseCase.execute(1, 10)

    expect(usersRepository.searchUsers).toHaveBeenCalledWith(1, 10)
    expect(usersRepository.countUsers).toHaveBeenCalled()

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      users: [],
      total: 0,
      currentPage: 1,
      perPage: 10,
    })
  })
})
