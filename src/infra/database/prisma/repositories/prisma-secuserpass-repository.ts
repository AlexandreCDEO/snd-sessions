import { SecUserPassRepository } from 'src/domain/application/repositories/secuser-pass-repository'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaSecUserPassRepository implements SecUserPassRepository {
  constructor(private prisma: PrismaService) {}
  async searchByUserId(userId: number): Promise<Date | null> {
    const result = await this.prisma.secUserPass.findFirst({
      where: {
        secuserid: userId,
      },
      orderBy: {
        secuserpassdata: 'desc',
      },
      select: {
        secuserpassdata: true,
      },
    })

    return result?.secuserpassdata ?? null
  }
}
