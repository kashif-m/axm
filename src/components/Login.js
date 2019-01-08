import firebase from 'firebase'
import React from 'react'
import WOW from 'wowjs'

import base from '../firebase/base'
import NavBar from './NavBar'

export default class Login extends React.Component {

    constructor() {
        super()

        this.state = {
            err: "",
            name: "",
            showCodeField: false,
            wait: false
        }
    }

    componentDidMount() {
        let wow = new WOW.WOW({
            live: false
        })
        wow.init()
    }

    resetError = () => {
        this.setState({
            err: ""
        })
        this.code.style.borderColor = 'gainsboro'
    }

    signIn = () => {
        this.setState({
            wait: true
        })
        const phone = '+91' + this.phone.value
        const databaseRef = base.database().ref(`axiom-campaigners/${phone}_details`)

        databaseRef.once('value')
            .then((snapshot) => this.isRegistered(snapshot))
    }

    isRegistered = (snapshot) => {
        if(snapshot.val()) {
            this.setState({
                name: snapshot.val().name
            })
            this.initialiseRecaptcha()
        } else
            this.setState({
                wait: false,
                err: "Sorry, you are not registered for the CAMPAIGNING JOB."
            })
    }

    initialiseRecaptcha = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'recaptcha-container',
            {
                'size': 'invisible',
                'expired-callback': function() {
                    alert('Timed out. Please refresh your page.')
                }
            }
        )
        this.sendCode()
    }

    sendCode = () => {
        const phone = '+91' + this.phone.value
        const appVerifier = window.recaptchaVerifier
        firebase.auth().signInWithPhoneNumber(phone, appVerifier)
            .then(this.codeSent)
            .catch(this.handleError)
    }

    codeSent = (response) => {
        window.confirmationResult = response

        this.setState({
            wait: false,
            showCodeField: true
        })
    }

    verify = () => {
        const code = this.code

        if(code.value.length < 6 || code.value.length > 6) {
            code.style.borderColor = 'red'
            return
        }

        this.setState({
            wait: true
        })

        window.confirmationResult.confirm(code.value)
            .then((this.user))
            .catch(this.handleError)
    }

    user = () => {
        base.auth().onAuthStateChanged(this.getUser)
    }

    getUser = (user) => {
        if(user) {
            localStorage.setItem(`axiom-18`, JSON.stringify(user))
            firebase.database().ref(`/axiom-campaigners/${user.phoneNumber}_details/uid`).set(user.uid)
            this.setState({
                wait: false
            })
            this.props.sendResponse(true, user)
        }
    }

    handleError = (err) => {
        this.setState({
            wait: false,
            err: err.message
        })
    }

    render() {
        const receiveCode = this.state.showCodeField ? 'enter-code' : 'none'
        const login = this.state.showCodeField ? 'none' : 'wrap-campaigner'
        const waitClass = this.state.wait ? 'wait' : 'none'
        const errClass = this.state.err !== "" ? 'error' : 'none'
        return (
            <div className="wrap-login">
                <NavBar isLoggedIn={this.props.isLoggedIn} />

                <div className={waitClass}>
                    <div className="loader"></div>
                </div>

                <div className={login}>
                    <label className="phone-label__country">+91</label>
                    <input type="text" placeholder="Phone number" ref={(input) => this.phone = input}
                            maxLength="10" minLength="10" onFocus={this.resetError} />

                    <button className="login" onClick={this.signIn} >Login</button>
                </div>

                <div className={errClass}>
                    {this.state.err}
                </div>

                <div id="recaptcha-container">
                </div>

                <div className={receiveCode}>
                    <input type="text" ref={(input) => this.code = input} onFocus={this.resetError}
                            maxLength="6" minLength="6" placeholder="6 digit code" />
                    <button onClick={this.verify}>Submit</button>
                </div>

            </div>
        )
    }
}
