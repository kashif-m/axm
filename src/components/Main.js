import firebase from 'firebase'
import React from 'react'
import WOW from 'wowjs'

import base from '../firebase/base'
import Event from './Event'
import EventList from './EventList'

export default class Main extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            cash: 0,
            college: "",
            disable: false,
            email: "",
            err: "",
            events: {},
            name: "",
            passkey: {},
            phone: "",
            registeredFor: 0,
            result: {},
            semester: 0,
            showCheckPage: false,
            showForm: true,
            showRecaptchaDiv: false,
            showUploaded: false,
            showVerificationBox: false,
            temp: "",
            wrongCode: false
        }
    }

    componentDidMount() {
        document.getElementById("main-form").reset()
        const wow = new WOW.WOW({
            live: false
        })
        wow.init()
    }

    greenBorder = (identifier) => {
        identifier.style.borderColor = "green"
    }

    normalBorder = (identifier) => {
        if(identifier.value === "") {
            identifier.style.borderColor = "gainsboro"
            return
        }
        identifier.style.borderColor = "rgb(31, 73, 31)"
    }

    showCheckPage = (events, cash) => {

        if(Object.keys(events).length === 0) {
            alert('Please select at least one event.')
            return
        }

        let phone = "+91" + this.phone.value
        if(this.phone.value.length < 10) {
            this.phone.style.borderColor = "red"
            return
        }
        if(phone === this.props.campaigner.phoneNumber) {
            alert('You cannot register yourself.')
            return
        }

        let name = this.name.value
        if(name === "") {
            this.name.style.borderColor = "red"
            return
        }

        let email = this.email.value
        if(email === "") {
            this.email.style.borderColor = "red"
            return
        }

        let college = this.college.value
        if(college === "") {
            this.college.style.borderColor = "red"
            return
        }

        let semester = this.semester.value
        if(semester === "") {
            this.semester.style.borderColor = "red"
            return
        }

        this.setState({
            cash,
            college,
            email,
            events,
            name,
            phone,
            registeredFor: 0,
            semester,
            showCheckPage: true,
            showForm: false
        })
    }

    backToForm = () => {
        this.setState({
            alreadyRegistered: false,
            showCheckPage: false,
            showForm: true
        })
    }

    checkUserRegistered = (event) => {
        event.preventDefault()

        this.setState({
            disable: true            
        })
        Object.keys(this.state.events)
            .map((key) => this.toCheck(key))

        setTimeout(() => this.goNext(), 3000) //not gonna work for slow af connections; delay of 3s.
    }

    toCheck = (key) => {

        let databaseRef = firebase.database().ref(`/event-registrations/${key}/participants/${this.state.phone}_details`)
        databaseRef.once('value')
            .then((snapshot) => this.confirmUserRegistered(snapshot, key))
    }

    confirmUserRegistered = (snapshot, key) => {

        if(snapshot.val() !== null) {
            let events = {...this.state.events}
            let registeredFor = this.state.registeredFor

            registeredFor++
            events[key].isRegistered = true

            this.setState({
                events,
                registeredFor
            })
        }
    }

    goNext = () => {

        if(this.state.registeredFor === 0) {
            this.initialiseRecaptcha()
        } else {
            this.setState({
                alreadyRegistered: true    ,
                disable: false,
                showCheckPage: false
            })
        }
    }

    initialiseRecaptcha = () => {
        document.getElementById("main-form").reset()
        
        this.setState({
            showCheckPage: false,
            showRecaptchaDiv: true
        })
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'recaptcha-container',
            {
                'size': 'invisible',
                'callback': this.verified,
                'expired-callback': function() {
                    alert('Timed out. Please refresh your page.')
                }
            }
        )
        this.sendCode()
    }

    verified = () => {
        this.setState({
            showRecaptchaDiv: false,
        })
    }

    sendCode = () => {
        
        const phoneNumber = this.state.phone
        const appVerifier = window.recaptchaVerifier
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(this.codeSent)
            .catch(this.codeNotSent)
    }

    codeSent = (confirmationResult) => {
        window.confirmationResult = confirmationResult
        this.setState({
            disable: false,
            showVerificationBox: true
        })
    }

    codeNotSent = (err) => {
        
        this.setState({
            disable: false,
            err,
            showVerificationBox: false,
            wrongCode: true
        })
    }
    

    verifyUser = () => {

        const code = this.code
        if(code.value.length < 6) {
            code.style.borderColor = "red"
            return
        }

        this.setState({
            disable: true,
            wrongCode: false
        })

        window.confirmationResult.confirm(code.value)
            .then(this.codeCorrect)
            .catch(this.wrongCode)
    }

    codeCorrect = (result) => {
        this.setState({
            disable: false,
            result: result,
            wrongCode: false
        })

        this.sendCustomSMS()
    }

    wrongCode = (err) => {

        this.setState({
            disable: false,
            err,
            wrongCode: true
        })
    }

    sendCustomSMS = () => {
        firebase.auth().onAuthStateChanged(this.deleteUser)
        Object.keys(this.state.events)
            .map((key) => this.sendSMS(key))
    }

    deleteUser = (user) => {
        if(user)
            user.delete()
    }

    sendSMS = (key) => {

        const fancyWord = 'passkey'
        const passkey = {...this.state.passkey}
        const randomCode = this.randomCode(EventList[key].eventName)
        passkey[key] = randomCode
        this.setState({
            passkey
        })

        var xml = new XMLHttpRequest()
        const apiKey = '8fa5b57e-1d3d-11e8-a895-0200cd936042'
        xml.withCredentials = true
        xml.open("GET", "https://2factor.in/API/R1/?module=TRANS_SMS" +
                "&apikey=" + apiKey +
                "&to=" + this.state.phone +
                "&from=AXIOMF&templatename=axiom-registration" +
                "&var1=" + this.state.name +
                "&var2=" + fancyWord +
                "&var3=" + EventList[key].eventName +
                "&var4=" + randomCode)
        
        xml.send()

        this.upload(key)
    }

    randomCode = (event) => {
        let digital = 0
        for(let i = 0; i < event.length - 1; i++)
            digital += event.charCodeAt(i)

        let code = this.state.phone.slice(6, 12)
        code *= code * digital
        code = code.toString().slice(-5, -1)

        return code
    }

    upload = (key) => {

        const databaseRef = base.database().ref(`/event-registrations/${key}/participants/${this.state.phone}_details`)
        const databaseRefC = base.database().ref(`/axiom-campaigners/${this.props.campaigner.phoneNumber}_details`)
        const databaseRefL = base.database().ref(`list/${key}/${this.state.phone}`)
        const databaseRef1 = base.database().ref(`/1stYear/${this.state.name}`)
        const time = Date.now()

        databaseRef.set({
            college: this.state.college,
            email: this.state.email,
            eventName: EventList[key].eventName,
            members: this.state.events[key].members,
            name: this.state.name,
            passkey: this.state.passkey[key],
            phoneNumber: this.state.phone,
            semester: this.state.semester,
            uid: this.state.result.user.uid,
            recruitedBy: {
                name: this.props.campaigner.displayName,
                phone: this.props.campaigner.phoneNumber
            }
        })

        databaseRefC.child(`recruited/${time}`).set({
            event: EventList[key].eventName,
            name: this.state.name,
            phone: this.state.phone
        })

        databaseRefL.set({
            email: this.state.email
        })

        if(this.state.semester === 2 || this.state.semester === '2')
            databaseRef1.set({
                event: EventList[key].eventName,
                phone: this.state.phone
            })

        this.setState({
            disable: false,
            showUploaded: true,
            showVerificationBox: false
        })
    }

    toHome = () => {
        window.location.reload()
    }

    renderEvent = (key) => {
        return (
            <li className="opted-events" key={key}>
            {
                EventList[key].eventName
            }
            </li>
        )
    }


    render() {
        const alreadyRegisteredClass = this.state.alreadyRegistered ? "already-registered-wrap" : "none"
        const checkPageClass = this.state.showCheckPage ? "check-wrap" : "none"
        const formWrapClass = this.state.showForm ? 'form wow slideInUp' : 'none'
        const recaptchaClass = this.state.showRecaptchaDiv ? "recaptcha-container" : "none"
        const uploadedClass = this.state.showUploaded ? "upload-wrap" : "none"
        const verificationBoxClass = this.state.showVerificationBox ? "verification-wrap" : "none"
        const waitClass = this.state.disable ? "wait" : "none"

        let email = this.state.email
        let name = this.state.name
        let phone = this.state.phone

        return (
            <div className="main-wrap">
                <div className={waitClass}>
                    <div className="loader"></div>
                </div>

                <div className={formWrapClass} data-wow-duration=".5s">
                    <form className='main-form' id="main-form">
                        <h1 className="main-heading">Participant details</h1>
                        <label className="name-label">Name:</label>
                        <input type="text" className="name-input" placeholder="Name"
                                maxLength="32" minLength="3" ref={(input) => this.name = input}
                                onFocus={() => this.greenBorder(this.name)} onBlur={() => this.normalBorder(this.name)} />

                        <label className="phone-label">Phone: </label>
                        <label className="phone-label__country">+91</label>
                        <input type="phone" className="phone-input" placeholder="Phone number"
                                maxLength="10" minLength="10" ref={(input) => this.phone = input}
                                onBlur={() => this.normalBorder(this.phone)} onFocus={() => this.greenBorder(this.phone)}/>

                        <label className="email-label">E-mail:</label>
                        <input type="email" className="email-input" placeholder="E-mail"
                                ref={(input) => this.email = input}
                                onBlur={() => this.normalBorder(this.email)} onFocus={() => this.greenBorder(this.email)}/>

                        <label className="college-label">College:</label>
                        <input type="text" className="college-input" placeholder="College"
                                ref={(input) => this.college = input}
                                onBlur={() => this.normalBorder(this.college)} onFocus={() => this.greenBorder(this.college)}/>

                        <label className="year-label">Semester: </label>
                        <input type="text" className="year-input" placeholder="Semester"
                                maxLength="1" minLength="1"
                                ref={(input) => this.semester = input}
                                onBlur={() => this.normalBorder(this.semester)} onFocus={() => this.greenBorder(this.semester)}/>
                    </form>

                    <Event showCheckPage={this.showCheckPage} class="wrap-event" data-wow-duration='.6s'/>
                </div>

                <div className={checkPageClass}>
                    <label className="name-label">Name: {name}</label>
                    <label className="phone-label">Phone: {phone}</label>
                    <label className="email-label">{email}</label>
                    <label className="cash-label">Collect Rs. {this.state.cash}</label>

                    <ul className="event-div">
                        {
                            Object.keys(this.state.events)
                                .map(key => this.renderEvent(key))
                        }
                    </ul>

                    <button className="back-to-form" onClick={this.backToForm}>Back</button>
                    <button className="authenticate-button" onClick={(event) => this.checkUserRegistered(event)}>Submit</button>
                </div>

                <div className={alreadyRegisteredClass}>
                    <ul>
                        Sorry, {this.state.phone} is already registered for the following event(s)
                        {
                            Object.keys(this.state.events)
                                .map(key =>
                                    this.state.events[key].isRegistered ?
                                        <li key={key}>{EventList[key].eventName}</li>
                                    : null
                                )
                        }
                    </ul>
                     <button className="back-to-form" onClick={this.backToForm} >Back</button>
                </div>

                <div id="recaptcha-container" className={recaptchaClass}>
                </div>

                <div className={verificationBoxClass}>
                    <input type="phone" className="verification-code" ref={(input) => this.code = input}
                            placeholder="6 digit code" maxLength="6" minLength="6"/>
                    <button className="verify-code-button" onClick={this.verifyUser} >Verify</button>
                </div>

                {this.state.wrongCode ? <div className="wrong-code">{this.state.err.message}</div> : null}

                <div className={uploadedClass}>
                    <div>
                        {this.state.name} was successfully registered for the upcoming following event(s)
                        <div className="registered-wrap">
                            {
                                Object.keys(this.state.events)
                                    .map(key => <li key={key}>
                                            {EventList[key].eventName}
                                        </li>)
                            }
                        </div>
                    </div>
                    <button onClick={this.toHome}>HOME</button>
                </div>
            </div>
        )
    }
}
