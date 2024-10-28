import { TypeOccurrency } from 'src/core/enums/type-occurrency'
import { UserOccurrenciesRepository } from 'src/domain/application/repositories/user-occurrencies-repository'
import { UserOccurrency } from 'src/domain/enterprise/entities/user-occurrency'
import { PrismaService } from '../prisma.service'
import { PrismaUserOccurrenciesMapper } from '../mappers/prisma-user-occurrencies-mapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaUserOccurrenciesRepository
  implements UserOccurrenciesRepository
{
  constructor(private prisma: PrismaService) {}
  async create(
    usuCod: string,
    usuDtaOco: Date,
    UsuTipOco: TypeOccurrency,
    UsuMenOco: string,
    UsuCodDes?: string,
  ): Promise<UserOccurrency | null> {
    const userOccurrency = await this.prisma.usuOco.create({
      data: {
        usucod: usuCod,
        usudtaoco: usuDtaOco,
        usutipoco: UsuTipOco,
        usucoddes: UsuMenOco,
        usumenoco: UsuMenOco,
        usuocotst: UsuCodDes,
      },
    })

    if (!userOccurrency) return null

    return PrismaUserOccurrenciesMapper.toDomain(userOccurrency)
  }
}
