import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const addressApiSlice = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/address`,
  }),
  tagTypes: ['Address'],
  endpoints: (builder) => ({
    getBalanceOfAddress: builder.query({
      query: (address) => `getBalance?address=${address}`,
    }),
  }),
})

// Auto-generated hooks (prepend `use`)
export const { useGetBalanceOfAddress } = addressApiSlice

export { addressApiSlice as addressApi }
