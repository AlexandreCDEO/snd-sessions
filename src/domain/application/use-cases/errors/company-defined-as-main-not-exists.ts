import { UseCaseError } from 'src/core/entities/use-case-error'

export class CompanyDefinedAsMainNotExistsError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Não existe empresa definida como principal. Verifique!')
  }
}
