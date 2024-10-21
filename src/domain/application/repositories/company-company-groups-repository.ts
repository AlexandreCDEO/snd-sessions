export abstract class CompanyCompanyGroupsRepository {
  abstract searchCompanyDefinedAsMain(
    grupoempresaid: number,
  ): Promise<number | null>
}
