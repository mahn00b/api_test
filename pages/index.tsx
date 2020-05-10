import React, {useState, useEffect} from 'react'
import Router from 'next/router'
import cookies from 'next-cookies'
import {AppProvider, TextField, DisplayText, Button} from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json'


Login.getInitialProps = function(ctx) {
    const { loggedIn } = cookies(ctx)

    return { loggedIn }
}

export default function Login({ loggedIn }) {
    const [username, setUser ] = useState('')
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (loggedIn)
            Router.push('/accounts')
    }, [])

    const login = async () => {
        const res = await fetch('/login', {
            method: 'POST',
            body: JSON.stringify({
                username,
                pass
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow'
        })

        const { error } = await res.json()

        if(error == 'failed user') return setError('User does not exist, please register')

        if (error == 'failed pass') return setError('Password is incorrect for this user')

        Router.push('/accounts')
    }

    return (
        <AppProvider i18n={translations}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem'}}>
                <div style={{marginBottom: '4rem'}}><DisplayText size="large" >Login Below:</DisplayText></div>
                {error !== '' && <div style={{ marginBottom: '1rem', color: 'red' }}><DisplayText size="small" >{error}</DisplayText></div>}
                <div style={{ marginBottom: '2rem' }}>
                    <TextField label="Username" value={username} onChange={setUser} />
                    <TextField label="Password" value={pass} type="password" onChange={setPass} />
                </div>
                <Button onClick={() => login()} >Submit</Button>
                <div style={{display: 'inline-block'}}>
                    <DisplayText size="small">Need to signup? <a href='/register'>Register</a></DisplayText>
                </div>
            </div>
        </AppProvider>
    )
}