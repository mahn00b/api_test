import React, { useEffect, useState } from 'react'
import cookies from 'next-cookies'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'
import { AppProvider, Page, Card, DataTable, Button } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json'

interface Account {
  created_at: string
  first_name: string
  last_name: string
  credit_indicator: number
}

const SORTS: any = {
  'Created At': (mod: number = 1) => (a: Account, b: Account) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() * mod,
  'First Name': (mod: number = 1) => (a: Account, b: Account) => {
    if (a.first_name < b.first_name) { return -1 * mod; }
    if (a.first_name > b.first_name) { return 1 * mod; }
    return 0;
  },
  'Last Name': (mod: number = 1) => (a: Account, b: Account) => {
    if (a.last_name < b.last_name) { return -1 * mod; }
    if (a.first_name > b.first_name) { return 1 * mod; }
    return 0;
  },
  'Credit Rating': (mod: number = 1) => (a: Account, b: Account) => a.credit_indicator - b.credit_indicator * mod
}

Index.getInitialProps = async function (ctx) {
  const { loggedIn } = cookies(ctx)

  const res = await fetch('http://private-041255-sakura3.apiary-mock.com/applicants')
  const data = await res.json()

  return { loggedIn, data }
}


export default function Index({data, loggedIn}){
  const [{sorted, direction}, setSorted]: any = useState({sorted: null, direction: null})
  const headings = ['Created At', 'First Name', 'Last Name', 'Credit Rating']

  useEffect(() => {
    if(!loggedIn)
      Router.push('/')
  }, [])

  const logout = async () => {
    await fetch('/logout', {
      method: 'POST'
    })

    Router.push('/')
  }

  const rows = [...data]

  if(sorted)
    rows.sort(SORTS[sorted](direction === 'descending' ? -1 : 1))

  return(
    <AppProvider i18n={translations}>
      <Page title="Customer Credit Ratings">
        <div style={{marginBottom: '2rem'}}><Button onClick={() => logout()}>LOG OUT</Button></div>
        <Card>
          <DataTable
            sortable={[true, true, true, true]}
            columnContentTypes={[
              'text',
              'text',
              'text',
              'numeric'
            ]}

            headings={headings}
            rows={rows.map(row => [new Date(row['created_at']).toLocaleDateString(), row['first_name'], row['last_name'], row['credit_indicator']])}
            onSort={(heading_index: number, direction: string) => {
              setSorted({ sorted: headings[heading_index], direction})
            }}
          />
        </Card>
      </Page>
    </AppProvider>
  )
}