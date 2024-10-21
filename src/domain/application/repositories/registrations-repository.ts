import { Registration } from 'src/domain/enterprise/entities/Registration'

export abstract class RegistrationsRepository {
  abstract findByDocument(document: string): Promise<Registration[]>
}
