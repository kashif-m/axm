import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Home from './components/Home'
import Login from './components/Login'

export default class Interface extends React.Component {

    constructor() {
        super()

        this.state = {
            loggedIn: false,
            uid: "",
            user: {}
        }
    }

    componentWillMount() {
        const localStorageRef = localStorage.getItem(`axiom-18`)
        if(localStorageRef) {
            let object = JSON.parse(localStorageRef)
            this.setState({
                uid: object.uid,
                user: object,
                loggedIn: true
            })
            // base.database().ref(`axiom-campaigners/${object.phoneNumber}_details/uid`)
                // .once('value')
                // .then((snapshot) => this.verifyUser(snapshot, object))
        }
    }

    verifyUser = (snapshot, object) => {
        if(snapshot.val()) {
            if(snapshot.val() === this.state.uid)
            this.setState({
                loggedIn: true,
                user: object
            })
        } else
            localStorage.removeItem(`axiom-18`)
    }

    catchResponse = (state, user) => {
        this.setState({
            loggedIn: state,
            user
        })
    }

    render() {
        return (
            <Router>
                <Switch>
                {
                    Object.keys(this.state.user).length !== 0 && this.state.loggedIn ?
                        <Route render={() => <Home
                                                isLoggedIn={this.state.loggedIn}
                                                campaigner={this.state.user}
                                            />}
                        />
                        :
                        <Route render={() => <Login
                                                isLoggedIn={this.state.loggedIn}
                                                sendResponse={this.catchResponse}
                                            />}
                        />
                }
                </Switch>
            </Router>
        )
    }
}
