import React from 'react'
import WOW from 'wowjs'
import firebase from 'firebase'

export default class NavBar extends React.Component {

    componentDidMount() {
        let wow = new WOW.WOW({
            live: false
        })
        wow.init()
    }

    signOut = () => {
        firebase.auth().signOut()
        localStorage.removeItem('axiom-18')
        window.location.reload()
    }

    render() {
        const buttonClass = this.props.isLoggedIn ? 'sign-out' : 'none'
        return (
            <div className="nav-wrap wow slideInDown">
                <img src={require('../images/exit.svg')} alt="Hey" onClick={this.signOut} className={buttonClass}/>
                <div className="logo">
                </div>
            </div>
        )
    }
}
