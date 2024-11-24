import { UsersRepository } from '../../../../domain/application/repositories/users-repository'
import { User } from '../../../../domain/enterprise/entities/user'
import { OperationType } from '../../../../core/enums/operation-type'
import { PrismaUsersMapper } from '../mappers/prisma-users-mapper'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { TypeOccurrency } from 'src/core/enums/type-occurrency'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  async changeUserPasswords(
    companyId: number,
    userId: number,
    newPassword: string,
  ): Promise<boolean> {
    const result = await this.prisma.$queryRaw<
      { secuserid: number; secusername: string; secuserdataCadastro: Date }[]
    >`
      SELECT "secuserid", "secusername", "secuserdatacadastro" FROM "secuser"
      WHERE "secusername" IN (
        SELECT b."matriculacodigo" FROM "secparticipante" a
        JOIN "participante" c ON a."empresaid" = c."empresaid" AND a."participantecodigo" = c."participantecodigo"
        JOIN "participantefilial" d ON c."empresaid" = d."empresaid" AND c."participantecodigo" = d."participantecodigo"
        JOIN "matricula" b ON b."empresaid" = d."empresaid" AND b."alunoparticipantecod" = d."participantecodigo" AND b."alunoparticipantefilialcod" = d."participantefilialcodigo"
        WHERE a."empresaid" = ${companyId} AND a."secuserid" = ${userId})`

    if (result && result.length > 0) {
      const updatedUsers = await Promise.all(
        result.map(async (user) => {
          const encryptedPassword = await this.cryptography(
            newPassword,
            user.secuserdataCadastro,
            OperationType.CRIPTOGRAFAR,
          )
          if (!encryptedPassword) {
            throw new Error(
              `Erro ao realizar a criptografia de senha. Tente novamente mais tarde!`,
            )
          }

          return {
            secUserId: user.secuserid,
            secUserName: user.secusername,
            encryptedPassword,
          }
        }),
      )

      try {
        const transactionPromises = updatedUsers.flatMap((user) => [
          // Atualizar a senha do usuário
          this.prisma.secUser.update({
            where: { secuserid: user.secUserId },
            data: {
              secuserpassword: user.encryptedPassword,
              secusersenhaprovisoria: false,
            },
          }),

          // Inserir registro em SecUserPass
          this.prisma.secUserPass.create({
            data: {
              secuserid: user.secUserId,
              secuserpassdata: new Date(),
              secuserpassreg: user.encryptedPassword,
            },
          }),

          // Inserir registro em UsuOco
          this.prisma.usuOco.create({
            data: {
              usucod: user.secUserName,
              usudtaoco: new Date(),
              usutipoco: TypeOccurrency.TROCA_SENHA,
              usucoddes: '[...]',
              usumenoco: 'TROCA_SENHA',
            },
          }),
        ])

        // Executar todas as operações dentro de uma transação
        await this.prisma.$transaction(transactionPromises)
        return true
      } catch (error) {
        console.error('Erro ao atualizar usuários:', error)
        throw new Error(`Erro ao alterar a senha`)
      }
    } else {
      return false
    }
  }

  async update(userId: number, user: User): Promise<User | null> {
    const updatedUser = await this.prisma.secUser.update({
      where: { secuserid: userId },
      data: PrismaUsersMapper.toPrisma(user),
    })

    if (!updatedUser) return null

    return PrismaUsersMapper.toDomain(updatedUser)
  }

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
    console.log('Prisma User', user)
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
