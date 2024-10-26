import { SecuryPolicyType } from 'src/core/enums/security-policy-type'

export abstract class SecuryPoliciesRepository {
  abstract searchSecuryPolicyByType(
    empresaid: number,
    type: SecuryPolicyType,
  ): Promise<number | null>
}
