export abstract class CompanyGroupsRepository {
  abstract searchMainGroupOfCompanies(): Promise<number | null>
}
