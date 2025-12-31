type QueryParamValue = string | number | boolean;
type QueryParams = Record<string, QueryParamValue>;


export class QueryParamsBuilder {
  private params: QueryParams = {};

  addIfDefined(key: string, value: string | number | undefined): this {
    if (value !== undefined && value !== null && value !== '') {
      this.params[key] = value;
    }
    return this;
  }

  addArray(key: string, value: string[] | undefined): this {
    if (value && Array.isArray(value) && value.length > 0) {
      this.params[key] = value.join(',');
    }
    return this;
  }


  addArrayOrString(key: string, value: string | string[] | undefined): this {
    if (value !== undefined && value !== null) {
      this.params[key] = Array.isArray(value) ? value.join(',') : value;
    }
    return this;
  }


  addBoolean(key: string, value: boolean | undefined): this {
    if (value !== undefined && value !== null) {
      this.params[key] = value.toString();
    }
    return this;
  }


  build(): QueryParams {
    return this.params;
  }
}


export function createQueryBuilder(): QueryParamsBuilder {
  return new QueryParamsBuilder();
}


export function buildQueryParams(
  configurator: (builder: QueryParamsBuilder) => void
): QueryParams {
  const builder = new QueryParamsBuilder();
  configurator(builder);
  return builder.build();
}
