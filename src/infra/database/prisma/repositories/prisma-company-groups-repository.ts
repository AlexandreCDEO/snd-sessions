import { CompanyGroupsRepository } from 'src/domain/application/repositories/company-groups-repository'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaCompanyGroupsRepository implements CompanyGroupsRepository {
  constructor(private prisma: PrismaService) {}
  async searchMainGroupOfCompanies(): Promise<number | null> {
    const companyGroup = await this.prisma.grupoEmpresa.findFirst({
      where: {
        grupoempresaprincipal: true,
      },
    })

    if (!companyGroup) return null

    return companyGroup.grupoempresaid
  }
}
