import React, { useState, useEffect } from 'react'
import cookies from 'next-cookies'
import Router from 'next/router'
import { AppProvider, TextField, DisplayText, Button } from '@shopify/polaris'
import translations from '@shopify/polaris/locales/en.json'

Register.getInitialProps = function (ctx) {
    const { loggedIn } = cookies(ctx)

    return { loggedIn }
}

export default function Register({ loggedIn }) {
    const [username, setUser] = useState('')
    const [pass, setPass] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (loggedIn)
            Router.push('/accounts')
    }, [])


    const register = async () => {
        if (username === '') return setError('Username Cannot be blank')

        if (pass !== confirm) return setError("Passwords don't match")

        await fetch('/newuser', {
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

        Router.push('/accounts')
    }

    return (
        <AppProvider i18n={translations}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem' }}>
                <div style={{ marginBottom: '4rem' }}><DisplayText size="large" >Register Below:</DisplayText></div>
                <div style={{ marginBottom: '1rem', color: 'red' }}><DisplayText size="small" >{error}</DisplayText></div>
                <div style={{ marginBottom: '2rem' }}>
                    <TextField label="Username" value={username} onChange={setUser} />
                    <TextField label="Password" value={pass} type="password" onChange={setPass} />
                    <TextField label="Confirm Password" value={confirm} type="password" onChange={setConfirm} />
                </div>
                <Button onClick={() => register()} >Submit</Button>
                <div style={{ display: 'inline-block' }}>
                    <DisplayText size="small">Already have an account? <a href='/'>Login</a></DisplayText>
                </div>
            </div>
        </AppProvider>
    )
}