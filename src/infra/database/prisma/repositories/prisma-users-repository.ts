import { UsersRepository } from '../../../../domain/application/repositories/users-repository'
import { User } from '../../../../domain/enterprise/entities/user'
import { OperationType } from '../../../../core/enums/operation-type'
import { PrismaUsersMapper } from '../mappers/prisma-users-mapper'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  async searchUsers(page: number, perPage: number): Promise<User[]> {
    const skip = (page - 1) * perPage // Calcular quantos registros pular
    const users = await this.prisma.secUser.findMany({
      skip,
      take: perPage,
    })

    return PrismaUsersMapper.toDomainList(users)
  }

  async countUsers(): Promise<number> {
    const totalUsers = await this.prisma.secUser.count() // Contagem de todos os usuários
    return totalUsers
  }

  async findById(userId: number): Promise<User | null> {
    const user = await this.prisma.secUser.findUnique({
      where: {
        secuserid: userId,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUsersMapper.toDomain(user)
  }

  async create(user: User): Promise<User | null> {
    const userCreated = await this.prisma.secUser.create({
      data: PrismaUsersMapper.toPrisma(user),
    })

    if (!user) {
      return null
    }

    return PrismaUsersMapper.toDomain(userCreated)
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.secUser.findFirst({
      where: {
        secusername: username.toUpperCase(),
      },
    })

    if (!user) {
      return null
    }

    return PrismaUsersMapper.toDomain(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.secUser.findFirst({
      where: {
        secuseremail: email,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUsersMapper.toDomain(user)
  }

  async cryptography(
    password: string,
    registrationDate: Date,
    operationType: OperationType,
  ): Promise<string | null> {
    try {
      const result = await this.prisma.$queryRaw<[{ [key: string]: string }]>`
        select u_snd_cripstr(${password}, ${registrationDate.toISOString().replace('T', ' ').replace('Z', '')}::timestamp without time zone, ${operationType}::char) as result
      `

      if (result && result.length > 0) return result[0]?.result

      return null
    } catch (error) {
      throw new Error(
        `Erro ao ${operationType === 'E' ? 'criptografar' : 'descriptografar'} a senha`,
      )
    }
  }
}
