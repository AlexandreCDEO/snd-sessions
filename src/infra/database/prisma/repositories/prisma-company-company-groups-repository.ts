import { Injectable } from '@nestjs/common'
import { CompanyCompanyGroupsRepository } from 'src/domain/application/repositories/company-company-groups-repository'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCompanyCompanyGroupsRepository
  implements CompanyCompanyGroupsRepository
{
  constructor(private prisma: PrismaService) {}
  async searchCompanyDefinedAsMain(
    grupoempresaid: number,
  ): Promise<number | null> {
    const company = await this.prisma.grupoEmpresaEmpresa.findFirst({
      where: {
        grupoempresaid,
        empresaprincipal: true,
      },
    })

    if (!company) return null

    return company.empresaid
  }
}
