import { SecuryPoliciesRepository } from 'src/domain/application/repositories/secury-policies-repository'
import { PrismaService } from '../prisma.service'
import { SecuryPolicyType } from 'src/core/enums/security-policy-type'

export class PrismaSecuryPoliciesRepository
  implements SecuryPoliciesRepository
{
  constructor(private prisma: PrismaService) {}
  async searchSecuryPolicyByType(
    empresaid: number,
    type: SecuryPolicyType,
  ): Promise<number | null> {
    const result = await this.prisma.polSegNro.findFirst({
      where: {
        empresaid,
        empresatipopoliticaseg: type,
      },
      select: {
        empresaautenticawindowsseg: true,
      },
    })

    return result?.empresaautenticawindowsseg ?? null
  }
}
