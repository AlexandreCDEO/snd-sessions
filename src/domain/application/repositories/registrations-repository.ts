import { Registration } from 'src/domain/enterprise/entities/Registration'

export abstract class RegistrationsRepository {
  abstract findByDocument(
    companyId: number,
    document: string,
  ): Promise<Registration[]>
}
