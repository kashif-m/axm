import React from 'react'
import WOW from 'wowjs'

import EventList from './EventList'

export default class Event extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            cash: 0,
            count: 0,
            events: {},
            showMembers: {}
        }
    }

    componentDidMount() {
        const wow = new WOW.WOW({
            live: false
        })
        wow.init()
    }

    greenBorder = (id) => {
        const ele = document.getElementById(id)
        ele.style.borderColor = "green"
    }

    normalBorder = (id, key, member) => {

        const ele = document.getElementById(id)
        let events = {...this.state.events}
        
        if(ele.value === "") {
            ele.style.borderColor = "gainsboro"

            try {
                delete events[key].members[`mem${member}`]

                this.setState({
                    events
                })
            } catch(error) {
                return
            }
        } else {
            events[key].members[`mem${member}`] = ele.value
            
            this.setState({
                events
            })
        }
    }

    updateEventList = (id, number) => {

        const ele = document.getElementById(id)
        let count = this.state.count
        let events = {...this.state.events}

        if(ele.checked) {

            count += 1
            events[ele.value] = {
                members: {},
                isRegistered: false
            }

            for(let i = 0; i < number; i++)
                events[ele.value].members[`mem${i+1}`] = 'empty'

            this.setState((prevState) => ({
                cash: prevState.cash + EventList[id].price
            }))

        } else {
            count -= 1
            delete events[ele.value]

            this.setState((prevState) => ({
                cash: prevState.cash - EventList[id].price
            }))
        }

        this.setState({
            count,
            events
        })

        if(ele.value !== 'blind-coding')
            this.alterMember(ele.value)
    }

    alterMember = (eventName) => {

        const showMembers = {...this.state.showMembers}
        showMembers[eventName] = !this.state.showMembers[eventName]
        
        this.setState({
            showMembers
        })
    }

    
    render() {
        return (
            <div className={this.props.class}>
                <h1 className="event-heading">Select Event(s)</h1>

                <div className="event-form wow slideInUp">

                    {
                        Object.keys(EventList)
                            .map(key => <div key={key} className={key}>
                                    <input id={key} type="checkbox" value={key}
                                        onChange={() => this.updateEventList(key, EventList[key].members)} />
                                    {EventList[key].eventName}

                                    {
                                        EventList[key].member === 2
                                        ?
                                            <div className="some">
                                            {
                                                this.state.showMembers[key]
                                                ?
                                                <input id={`${key}1`} type="text" className={EventList[key].class} placeholder='Team Member'
                                                        onFocus={() => this.greenBorder(`${key}1`)}
                                                        onBlur={() => this.normalBorder(`${key}1`, key, 1)} />
                                                : null
                                            }
                                            </div>
                                        : null
                                    }
                                    {
                                        EventList[key].member === 3
                                        ?
                                            <div className='some'>
                                                {
                                                    this.state.showMembers[key]
                                                    ?
                                                    <div className="bind-both">
                                                        <input id={`${key}1`} type="text" className={EventList[key].class} placeholder='Team Member 1'
                                                                onFocus={() => this.greenBorder(`${key}1`)}
                                                                onBlur={() => this.normalBorder(`${key}1`, key, 1)} />

                                                        <input id={`${key}2`} type="text" className={EventList[key].class} placeholder='Team Member 2'
                                                                onFocus={() => this.greenBorder(`${key}2`)}
                                                                onBlur={() => this.normalBorder(`${key}2`, key, 2)} />
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                        : null
                                    }
                                    {
                                        EventList[key].member === 4
                                        ?
                                            <div className='some'>
                                                {
                                                    this.state.showMembers[key]
                                                    ?
                                                    <div className="bind-both">
                                                        <input id={`${key}1`} type="text" className={EventList[key].class} placeholder='Team Member 1'
                                                                onFocus={() => this.greenBorder(`${key}1`)}
                                                                onBlur={() => this.normalBorder(`${key}1`, key, 1)} />

                                                        <input id={`${key}2`} type="text" className={EventList[key].class} placeholder='Team Member 2'
                                                                onFocus={() => this.greenBorder(`${key}2`)}
                                                                onBlur={() => this.normalBorder(`${key}2`, key, 2)} />
                                                        <input id={`${key}3`} type="text" className={EventList[key].class} placeholder='Team Member 3'
                                                                onFocus={() => this.greenBorder(`${key}3`)}
                                                                onBlur={() => this.normalBorder(`${key}3`, key, 3)} />
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                        : null
                                    }
                            </div>)
                    }

                </div>
                <button className="submit-form-button" onClick={() => this.props.showCheckPage(this.state.events, this.state.cash)} >Submit</button>
            </div>
        )
    }
}
