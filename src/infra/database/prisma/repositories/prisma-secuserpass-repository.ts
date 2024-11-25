import { SecUserPassRepository } from 'src/domain/application/repositories/secuser-pass-repository'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaSecUserPassRepository implements SecUserPassRepository {
  constructor(private prisma: PrismaService) {}

  async isPasswordReusable(
    userId: number,
    newPassword: string,
    numberOfDays: number,
  ): Promise<boolean> {
    const today = new Date()
    const pastDate = new Date()
    pastDate.setDate(today.getDate() - numberOfDays)

    const result = await this.prisma.secUserPass.findFirst({
      where: {
        secuserid: userId,
        secuserpassdata: {
          gte: pastDate,
        },
      },
      orderBy: {
        secuserpassdata: 'desc',
      },
      take: 1,
    })

    return result !== null
  }

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
