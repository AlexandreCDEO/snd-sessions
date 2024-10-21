import { UseCaseError } from 'src/core/entities/use-case-error'

export class MainGroupOfCompaniesNotExistsError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Não existe grupo de empresas definido como principal. Verifique!')
  }
}
