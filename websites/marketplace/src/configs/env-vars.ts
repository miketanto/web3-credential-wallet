export const isProduction: boolean = process.env.NODE_ENV === 'production'

export const AADClientId: string | undefined = process.env.REACT_APP_AAD_CLIENT_ID
export const AADObjectId: string | undefined = process.env.REACT_APP_AAD_OBJECT_ID
export const AADTenantId: string | undefined = process.env.REACT_APP_AAD_TENANT_ID