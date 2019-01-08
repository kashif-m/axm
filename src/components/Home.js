import React from 'react'

import Main from './Main'
import NavBar from './NavBar'

export default class Home extends React.Component {
    render() {
        return (
            <div className="home-wrap">
                <NavBar isLoggedIn={this.props.isLoggedIn} />
                <Main campaigner={this.props.campaigner} />
            </div>
        )
    }
}
