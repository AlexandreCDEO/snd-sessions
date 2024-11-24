import { UseCaseError } from 'src/core/entities/use-case-error'

export class PasswordNoSpecialCharactersError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(
      'A senha deve conter apenas números e letras, sem caracteres especiais. Verifique!',
    )
  }
}
